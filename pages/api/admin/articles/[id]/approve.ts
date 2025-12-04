import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAuth } from '@/lib/auth';
import { invalidateSitemap } from '@/lib/seo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { approved } = req.body;

      const article = await Article.findById(id);

      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      article.approved = approved !== undefined ? approved : true;
      await article.save();
      try { invalidateSitemap(); } catch {}

      return res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

