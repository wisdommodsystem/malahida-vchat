import type { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    removeTokenCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

