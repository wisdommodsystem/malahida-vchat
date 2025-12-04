import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/create-profile', '/chat'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get('user_token')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/register';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/create-profile', '/chat'],
};

