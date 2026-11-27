import { NextResponse } from 'next/server';

export const config = { matcher: '/api/:path*' };

export function middleware(req) {
  const m = req.method;
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return NextResponse.next();
  if (req.nextUrl.pathname === '/api/paychangu/webhook') return NextResponse.next(); // signed by PayChangu instead
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  let from = '';
  if (origin) { try { from = new URL(origin).host; } catch {} }
  const crossSite = origin ? from !== host : req.headers.get('sec-fetch-site') === 'cross-site';
  if (crossSite) return NextResponse.json({ error: 'Blocked.' }, { status: 403 });
  return NextResponse.next();
}
