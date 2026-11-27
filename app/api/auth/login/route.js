import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { signToken, setCookie } from '@/lib/auth';
import { blocked, record, clientIp } from '@/lib/limit';
import { ok, err, normPhone } from '@/lib/util';

// compared against when the phone number is unknown, so both cases take the same time
const DUMMY = bcrypt.hashSync('not-a-real-password', 10);

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const phone = normPhone(b.phone);
  const k1 = 'login:' + phone, k2 = 'loginip:' + clientIp();
  if ((await blocked(k1, 5, 900)) || (await blocked(k2, 20, 900))) return err('Too many attempts. Please wait 15 minutes and try again.', 429);
  const u = (await q('select id, password_hash from users where phone = $1', [phone]))[0];
  const good = await bcrypt.compare(String(b.password || ''), u ? u.password_hash : DUMMY);
  if (!u || !good) { await record(k1); await record(k2); return err('Wrong phone number or password.', 401); }
  setCookie('wdc_session', await signToken({ uid: u.id }));
  return ok({ ok: true });
}
