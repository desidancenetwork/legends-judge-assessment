// pages/api/admin/settings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { updateSettings } from '../../../utils/kvUtils';
import { AdminSettings } from '../../../types/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const newSettings: AdminSettings = req.body;
      await updateSettings(newSettings);
      res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}