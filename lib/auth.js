import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import { q } from '@/lib/db';

const key = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(secret || 'dev-secret-change-me');
};

// Sessions end after 15 minutes without activity (the token expires unless /api/session/touch renews it)
// and when the browser is closed (the cookies have no expiry date, so the browser drops them).
export const IDLE_MINUTES = 15;

export const signToken = (payload) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(IDLE_MINUTES + 'm').sign(key());

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

// No maxAge/expires on purpose: this is a session cookie, so closing the browser signs the person out.
export function setCookie(name, token) {
  cookies().set(name, token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}
export const clearCookie = (name) => cookies().delete(name);

// Called while the person is really using the site: gives a still-valid session another 15 minutes.
export async function touchSessions() {
  const out = { user: false, admin: false };
  const u = await read('wdc_session');
  if (u && u.uid) { setCookie('wdc_session', await signToken({ uid: u.uid })); out.user = true; }
  const a = await read('wdc_admin');
  if (a && a.role === 'admin') { setCookie('wdc_admin', await signToken({ role: 'admin' })); out.admin = true; }
  return out;
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
