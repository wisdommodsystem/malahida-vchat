import 'dotenv/config';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      const inputPassword = typeof password === 'string' ? password.trim() : '';
      const ENV_ADMIN = process.env.ADMIN_PASSWORD ?? process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      const ADMIN_PASSWORD = typeof ENV_ADMIN === 'string' ? ENV_ADMIN.trim() : undefined;

      if (!inputPassword) {
        return res.status(400).json({ success: false, error: 'Password is required' });
      }

      // Check against environment variable (always authoritative if provided)
      if (ADMIN_PASSWORD && inputPassword === ADMIN_PASSWORD) {
        let admin = await User.findOne({ username: 'admin' });
        if (!admin) {
          // Create admin with plain env password (pre-save will hash once)
          admin = await User.create({
            username: 'admin',
            password: ADMIN_PASSWORD,
            role: 'admin',
          });
        } else {
          // Ensure stored password matches env; update if different
          const matchesEnv = await admin.comparePassword(ADMIN_PASSWORD);
          if (!matchesEnv) {
            admin.password = ADMIN_PASSWORD;
            await admin.save();
          }
        }

        const token = generateToken(admin._id.toString());
        setTokenCookie(res, token);
        return res.status(200).json({ success: true, message: 'Login successful' });
      }

      // Connect DB only if env auth not successful
      await connectDB();

      // Check database users
      const user = await User.findOne({ role: 'admin' });
      if (user && (await user.comparePassword(inputPassword))) {
        const token = generateToken(user._id.toString());
        setTokenCookie(res, token);
        return res.status(200).json({ success: true, message: 'Login successful' });
      }

      return res.status(401).json({ success: false, error: 'Invalid password' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
