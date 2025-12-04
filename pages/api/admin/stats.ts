import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const auth = await requireAuth(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    try {
      const totalArticles = await Article.countDocuments();
      const approvedArticles = await Article.countDocuments({ approved: true });
      const pendingArticles = await Article.countDocuments({ approved: false });
      const totalViewsResult = await Article.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]);

      const stats = {
        totalArticles,
        approvedArticles,
        pendingArticles,
        totalViews: totalViewsResult[0]?.total || 0,
      };

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
