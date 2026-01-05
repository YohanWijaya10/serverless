import { NextResponse } from 'next/server';

const DEFAULT_METHODS = 'GET,POST,PATCH,PUT,DELETE,OPTIONS';
const DEFAULT_HEADERS = 'Content-Type, Authorization';

export const CORS_ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*';

export function applyCORS<T extends NextResponse>(res: T): T {
  res.headers.set('Access-Control-Allow-Origin', CORS_ALLOW_ORIGIN);
  res.headers.set('Vary', 'Origin');
  res.headers.set('Access-Control-Allow-Methods', DEFAULT_METHODS);
  res.headers.set('Access-Control-Allow-Headers', DEFAULT_HEADERS);
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

export function preflight(): NextResponse {
  return applyCORS(new NextResponse(null, { status: 204 }));
}

