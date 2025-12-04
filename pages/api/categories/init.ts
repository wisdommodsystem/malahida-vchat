import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

const defaultCategories = [
  { name: 'Comedy', icon: '😄', color: 'from-yellow-400 to-orange-500', order: 1 },
  { name: 'Gaming', icon: '🎮', color: 'from-purple-400 to-pink-500', order: 2 },
  { name: 'Debates', icon: '💬', color: 'from-blue-400 to-cyan-500', order: 3 },
  { name: 'Podcasts', icon: '🎙️', color: 'from-green-400 to-emerald-500', order: 4 },
  { name: 'Competitions', icon: '🏆', color: 'from-amber-400 to-yellow-500', order: 5 },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const existingCategories = await Category.countDocuments();
      
      if (existingCategories > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Categories already exist. Use the admin panel to manage them.' 
        });
      }

      const categories = await Category.insertMany(
        defaultCategories.map(cat => ({
          ...cat,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
          active: true,
        }))
      );

      return res.status(201).json({ 
        success: true, 
        message: 'Default categories created successfully',
        data: categories 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

