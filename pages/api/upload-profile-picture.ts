import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireUserAuth } from '@/lib/auth';

export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireUserAuth(req, res);
  if (!auth) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  const { imageBase64, filename } = req.body || {};
  const rawName = typeof filename === 'string' ? filename.trim() : `profile_${auth.userId}.png`;
  const base64 = typeof imageBase64 === 'string' ? imageBase64 : '';
  if (!base64) return res.status(400).json({ success: false, error: 'Invalid image data' });

  try {
    const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supaUrl || !supaKey) {
      return res.status(500).json({ success: false, error: 'Storage not configured' });
    }
    const matches = base64.match(/^data:(.*);base64,(.*)$/);
    const mime = matches?.[1] || 'image/png';
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/pjpeg'];
    if (!allowed.includes(mime)) {
      return res.status(400).json({ success: false, error: 'Unsupported image type' });
    }
    const data = Buffer.from(matches?.[2] || base64, 'base64');
    if (data.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'Image too large (max 10MB)' });
    }
    const bucket = process.env.SUPABASE_BUCKET_PROFILE_PICTURES || 'profile-pictures';
    const ext = mime === 'image/png' ? '.png' : mime === 'image/jpeg' || mime === 'image/jpg' ? '.jpg' : mime === 'image/gif' ? '.gif' : mime === 'image/webp' ? '.webp' : '';
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${auth.userId}/${Date.now()}_${safeName}${safeName.toLowerCase().endsWith(ext) ? '' : ext}`;
    let { error: upErr } = await supabaseServer.storage.from(bucket).upload(path, data, { contentType: mime, upsert: true });
    if (upErr) {
      const msg = upErr.message?.toLowerCase() || '';
      if (msg.includes('not found') || msg.includes('bucket')) {
        const { error: createErr } = await (supabaseServer as any).storage.createBucket(bucket, { public: true });
        if (!createErr) {
          const retry = await supabaseServer.storage.from(bucket).upload(path, data, { contentType: mime, upsert: true });
          upErr = retry.error as any;
        }
      }
      if (msg.includes('already exists') || msg.includes('conflict')) {
        const altPath = `${auth.userId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}${ext}`;
        const retry = await supabaseServer.storage.from(bucket).upload(altPath, data, { contentType: mime, upsert: true });
        if (!retry.error) {
          const { data: pubAlt } = supabaseServer.storage.from(bucket).getPublicUrl(altPath);
          return res.status(200).json({ success: true, data: { url: pubAlt.publicUrl } });
        }
        upErr = retry.error as any;
      }
    }
    if (upErr) return res.status(500).json({ success: false, error: upErr.message });
    const { data: pub } = supabaseServer.storage.from(bucket).getPublicUrl(path);
    return res.status(200).json({ success: true, data: { url: pub.publicUrl } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}
