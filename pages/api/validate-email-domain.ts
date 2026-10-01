import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as dns } from 'dns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { domain } = req.query;

  if (typeof domain !== 'string' || !/^[a-z0-9.-]{1,253}$/i.test(domain)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  try {
    const records = await dns.resolveMx(domain);
    res.status(200).json({ isValid: records.length > 0 });
  } catch (error) {
    // Only reject domains that definitely can't receive mail; a DNS hiccup shouldn't block a judge from registering.
    const code = (error as NodeJS.ErrnoException).code;
    res.status(200).json({ isValid: code !== 'ENOTFOUND' && code !== 'ENODATA' });
  }
}
