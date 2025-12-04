import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  const { city, gender, minAge, maxAge } = req.query || {} as any;

  try {
    let query = supabaseServer.from('profiles').select('username, display_name, age, gender, city, bio, image_url');
    if (city && typeof city === 'string') query = query.eq('city', city);
    if (gender && typeof gender === 'string') query = query.eq('gender', gender);
    if (minAge && !isNaN(Number(minAge))) query = query.gte('age', Number(minAge));
    if (maxAge && !isNaN(Number(maxAge))) query = query.lte('age', Number(maxAge));

    const { data, error } = await query.order('username', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}

