import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { invalidateSitemap, pingGoogleSitemap } from '@/lib/seo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { approved, limit } = req.query;
      
      const query: any = {};
      if (approved !== undefined) {
        query.approved = approved === 'true';
      } else {
        // Default: only show approved articles for public
        query.approved = true;
      }

      const limitNum = limit ? parseInt(limit as string) : 100;

      const articles = await Article.find(query)
        .sort({ createdAt: -1 })
        .select('-content')
        .limit(limitNum);

      return res.status(200).json({ success: true, data: articles });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, author, imageUrl } = req.body;

      if (!title || !content || !author) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const article = await Article.create({
        title,
        content,
        author,
        imageUrl,
        approved: false,
      });

      // Respond immediately, then asynchronously update SEO
      res.status(201).json({ success: true, data: article });
      try {
        invalidateSitemap();
        pingGoogleSitemap();
      } catch {}
      return;
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

