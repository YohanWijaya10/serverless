import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_METHODS = 'GET,POST,PATCH,PUT,DELETE,OPTIONS';
const DEFAULT_HEADERS = 'Content-Type, Authorization';
const ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN || 'https://dashboard-agent-v2.vercel.app';

export function middleware(req: NextRequest) {
  // Only act on /api/* via matcher below
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.headers.set('Vary', 'Origin');
    res.headers.set('Access-Control-Allow-Methods', DEFAULT_METHODS);
    res.headers.set('Access-Control-Allow-Headers', DEFAULT_HEADERS);
    res.headers.set('Access-Control-Max-Age', '86400');
    return res;
  }

  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.headers.set('Vary', 'Origin');
  res.headers.set('Access-Control-Allow-Methods', DEFAULT_METHODS);
  res.headers.set('Access-Control-Allow-Headers', DEFAULT_HEADERS);
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

export const config = {
  matcher: ['/api/:path*']
};

