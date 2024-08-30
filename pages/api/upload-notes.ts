import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFileToDrive } from '../../utils/googleDrive';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const file = Array.isArray(files.notes) ? files.notes[0] : files.notes;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const content = await fs.promises.readFile(file.filepath);
      const fileId = await uploadFileToDrive(
        content,
        file.originalFilename || 'handwritten_notes.pdf',
        file.mimetype || 'application/pdf'
      );

      res.status(200).json({ message: 'Notes uploaded successfully', fileId });
    } catch (error) {
      console.error('Error uploading notes:', error);
      res.status(500).json({ message: 'Error uploading notes' });
    } finally {
      // Clean up the temp file
      await fs.promises.unlink(file.filepath);
    }
  });
}