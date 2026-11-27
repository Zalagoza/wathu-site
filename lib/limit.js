import { headers } from 'next/headers';
import { q } from '@/lib/db';

export function clientIp() {
  const h = headers();
  return (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

// true when 'key' has already been recorded 'max' times in the last 'seconds'
export async function blocked(key, max, seconds) {
  try {
    const r = await q("select count(*)::int as c from rate_hits where key = $1 and at > now() - make_interval(secs => $2::int)", [key, seconds]);
    return r[0].c >= max;
  } catch { return false; }
}

export async function record(key) {
  try {
    await q('insert into rate_hits (key) values ($1)', [key]);
    if (Math.random() < 0.02) await q("delete from rate_hits where at < now() - interval '2 days'");
  } catch {}
}
