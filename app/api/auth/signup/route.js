import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { signToken, setCookie } from '@/lib/auth';
import { blocked, record, clientIp } from '@/lib/limit';
import { checkPassword } from '@/lib/password';
import { ok, err, clean, normPhone } from '@/lib/util';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const key = 'signup:' + clientIp();
  if (await blocked(key, 5, 3600)) return err('Too many sign-ups from this connection. Please try again later.', 429);
  await record(key);
  const fullName = clean(b.fullName, 120), location = clean(b.location, 120), phone = normPhone(b.phone);
  if (fullName.length < 3 || location.length < 2) return err('Enter your full names and location.');
  if (phone.replace('+', '').length < 9) return err('Enter a valid phone number.');
  const weak = checkPassword(b.password, phone);
  if (weak) return err(weak);
  if (!b.accept) return err('You must accept the Terms and Conditions.');
  const exists = await q('select 1 from users where phone = $1', [phone]);
  if (exists.length) return err('That phone number is already registered. Please sign in.');
  const hash = await bcrypt.hash(String(b.password), 12);
  const u = (await q('insert into users (full_name, phone, location, password_hash) values ($1,$2,$3,$4) returning id', [fullName, phone, location, hash]))[0];
  setCookie('wdc_session', await signToken({ uid: u.id }));
  return ok({ ok: true });
}
