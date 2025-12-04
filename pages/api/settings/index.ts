import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const settings = await (Settings as any).getSettings();
      
      // Ensure socialLinks exists with default values
      const defaultSocialLinks = {
        discord: 'https://discord.gg/W5qJ4hgFxp',
        instagram: 'https://www.instagram.com/wisdom_circle0?igsh=aXFyam5iMWl2ZzZ0',
        facebook: 'https://web.facebook.com/mazigh.apollo',
        tiktok: 'https://www.tiktok.com/@wisdomcircle1',
      };
      
      const settingsData = settings.toObject ? settings.toObject() : settings;
      settingsData.socialLinks = {
        ...defaultSocialLinks,
        ...(settingsData.socialLinks || {}),
      };
      
      return res.status(200).json({ success: true, data: settingsData });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const settings = await (Settings as any).getSettings();
      
      const {
        footerText,
        aboutText,
        communityDescription,
        socialLinks,
        podcastHighlights,
      } = req.body;

      if (footerText !== undefined) settings.footerText = footerText;
      if (aboutText !== undefined) settings.aboutText = aboutText;
      if (communityDescription !== undefined) settings.communityDescription = communityDescription;
      if (socialLinks !== undefined) settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
      if (podcastHighlights !== undefined) settings.podcastHighlights = podcastHighlights;

      await settings.save();

      return res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

