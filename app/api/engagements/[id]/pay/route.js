import { q } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { initiate } from '@/lib/paychangu';
import { ok, err } from '@/lib/util';

const clean = (s) => String(s).replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/ +/g, ' ').trim().slice(0, 60);

export async function POST(req, { params }) {
  const user = await getUser();
  if (!user) return err('Please sign in.', 401);
  if (!process.env.PAYCHANGU_SECRET_KEY) return err('Online payment is not set up yet. Please message us.', 503);

  const b = await req.json().catch(() => ({}));
  const kind = b.kind === 'balance' ? 'balance' : 'deposit';
  const e = (await q('select e.*, s.title, s.currency from engagements e join services s on s.id = e.service_id where e.id = $1 and e.user_id = $2', [params.id, user.id]))[0];
  if (!e) return err('Not found.', 404);
  if (!['MWK', 'USD'].includes(e.currency)) return err('This currency is not supported for online payment.');

  let amount;
  if (kind === 'deposit') {
    if (!['awaiting_deposit', 'deposit_reported'].includes(e.status)) return err('No deposit is due right now.');
    amount = Number(e.deposit_amount);
  } else {
    if (e.status !== 'completed') return err('The balance is due when the work is completed.');
    const paid = await q("select 1 from payments where engagement_id = $1 and kind = 'balance' and status = 'paid'", [e.id]);
    if (paid.length) return err('The balance is already paid.');
    amount = Number(e.total_amount) - Number(e.deposit_amount);
  }
  amount = Math.round(amount);
  if (!(amount > 0)) return err('Nothing to pay.');

  const txRef = 'wdc-' + e.id + '-' + kind + '-' + Date.now();
  await q('insert into payments (engagement_id, tx_ref, kind, amount, currency) values ($1,$2,$3,$4,$5)', [e.id, txRef, kind, amount, e.currency]);

  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
  const parts = user.full_name.trim().split(/\s+/);
  try {
    const url = await initiate({
      amount: String(amount),
      currency: e.currency,
      email: process.env.PAYMENT_EMAIL || 'payments@wathudigitalcreations.com', // we do not collect customer emails
      first_name: parts[0],
      last_name: parts.slice(1).join(' ') || parts[0],
      tx_ref: txRef,
      callback_url: site + '/api/paychangu/callback',
      return_url: site + '/api/paychangu/return',
      customization: {
        title: 'Wathu Digital Creations',
        description: clean((kind === 'deposit' ? 'Deposit ' : 'Balance ') + e.title),
      },
      meta: { engagement_id: String(e.id), kind },
    });
    return ok({ url });
  } catch (x) {
    await q("update payments set status = 'failed' where tx_ref = $1", [txRef]);
    return err(x.message || 'Could not start the payment.', 502);
  }
}
