import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import TalkModel, { ITalk } from '../../../models/Talk';

interface ApiComment { id: string; nickname: string; text: string; date: string }
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    (async () => {
      try {
        await connectDB();
        const docs = await TalkModel.find({}).sort({ date: -1, createdAt: -1 }).lean();
        const data = docs.map((d: any) => serializeTalk(d as ITalk));
        return res.status(200).json({ success: true, data });
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
        const { id, action } = req.body || {};
        const doc = await TalkModel.findById(id);
        if (!doc) return res.status(404).json({ success: false, error: 'Talk not found' });

        switch (action) {
          case 'approve':
            doc.status = 'approved';
            break;
          case 'responded':
            doc.status = 'responded';
            break;
          case 'delete':
            doc.status = 'deleted';
            break;
          default:
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        await doc.save();
        return res.status(200).json({ success: true, data: serializeTalk(doc as ITalk) });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    })();
    return;
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}