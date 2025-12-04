import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const COOKIE_NAME = 'admin_token';
const USER_COOKIE_NAME = 'user_token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function setTokenCookie(res: NextApiResponse, token: string): void {
  const cookie = serialize(COOKIE_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res: NextApiResponse): void {
  const cookie = serialize(COOKIE_NAME, '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  return req.cookies[COOKIE_NAME] || null;
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<{ userId: string } | null> {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  return decoded;
}

export function setUserTokenCookie(res: NextApiResponse, token: string): void {
  const cookie = serialize(USER_COOKIE_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function removeUserTokenCookie(res: NextApiResponse): void {
  const cookie = serialize(USER_COOKIE_NAME, '', {
    maxAge: -1,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getUserTokenFromRequest(req: NextApiRequest): string | null {
  return req.cookies[USER_COOKIE_NAME] || null;
}

export async function requireUserAuth(req: NextApiRequest, res: NextApiResponse): Promise<{ userId: string } | null> {
  const token = getUserTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
  return decoded;
}

