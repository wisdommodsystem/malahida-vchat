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
      const { approved } = req.query;
      
      const query: any = {};
      if (approved !== undefined) {
        query.approved = approved === 'true';
      }

      const articles = await Article.find(query).sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: articles });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

