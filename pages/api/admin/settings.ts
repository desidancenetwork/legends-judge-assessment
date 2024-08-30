import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSideSettings, updateServerSideSettings } from '../../../utils/serverSettings';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const settings = getServerSideSettings();
    res.status(200).json(settings);
  } else if (req.method === 'POST') {
    try {
      const updatedSettings = updateServerSideSettings(req.body);
      res.status(200).json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}