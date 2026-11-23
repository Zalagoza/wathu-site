import { validSignature } from '@/lib/paychangu';
import { settle } from '@/lib/settle';

// Set this URL in the PayChangu dashboard: https://YOUR-SITE/api/paychangu/webhook
export async function POST(req) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get('signature'))) return new Response('Invalid signature', { status: 401 });
  let body = {};
  try { body = JSON.parse(raw); } catch {}
  const txRef = body.tx_ref || (body.data && body.data.tx_ref);
  if (txRef) { try { await settle(String(txRef)); } catch {} } // we verify with PayChangu, we do not trust the payload
  return Response.json({ ok: true });
}
