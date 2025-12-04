import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAuth(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseServer
        .from('profiles')
        .select('user_id, username, display_name, age, gender, city, bio, image_url')
        .order('username', { ascending: true });
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    const { username, user_id } = (req.body || {}) as { username?: string; user_id?: string };
    if (!username && !user_id) return res.status(400).json({ success: false, error: 'username or user_id required' });
    try {
      const query = supabaseServer.from('profiles').delete();
      const exec = username ? query.eq('username', username) : query.eq('user_id', user_id as string);
      const { error } = await exec;
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

