import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean, money } from '@/lib/util';

export async function POST(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  const total = Number(b.total);
  if (!(total > 0)) return err('Enter the total price.');
  const deposit = Math.round(total / 2); // half before work starts
  const note = clean(b.note, 800);
  const e = (await q("update engagements set total_amount=$1, deposit_amount=$2, pay_note=$3, status='awaiting_deposit' where id=$4 returning id, user_id, (select currency from services where id = service_id) as currency", [total, deposit, note, params.id]))[0];
  if (!e) return err('Not found', 404);
  await q("insert into notifications (user_id, engagement_id, kind, title, body) values ($1,$2,'billing','Billing notice: 50% deposit requested',$3)",
    [e.user_id, e.id, 'Total ' + money(total, e.currency) + '. Please pay ' + money(deposit, e.currency) + ' before work starts.']);
  await q("insert into messages (engagement_id, sender, body) values ($1,'system',$2)", [e.id, 'Billing notice sent. Total ' + money(total, e.currency) + ', deposit due ' + money(deposit, e.currency) + '.']);
  return ok({ ok: true, deposit });
}
