import { q } from '@/lib/db';
import { getUser, isAdmin } from '@/lib/auth';
import { blocked, record } from '@/lib/limit';
import { alertOwner } from '@/lib/alerts';
import { ok, err, clean } from '@/lib/util';

async function access(id) {
  if (await isAdmin()) return { admin: true, e: (await q('select e.*, s.currency from engagements e join services s on s.id = e.service_id where e.id = $1', [id]))[0] };
  const user = await getUser();
  if (!user) return {};
  return { user, e: (await q('select e.*, s.currency from engagements e join services s on s.id = e.service_id where e.id = $1 and e.user_id = $2', [id, user.id]))[0] };
}

export async function GET(req, { params }) {
  const { e } = await access(params.id);
  if (!e) return err('Not found', 404);
  const after = Number(new URL(req.url).searchParams.get('after')) || 0;
  const messages = await q('select id, sender, body, created_at from messages where engagement_id = $1 and id > $2 order by id limit 200', [e.id, after]);

  let balance = 0;
  if (e.status === 'completed' && e.total_amount) {
    const paid = await q("select 1 from payments where engagement_id = $1 and kind = 'balance' and status = 'paid'", [e.id]);
    if (!paid.length) balance = Math.max(0, Number(e.total_amount) - Number(e.deposit_amount || 0));
  }
  return ok({
    messages,
    meta: {
      status: e.status, total: e.total_amount, deposit: e.deposit_amount, balance,
      pay_note: e.pay_note, currency: e.currency, online: !!process.env.PAYCHANGU_SECRET_KEY,
    },
  });
}

export async function POST(req, { params }) {
  const { admin, e } = await access(params.id);
  if (!e) return err('Not found', 404);
  const body = clean((await req.json().catch(() => ({}))).body, 3000);
  if (!body) return err('Empty message.');
  if (!admin) {
    if (await blocked('msg:' + e.user_id, 30, 300)) return err('You are sending messages too fast. Please wait a moment.', 429);
    await record('msg:' + e.user_id);
  }
  await q('insert into messages (engagement_id, sender, body) values ($1,$2,$3)', [e.id, admin ? 'admin' : 'user', body]);
  if (!admin) await alertOwner('message', e.id, body); // WhatsApp alert (no text for professional matters)
  if (admin) {
    const pending = await q("select 1 from notifications where engagement_id = $1 and kind = 'message' and not read", [e.id]);
    if (!pending.length) await q("insert into notifications (user_id, engagement_id, kind, title, body) values ($1,$2,'message','New message from Wathu Digital',$3)", [e.user_id, e.id, body.slice(0, 120)]);
  }
  return ok({ ok: true });
}
