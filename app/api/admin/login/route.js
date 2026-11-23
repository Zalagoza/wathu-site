import { signToken, setCookie, safeEqual } from '@/lib/auth';
import { ok, err } from '@/lib/util';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const u = process.env.ADMIN_USERNAME || 'admin';
  const p = process.env.ADMIN_PASSWORD;
  if (!p || !safeEqual(b.username || '', u) || !safeEqual(b.password || '', p)) return err('Wrong details.', 401);
  setCookie('wdc_admin', await signToken({ role: 'admin' }, 1), 1);
  return ok({ ok: true });
}

export async function DELETE() {
  const { clearCookie } = await import('@/lib/auth');
  clearCookie('wdc_admin');
  return ok({ ok: true });
}
