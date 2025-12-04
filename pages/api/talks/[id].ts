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
    id: (doc._id as any).toString(),
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    (async () => {
      try {
        await connectDB();
        const doc = await TalkModel.findById(id).lean();
        if (!doc) return res.status(404).json({ success: false, error: 'Talk not found' });
        return res.status(200).json({ success: true, data: serializeTalk(doc as unknown as ITalk) });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    })();
    return;
  }

  if (req.method === 'PUT') {
    (async () => {
      try {
        await connectDB();
        const { likes, comment, status } = req.body || {};
        const doc = await TalkModel.findById(id);
        if (!doc) return res.status(404).json({ success: false, error: 'Talk not found' });

        if (typeof likes === 'number') {
          doc.likes = likes;
        }
        if (comment && comment.text && comment.nickname) {
          doc.comments.push({ nickname: comment.nickname, text: comment.text, date: new Date() } as any);
        }
        if (status) {
          doc.status = status;
        }

        await doc.save();
        return res.status(200).json({ success: true, data: serializeTalk(doc as ITalk) });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    })();
    return;
  }

  if (req.method === 'DELETE') {
    (async () => {
      try {
        await connectDB();
        const doc = await TalkModel.findById(id);
        if (!doc) return res.status(404).json({ success: false, error: 'Talk not found' });
        doc.status = 'deleted';
        await doc.save();
        return res.status(200).json({ success: true });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    })();
    return;
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}