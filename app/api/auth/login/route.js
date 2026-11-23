import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { signToken, setCookie } from '@/lib/auth';
import { ok, err, normPhone } from '@/lib/util';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const u = (await q('select id, password_hash from users where phone = $1', [normPhone(b.phone)]))[0];
  const good = u && (await bcrypt.compare(String(b.password || ''), u.password_hash));
  if (!good) return err('Wrong phone number or password.', 401);
  setCookie('wdc_session', await signToken({ uid: u.id }, 30), 30);
  return ok({ ok: true });
}
