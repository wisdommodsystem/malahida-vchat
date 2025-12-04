import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: announcements });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const { title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({ success: false, error: 'Title and message are required' });
      }

      const announcement = await Announcement.create({ title, message, active: true });
      return res.status(201).json({ success: true, data: announcement });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

