import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import { q } from '@/lib/db';

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-me');

export const signToken = (payload, days) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(days + 'd').sign(key());

async function read(name) {
  const t = cookies().get(name)?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload; } catch { return null; }
}

export async function getUser() {
  const p = await read('wdc_session');
  if (!p || !p.uid) return null;
  const rows = await q('select id, full_name, phone, location from users where id = $1', [p.uid]);
  return rows[0] || null;
}

export async function isAdmin() {
  const p = await read('wdc_admin');
  return !!p && p.role === 'admin';
}

export function setCookie(name, token, days) {
  cookies().set(name, token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    secure: process.env.NODE_ENV === 'production', maxAge: days * 86400,
  });
}
export const clearCookie = (name) => cookies().delete(name);

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
