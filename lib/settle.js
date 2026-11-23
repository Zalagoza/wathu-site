import { q } from '@/lib/db';
import { verify, toNumber } from '@/lib/paychangu';
import { money } from '@/lib/util';

// Verifies a payment with PayChangu and, if it is genuine, records it. Safe to call many times.
export async function settle(txRef) {
  const p = (await q('select * from payments where tx_ref = $1', [txRef]))[0];
  if (!p) return null;
  if (p.status === 'paid') return p;

  let v;
  try { v = await verify(txRef); } catch { return p; }
  const d = v && v.data;
  if (!d) return p;

  if (d.status === 'failed') {
    await q("update payments set status = 'failed' where tx_ref = $1 and status = 'pending'", [txRef]);
    return { ...p, status: 'failed' };
  }

  const genuine =
    v.status === 'success' && d.status === 'success' &&
    d.tx_ref === txRef &&
    String(d.currency) === p.currency &&
    toNumber(d.amount) >= Number(p.amount);
  if (!genuine) return p;

  const done = await q("update payments set status = 'paid', paid_at = now(), provider_ref = $2 where tx_ref = $1 and status <> 'paid' returning *", [txRef, d.reference || null]);
  if (!done.length) return p; // another request already settled it

  const e = (await q('select id, user_id from engagements where id = $1', [p.engagement_id]))[0];
  const amt = money(p.amount, p.currency);
  if (p.kind === 'deposit') {
    await q("update engagements set status = 'in_progress' where id = $1 and status in ('awaiting_deposit','deposit_reported')", [e.id]);
    await q("insert into messages (engagement_id, sender, body) values ($1,'system',$2)", [e.id, '50% deposit of ' + amt + ' received. Work has started.']);
    await q("insert into notifications (user_id, engagement_id, kind, title, body) values ($1,$2,'status','Deposit received',$3)", [e.user_id, e.id, 'We received ' + amt + '. Work has started on your request.']);
  } else {
    await q("insert into messages (engagement_id, sender, body) values ($1,'system',$2)", [e.id, 'Balance of ' + amt + ' received. Thank you.']);
    await q("insert into notifications (user_id, engagement_id, kind, title, body) values ($1,$2,'status','Balance received',$3)", [e.user_id, e.id, 'We received ' + amt + '. Thank you.']);
  }
  return done[0];
}
