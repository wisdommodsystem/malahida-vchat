import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireUserAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseServer
        .from('messages')
        .select('id, username, message, timestamp')
        .order('id', { ascending: true });
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const auth = await requireUserAuth(req, res);
    if (!auth) return;

    const { message, username } = req.body || {};
    const msg = typeof message === 'string' ? message.trim() : '';
    const user = typeof username === 'string' ? username.trim() : '';
    if (!msg) return res.status(400).json({ success: false, error: 'Message is required' });

    try {
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('username')
        .eq('user_id', auth.userId)
        .single();
      const sender = user || profile?.username || 'unknown';
      const { error } = await supabaseServer
        .from('messages')
        .insert({ username: sender, message: msg, timestamp: new Date().toISOString() });
      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

