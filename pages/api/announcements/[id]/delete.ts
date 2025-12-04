import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const announcement = await Announcement.findByIdAndDelete(id);

      if (!announcement) {
        return res.status(404).json({ success: false, error: 'Announcement not found' });
      }

      return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

