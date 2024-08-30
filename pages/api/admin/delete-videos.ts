import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { newTotalVideos } = req.body;

  if (typeof newTotalVideos !== 'number' || newTotalVideos < 0) {
    return res.status(400).json({ message: 'Invalid newTotalVideos value' });
  }

  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const videoFiles = files.filter(file => file.startsWith('video'));

    videoFiles.sort((a, b) => {
      const aNum = parseInt(a.split('_')[0].replace('video', ''));
      const bNum = parseInt(b.split('_')[0].replace('video', ''));
      return aNum - bNum;
    });

    for (let i = newTotalVideos; i < videoFiles.length; i++) {
      fs.unlinkSync(path.join(UPLOADS_DIR, videoFiles[i]));
    }

    res.status(200).json({ message: 'Excess videos deleted successfully' });
  } catch (error) {
    console.error('Error deleting excess videos:', error);
    res.status(500).json({ message: 'Error deleting excess videos', error: (error as Error).message });
  }
}