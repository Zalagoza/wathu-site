import { del } from '@vercel/blob';
import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { move } from '@/lib/reorder';
import { ok, err, clean } from '@/lib/util';

const dropFile = async (url) => { if (url) { try { await del(url); } catch {} } };

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (b.move === 'up' || b.move === 'down') { await move('team', params.id, b.move); return ok({ ok: true }); }
  const cur = (await q('select * from team where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const m = { ...cur, ...b };
  if (clean(m.name, 120).length < 2) return err('Enter the name.');
  if (clean(m.role, 120).length < 2) return err('Enter the role.');
  const photo = clean(m.photo_url, 600);
  if (photo && !photo.startsWith('https://')) return err('Invalid photo link.');
  const row = (await q(
    'update team set name=$1, role=$2, photo_url=$3, qualifications=$4, skills=$5, experience=$6, active=$7 where id=$8 returning *',
    [clean(m.name, 120), clean(m.role, 120), photo, clean(m.qualifications, 3000), clean(m.skills, 1500), clean(m.experience, 4000), !!m.active, cur.id]
  ))[0];
  if (cur.photo_url && cur.photo_url !== photo) await dropFile(cur.photo_url);
  return ok({ member: row });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const gone = await q('delete from team where id = $1 returning photo_url', [params.id]);
  if (gone[0]) await dropFile(gone[0].photo_url);
  return ok({ ok: true });
}
