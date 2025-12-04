import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireUserAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireUserAuth(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseServer
        .from('profiles')
        .select('*')
        .eq('user_id', auth.userId)
        .single();
      if (error) return res.status(404).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { display_name, age, gender, city, bio, image_url } = req.body || {};
    try {
      const { data, error } = await supabaseServer
        .from('profiles')
        .update({ display_name, age, gender, city, bio, image_url })
        .eq('user_id', auth.userId)
        .select('*')
        .single();
      if (error) return res.status(400).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

