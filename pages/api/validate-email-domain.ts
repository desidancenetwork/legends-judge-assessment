import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { domain } = req.query;

  if (!domain ?? typeof domain !== 'string') {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  try {
    await new Promise((resolve, reject) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    res.status(200).json({ isValid: true });
  } catch (error) {
    console.error('Error resolving MX records:', error);
    res.status(200).json({ isValid: false });
  }
}