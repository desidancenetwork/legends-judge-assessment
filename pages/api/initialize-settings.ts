import { NextApiRequest, NextApiResponse } from 'next';
import { updateSettings } from '../../utils/kvUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const initialSettings = {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://ddn-legends-judge-assessment.vercel.app/api",
        assessment: {
          additionalTime: 300,
          totalVideos: 3,
          rankingTime: 1200
        },
        googleDrive: {
          folderId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID ?? "root"
        }
    };

    try {
      await updateSettings(initialSettings);
      res.status(200).json({ message: 'Settings initialized successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize settings' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}