import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { title, youtubeUrl, description, category } = req.body;

      const video = await Video.findById(id);

      if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }

      if (title !== undefined) video.title = title;
      if (youtubeUrl !== undefined) video.youtubeUrl = youtubeUrl;
      if (description !== undefined) video.description = description;
      if (category !== undefined) video.category = category;

      await video.save();

      return res.status(200).json({ success: true, data: video });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

