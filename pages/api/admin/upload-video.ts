import { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';
import { getSettings } from '../../../utils/kvUtils';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list();
      const videos = blobs
        .filter(blob => blob.pathname.startsWith('video'))
        .map(blob => {
          const [slotId, originalName] = blob.pathname.split('_');
          return {
            id: slotId.replace('video', ''),
            fileName: blob.pathname,
            originalName,
            url: blob.url,
          };
        });
      res.status(200).json({ videos });
    } catch (error) {
      console.error('Error retrieving videos:', error);
      res.status(500).json({ message: 'Error retrieving videos', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    const settings = await getSettings();
    const totalVideos = settings.assessment.totalVideos;

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form', error: err.message });
      }

      const slotId = Array.isArray(fields.slotId) ? fields.slotId[0] : fields.slotId;
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!slotId || !file) {
        return res.status(400).json({ message: 'Missing slotId or file' });
      }

      const slotNumber = parseInt(slotId);
      if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > totalVideos) {
        return res.status(400).json({ message: 'Invalid slotId' });
      }

      try {
        // Delete existing video for this slot, if any
        const { blobs } = await list();
        const existingBlob = blobs.find(blob => blob.pathname.startsWith(`video${slotId}_`));
        if (existingBlob) {
          await del(existingBlob.url);
        }

        // Upload new video
        const fileName = `video${slotId}_${file.originalFilename}`;
        const fileBuffer = fs.readFileSync(file.filepath);
        const { url } = await put(fileName, fileBuffer, {
          access: 'public',
          addRandomSuffix: false,
        });

        res.status(200).json({ 
          message: 'Video uploaded successfully', 
          video: { 
            id: slotId, 
            fileName, 
            originalName: file.originalFilename, 
            url 
          } 
        });
      } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ message: 'Error uploading video', error: (error as Error).message });
      } finally {
        // Clean up the temporary file
        fs.unlinkSync(file.filepath);
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}