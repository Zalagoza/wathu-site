import { signToken, setCookie, safeEqual } from '@/lib/auth';
import { blocked, record, clientIp } from '@/lib/limit';
import { audit } from '@/lib/audit';
import { ok, err } from '@/lib/util';

export async function POST(req) {
  const ip = clientIp();
  const key = 'admin:' + ip;
  if (await blocked(key, 5, 900)) { await audit('admin_login_blocked', ip); return err('Too many attempts. Try again in 15 minutes.', 429); }
  const b = await req.json().catch(() => ({}));
  const u = process.env.ADMIN_USERNAME || 'admin';
  const p = process.env.ADMIN_PASSWORD;
  if (!p || !safeEqual(b.username || '', u) || !safeEqual(b.password || '', p)) {
    await record(key);
    await audit('admin_login_failed', ip);
    return err('Wrong details.', 401);
  }
  await audit('admin_login', ip);
  setCookie('wdc_admin', await signToken({ role: 'admin' })); // ends after 15 minutes of inactivity or when the browser closes
  return ok({ ok: true });
}

export async function DELETE() {
  const { clearCookie } = await import('@/lib/auth');
  clearCookie('wdc_admin');
  return ok({ ok: true });
}
