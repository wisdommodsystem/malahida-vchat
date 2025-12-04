import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Video from '@/models/Video';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Check if category has videos
      const videosCount = await Video.countDocuments({ category: id });
      if (videosCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot delete category. It has ${videosCount} video(s). Please delete or move videos first.` 
        });
      }

      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }

      return res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

