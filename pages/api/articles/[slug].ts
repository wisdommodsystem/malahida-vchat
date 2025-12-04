import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const article = await Article.findOne({ slug, approved: true });

      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      // Increment view count
      article.views += 1;
      await article.save();

      return res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

