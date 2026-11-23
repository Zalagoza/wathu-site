import { settle } from '@/lib/settle';

// The customer's browser lands here after PayChangu. We re-verify server-side, then send them back to the chat.
export async function handleReturn(req) {
  const u = new URL(req.url);
  const txRef = u.searchParams.get('tx_ref') || '';
  let p = null;
  try { p = await settle(txRef); } catch {}
  if (!p) return Response.redirect(new URL('/inbox', req.url), 303);
  const paid = p.status === 'paid' ? '1' : '0';
  return Response.redirect(new URL('/inbox/' + p.engagement_id + '?paid=' + paid, req.url), 303);
}
