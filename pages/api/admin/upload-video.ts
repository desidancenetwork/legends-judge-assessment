import { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';
import { getSettings } from '../../../utils/kvUtils';

export const config = {
  api: {
    bodyParser: true,
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
    const { action, slotId, fileName, contentType } = req.body;

    if (!action || !slotId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const settings = await getSettings();
    const totalVideos = settings.assessment.totalVideos;
    const slotNumber = parseInt(slotId);

    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > totalVideos) {
      return res.status(400).json({ message: 'Invalid slotId' });
    }

    try {
      if (action === 'getUploadUrl') {
        if (!fileName || !contentType) {
          return res.status(400).json({ message: 'Missing fileName or contentType' });
        }

        const { url: uploadUrl, pathname } = await put(`video${slotId}_${fileName}`, Buffer.from(''), {
          contentType,
          access: 'public',
          addRandomSuffix: false,
        });

        res.status(200).json({ uploadUrl, pathname });
      } else if (action === 'confirmUpload') {
        if (!fileName) {
          return res.status(400).json({ message: 'Missing fileName' });
        }

        // Delete existing video for this slot, if any
        const { blobs } = await list();
        const existingBlob = blobs.find(blob => blob.pathname.startsWith(`video${slotId}_`));
        if (existingBlob && existingBlob.pathname !== fileName) {
          await del(existingBlob.url);
        }

        const confirmedBlob = blobs.find(blob => blob.pathname === fileName);
        if (!confirmedBlob) {
          return res.status(404).json({ message: 'Uploaded file not found' });
        }

        res.status(200).json({ 
          message: 'Video upload confirmed', 
          video: { 
            id: slotId, 
            fileName, 
            originalName: fileName.split('_')[1], 
            url: confirmedBlob.url 
          } 
        });
      } else {
        res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ message: 'Error processing request', error: (error as Error).message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}