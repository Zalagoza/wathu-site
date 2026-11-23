import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { STATUS } from '@/lib/cats';
import { ok, err } from '@/lib/util';

const NOTE = {
  in_progress: ['Deposit confirmed', 'Work has started on your request.'],
  completed: ['Work completed', 'Your request is complete. Open the chat for details.'],
  cancelled: ['Request cancelled', 'Your request was cancelled. Open the chat for details.'],
};

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const { status } = await req.json().catch(() => ({}));
  if (!STATUS[status]) return err('Unknown status.');
  const e = (await q('update engagements set status = $1 where id = $2 returning id, user_id', [status, params.id]))[0];
  if (!e) return err('Not found', 404);
  await q("insert into messages (engagement_id, sender, body) values ($1,'system',$2)", [e.id, 'Status changed to: ' + STATUS[status]]);
  if (NOTE[status]) await q("insert into notifications (user_id, engagement_id, kind, title, body) values ($1,$2,'status',$3,$4)", [e.user_id, e.id, NOTE[status][0], NOTE[status][1]]);
  return ok({ ok: true });
}
