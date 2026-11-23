import { createHmac } from 'node:crypto';
import { safeEqual } from '@/lib/auth';

const BASE = 'https://api.paychangu.com';
const headers = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + process.env.PAYCHANGU_SECRET_KEY,
});

// Creates a hosted checkout link. The customer picks Airtel Money, Mpamba, card or bank there.
export async function initiate(body) {
  const r = await fetch(BASE + '/payment', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.status !== 'success' || !d.data || !d.data.checkout_url) {
    throw new Error(typeof d.message === 'string' ? d.message : 'PayChangu could not create the payment.');
  }
  return d.data.checkout_url;
}

// Always confirm the final state with PayChangu before giving value.
export async function verify(txRef) {
  const r = await fetch(BASE + '/verify-payment/' + encodeURIComponent(txRef), { headers: headers(), cache: 'no-store' });
  return r.json().catch(() => ({}));
}

// Webhook check: Signature header = HMAC-SHA256 of the raw body with your webhook secret.
export function validSignature(raw, signature) {
  const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return safeEqual(createHmac('sha256', secret).update(raw).digest('hex'), signature);
}

export const toNumber = (a) => Number(String(a || '0').replace(/,/g, ''));
