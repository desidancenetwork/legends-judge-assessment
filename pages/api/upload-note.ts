import type { NextApiRequest, NextApiResponse } from 'next';
import { MAX_NOTE_FILES, MAX_NOTE_UPLOAD_BYTES } from '../../utils/constants';
import { uploadFile } from '../../utils/googleDrive';
import { readUploadTicket } from '../../utils/uploadTicket';

// The file arrives as the raw request body (one file per request) so nothing is base64-inflated.
export const config = {
  api: {
    bodyParser: false,
  },
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
};

async function readBody(req: NextApiRequest, limit: number): Promise<Buffer | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      return null;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const ticket = readUploadTicket(String(req.headers['x-upload-ticket'] ?? ''));
  if (!ticket) {
    return res.status(401).json({ message: 'This upload link has expired.' });
  }

  const mimeType = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  const extension = EXTENSIONS[mimeType];
  if (!extension) {
    return res.status(415).json({ message: 'Only images and PDFs can be uploaded.' });
  }

  const index = Number(req.query.index);
  if (!Number.isInteger(index) || index < 1 || index > MAX_NOTE_FILES) {
    return res.status(400).json({ message: 'Invalid file number.' });
  }

  if (Number(req.headers['content-length'] ?? 0) > MAX_NOTE_UPLOAD_BYTES) {
    return res.status(413).json({ message: 'File is too large.' });
  }
  const body = await readBody(req, MAX_NOTE_UPLOAD_BYTES);
  if (!body) {
    return res.status(413).json({ message: 'File is too large.' });
  }
  if (body.length === 0) {
    return res.status(400).json({ message: 'File is empty.' });
  }

  try {
    await uploadFile(ticket.folderId, `${ticket.baseName}_note${index}.${extension}`, mimeType, body);
    res.status(200).json({ message: 'Uploaded' });
  } catch (error) {
    console.error('Error uploading handwritten note:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
}
