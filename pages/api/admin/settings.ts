import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { normalizeSettings, validateSettings } from '../../../utils/settings';
import { saveSettings } from '../../../utils/settingsStore';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const settings = normalizeSettings(req.body);
  const validationError = validateSettings(settings);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await saveSettings(settings);
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
}
