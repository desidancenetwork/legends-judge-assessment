import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { getServerSideSettings } from '../../../utils/serverSettings';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const files = fs.readdirSync(UPLOADS_DIR);
      const videos = files
        .filter(file => file.startsWith('video'))
        .map(fileName => {
          const [slotId, originalName] = fileName.split('_');
          return {
            id: slotId.replace('video', ''),
            fileName,
            originalName,
            publicPath: `/uploads/${fileName}`,
          };
        });
      res.status(200).json({ videos });
    } catch (error) {
      console.error('Error retrieving videos:', error);
      res.status(500).json({ message: 'Error retrieving videos', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const settings = getServerSideSettings();
    const totalVideos = settings.assessment.totalVideos;

    const form = new IncomingForm({
      uploadDir: UPLOADS_DIR,
      keepExtensions: true,
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

      // Remove existing video for this slot, if any
      const existingFiles = fs.readdirSync(UPLOADS_DIR);
      const existingFile = existingFiles.find(f => f.startsWith(`video${slotId}_`));
      if (existingFile) {
        fs.unlinkSync(path.join(UPLOADS_DIR, existingFile));
      }

      const oldPath = file.filepath;
      const fileName = `video${slotId}_${file.originalFilename}`;
      const newPath = path.join(UPLOADS_DIR, fileName);

      fs.renameSync(oldPath, newPath);

      const publicPath = `/uploads/${fileName}`;

      res.status(200).json({ 
        message: 'Video uploaded successfully', 
        video: { 
          id: slotId, 
          fileName, 
          originalName: file.originalFilename, 
          publicPath 
        } 
      });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}