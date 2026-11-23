import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { signToken, setCookie } from '@/lib/auth';
import { ok, err, clean, normPhone } from '@/lib/util';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const fullName = clean(b.fullName, 120), location = clean(b.location, 120), phone = normPhone(b.phone);
  if (fullName.length < 3 || location.length < 2) return err('Enter your full names and location.');
  if (phone.replace('+', '').length < 9) return err('Enter a valid phone number.');
  if (String(b.password || '').length < 6) return err('Password must be at least 6 characters.');
  if (!b.accept) return err('You must accept the Terms and Conditions.');
  const exists = await q('select 1 from users where phone = $1', [phone]);
  if (exists.length) return err('That phone number is already registered. Please sign in.');
  const hash = await bcrypt.hash(b.password, 10);
  const u = (await q('insert into users (full_name, phone, location, password_hash) values ($1,$2,$3,$4) returning id', [fullName, phone, location, hash]))[0];
  setCookie('wdc_session', await signToken({ uid: u.id }, 30), 30);
  return ok({ ok: true });
}
