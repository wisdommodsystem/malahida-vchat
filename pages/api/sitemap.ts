import type { NextApiRequest, NextApiResponse } from 'next';
import { getSitemapXmlCached } from '@/lib/seo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const xml = await getSitemapXmlCached();
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error: any) {
    return res.status(500).send('Failed to generate sitemap');
  }
}
