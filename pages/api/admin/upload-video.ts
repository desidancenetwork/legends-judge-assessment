import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { put, list, del } from '@vercel/blob';
import { getSettings } from '../../../utils/kvUtils';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const form = new IncomingForm({
      maxFileSize: 200 * 1024 * 1024, // 200MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Error uploading video', error: err.message });
      }

      const file = Array.isArray(files.video) ? files.video[0] : files.video;
      if (!file) {
        return res.status(400).json({ message: 'No video file uploaded' });
      }

      const slotId = Array.isArray(fields.slotId) ? fields.slotId[0] : fields.slotId;
      if (!slotId) {
        return res.status(400).json({ message: 'Missing slotId' });
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
        const fileStream = fs.createReadStream(file.filepath);
        const blob = await put(fileName, fileStream, {
          access: 'public',
          addRandomSuffix: false,
        });

        // Clean up the temporary file
        fs.unlinkSync(file.filepath);

        res.status(200).json({ 
          message: 'Video uploaded successfully', 
          video: { 
            id: slotId, 
            fileName: blob.pathname, 
            originalName: file.originalFilename, 
            url: blob.url 
          } 
        });
      } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        res.status(500).json({ message: 'Error uploading video', error: (error as Error).message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}