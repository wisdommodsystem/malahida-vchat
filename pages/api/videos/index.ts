import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { category } = req.query;
      
      const query: any = {};
      if (category) {
        query.category = category;
      }

      const videos = await Video.find(query)
        .sort({ createdAt: -1 })
        .limit(100);

      return res.status(200).json({ success: true, data: videos });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const { title, youtubeUrl, description, category } = req.body;

      if (!title || !youtubeUrl || !category) {
        return res.status(400).json({ success: false, error: 'Title, YouTube URL, and category are required' });
      }

      // Extract YouTube ID from URL
      const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      let youtubeId = '';
      let thumbnail = '';

      const match = youtubeUrl.trim().match(youtubeIdRegex);
      if (match && match[1]) {
        youtubeId = match[1];
        thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      } else {
        // Try alternative method: extract from v= parameter
        const urlParts = youtubeUrl.trim().split(/[?&]/);
        for (const part of urlParts) {
          if (part.startsWith('v=')) {
            const id = part.substring(2).split('&')[0];
            if (id.length === 11) {
              youtubeId = id;
              thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
              break;
            }
          }
        }
      }

      if (!youtubeId) {
        return res.status(400).json({ success: false, error: 'Invalid YouTube URL. Please provide a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)' });
      }

      // Create video object with all required fields
      const videoData: any = {
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeId: youtubeId,
        thumbnail: thumbnail,
        category: category.trim(),
      };

      if (description) {
        videoData.description = description.trim();
      }

      const video = await Video.create(videoData);

      return res.status(201).json({ success: true, data: video });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

