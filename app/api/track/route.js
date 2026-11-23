import { cookies, headers } from 'next/headers';
import { q } from '@/lib/db';
import { detectBot } from '@/lib/bots';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const path = String(b.path || '').slice(0, 200);
  if (!path || path.startsWith('/wdc-admin')) return Response.json({ ok: true });

  const h = headers();
  const ua = h.get('user-agent') || '';
  const { bot, name } = detectBot(ua);
  const country = h.get('x-vercel-ip-country') || null; // set by Vercel in production
  let city = h.get('x-vercel-ip-city') || null;
  try { if (city) city = decodeURIComponent(city); } catch {}
  let ref = null;
  try { if (b.referrer) ref = new URL(b.referrer).host.slice(0, 120); } catch {}

  let vid = cookies().get('wdc_vid')?.value;
  const res = Response.json({ ok: true });
  if (!vid) {
    vid = crypto.randomUUID();
    res.headers.append('Set-Cookie', 'wdc_vid=' + vid + '; Path=/; Max-Age=31536000; SameSite=Lax');
  }
  try {
    await q('insert into visits (vid, path, country, city, referrer, ua, is_bot, bot_name) values ($1,$2,$3,$4,$5,$6,$7,$8)',
      [vid, path, country, city, ref, ua.slice(0, 300), bot, name]);
  } catch (e) { console.error('Track insert failed:', e.message); }
  return res;
}
