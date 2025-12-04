import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateToken, setUserTokenCookie } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  const { username, password, confirmPassword } = req.body || {};
  const u = typeof username === 'string' ? username.trim() : '';
  const p = typeof password === 'string' ? password.trim() : '';
  const c = typeof confirmPassword === 'string' ? confirmPassword.trim() : '';

  if (!u || !p || !c) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  if (u.length < 3 || u.length > 24) {
    return res.status(400).json({ success: false, error: 'Username must be 3-24 characters' });
  }
  if (p.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }
  if (p !== c) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  try {
    const { data: existing, error: findErr } = await supabaseServer
      .from('auth_users')
      .select('id, username')
      .eq('username', u)
      .maybeSingle();
    if (findErr) return res.status(500).json({ success: false, error: findErr.message });
    if (existing) return res.status(409).json({ success: false, error: 'Username already exists' });

    const hash = await bcrypt.hash(p, 10);
    const { data: created, error: createErr } = await supabaseServer
      .from('auth_users')
      .insert({ username: u, password_hash: hash })
      .select('id, username')
      .single();
    if (createErr) return res.status(500).json({ success: false, error: createErr.message });

    await supabaseServer.from('profiles').insert({ user_id: created.id, username: created.username });

    const token = generateToken(created.id);
    setUserTokenCookie(res, token);
    return res.status(200).json({ success: true, data: { id: created.id, username: created.username } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}

