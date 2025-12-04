import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateToken, setUserTokenCookie } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  const { username, password } = req.body || {};
  const u = typeof username === 'string' ? username.trim() : '';
  const p = typeof password === 'string' ? password.trim() : '';

  if (!u || !p) return res.status(400).json({ success: false, error: 'Username and password are required' });

  try {
    const { data: user, error } = await supabaseServer
      .from('auth_users')
      .select('id, username, password_hash')
      .eq('username', u)
      .single();
    if (error) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const ok = await bcrypt.compare(p, user.password_hash);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = generateToken(user.id);
    setUserTokenCookie(res, token);
    return res.status(200).json({ success: true, data: { id: user.id, username: user.username } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}

