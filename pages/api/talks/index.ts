import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import TalkModel, { ITalk } from '../../../models/Talk';

interface ApiComment {
  id: string;
  nickname: string;
  text: string;
  date: string;
}

interface ApiTalk {
  id: string;
  title: string;
  text: string;
  nickname: string;
  category: string;
  visibility: 'public' | 'private';
  date: string;
  likes: number;
  comments: ApiComment[];
  status: 'pending' | 'approved' | 'responded' | 'deleted';
  slug?: string;
  email?: string;
}

function serializeTalk(doc: ITalk): ApiTalk {
  return {
    id: String(doc._id),
    title: doc.title || 'مشاركة خاصة',
    text: doc.text,
    nickname: doc.nickname || 'مجهول',
    category: doc.category || 'أخرى',
    visibility: doc.visibility,
    date: (doc.date || doc.createdAt || new Date()).toISOString(),
    likes: doc.likes || 0,
    comments: (doc.comments || []).map((c: any) => ({
      id: (c._id || '').toString(),
      nickname: c.nickname || 'مجهول',
      text: c.text,
      date: (c.date || new Date()).toISOString(),
    })),
    status: doc.status,
    slug: doc.slug,
    email: doc.email,
  };
}

function makeSlug(input: string) {
  // Arabic-friendly slug: trim, replace spaces with dashes, keep Arabic letters, remove punctuation
  const normalized = input
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\-]/g, '')
    .toLowerCase();
  return normalized || 'wisdom-talk';
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    (async () => {
      try {
        await connectDB();
        const onlyPublic = req.query.public === '1';
        const query: any = {};
        if (onlyPublic) {
          query.visibility = 'public';
          query.status = { $ne: 'deleted' };
        }
        const docs = await TalkModel.find(query).sort({ date: -1, createdAt: -1 }).lean();
        const data = docs.map((d: any) => serializeTalk(d as ITalk));
        return res.status(200).json({ success: true, data });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    })();
    return;
  }

  if (req.method === 'POST') {
    const { title, text, nickname, category, visibility, email, name } = req.body || {};

    // Basic validation depending on visibility
    if (visibility === 'public') {
      if (!title || !text || !nickname || !category) {
        return res.status(400).json({ success: false, error: 'Missing required fields for public post' });
      }
    } else if (visibility === 'private') {
      if (!text) {
        return res.status(400).json({ success: false, error: 'Text is required for private submission' });
      }
      // Require a valid email for private submissions
      const emailStr = typeof email === 'string' ? email.trim() : '';
      const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailStr || !basicEmailRegex.test(emailStr)) {
        return res.status(400).json({ success: false, error: 'Valid email is required for private submission' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Invalid visibility' });
    }

    (async () => {
      try {
        await connectDB();

        const payload: Partial<ITalk> = {
          title: title || 'مشاركة خاصة',
          text,
          nickname: nickname || (name || 'مجهول'),
          category: category || 'أخرى',
          visibility,
          date: new Date(),
          likes: 0,
          comments: [],
          status: 'pending',
        };

        if (visibility === 'public') {
          payload.slug = makeSlug(title);
        } else {
          payload.email = typeof email === 'string' ? email.trim() : undefined;
        }

        const created = await TalkModel.create(payload);
        const data = serializeTalk(created as ITalk);
        return res.status(200).json({ success: true, data });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    })();
    return;
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}