import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { active } = req.query;
      
      const query: any = {};
      if (active === 'true') {
        query.active = true;
      }

      let categories = await Category.find(query)
        .sort({ order: 1, createdAt: 1 })
        .limit(20);

      // If no categories exist and active=true, create default categories
      if (categories.length === 0 && active === 'true') {
        const defaultCategories = [
          { name: 'Comedy', icon: '😄', color: 'from-yellow-400 to-orange-500', order: 1, active: true },
          { name: 'Gaming', icon: '🎮', color: 'from-purple-400 to-pink-500', order: 2, active: true },
          { name: 'Debates', icon: '💬', color: 'from-blue-400 to-cyan-500', order: 3, active: true },
          { name: 'Podcasts', icon: '🎙️', color: 'from-green-400 to-emerald-500', order: 4, active: true },
          { name: 'Competitions', icon: '🏆', color: 'from-amber-400 to-yellow-500', order: 5, active: true },
        ];

        try {
          const createdCategories = await Category.insertMany(
            defaultCategories.map(cat => ({
              ...cat,
              slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
            }))
          );
          categories = createdCategories;
        } catch (err) {
          // If insert fails (e.g., duplicate), just fetch existing
          categories = await Category.find(query).sort({ order: 1, createdAt: 1 }).limit(20);
        }
      }

      return res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const { name, icon, color, order, active } = req.body;

      if (!name || !icon || !color) {
        return res.status(400).json({ success: false, error: 'Name, icon, and color are required' });
      }

      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const category = await Category.create({
        name,
        slug,
        icon,
        color,
        order: order || 0,
        active: active !== undefined ? active : true,
      });

      return res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, error: 'Category with this name or slug already exists' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

