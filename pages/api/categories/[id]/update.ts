import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name, icon, color, order, active } = req.body;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }

      if (name !== undefined) {
        category.name = name;
        category.slug = name.toLowerCase().replace(/\s+/g, '-');
      }
      if (icon !== undefined) category.icon = icon;
      if (color !== undefined) category.color = color;
      if (order !== undefined) category.order = order;
      if (active !== undefined) category.active = active;

      await category.save();

      return res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, error: 'Category with this name or slug already exists' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

