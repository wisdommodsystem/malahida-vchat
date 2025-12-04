import type { NextApiRequest, NextApiResponse } from 'next';
import { getLatestVideos, getAllChannelVideos } from '@/utils/youtube';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { limit, all } = req.query;
      const maxResults = limit ? parseInt(limit as string) : 6;

      const videos = all === 'true' 
        ? await getAllChannelVideos(maxResults)
        : await getLatestVideos(maxResults);

      return res.status(200).json({ success: true, data: videos });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

