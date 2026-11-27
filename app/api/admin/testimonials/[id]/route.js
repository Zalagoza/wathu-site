import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  const cur = (await q('select * from testimonials where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const name = b.name === undefined ? cur.name : clean(b.name, 100);
  const quote = b.quote === undefined ? cur.quote : clean(b.quote, 600);
  if (name.length < 2 || quote.length < 10) return err('Enter the client name and what they said.');
  const row = (await q(
    'update testimonials set name=$1, role=$2, quote=$3, active=$4 where id=$5 returning *',
    [name, b.role === undefined ? cur.role : clean(b.role, 120), quote, b.active === undefined ? cur.active : !!b.active, params.id]
  ))[0];
  return ok({ testimonial: row });
}

export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  await q('delete from testimonials where id = $1', [params.id]);
  return ok({ ok: true });
}
