import { del } from '@vercel/blob';
import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { move } from '@/lib/reorder';
import { readProject } from '@/lib/projects';
import { imgs } from '@/lib/text';
import { ok, err } from '@/lib/util';

const dropFile = async (url) => { if (url) { try { await del(url); } catch {} } };

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (b.move === 'up' || b.move === 'down') { await move('projects', params.id, b.move); return ok({ ok: true }); }
  const cur = (await q('select * from projects where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const r = readProject({ ...cur, ...b, images: b.images !== undefined ? b.images : imgs(cur.images) });
  if (r.error) return err(r.error);
  const v = r.v;
  const row = (await q(
    'update projects set title=$1, kind=$2, description=$3, images=$4, link_url=$5, managed=$6, client=$7, year=$8, featured=$9, active=$10 where id=$11 returning *',
    [v.title, v.kind, v.description, JSON.stringify(v.images), v.link_url, v.managed, v.client, v.year, v.featured, v.active, cur.id]
  ))[0];
  const keep = new Set(v.images);
  for (const u of imgs(cur.images)) if (!keep.has(u)) await dropFile(u); // images removed in the editor
  return ok({ project: row });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const gone = await q('delete from projects where id = $1 returning images', [params.id]);
  if (gone[0]) for (const u of imgs(gone[0].images)) await dropFile(u);
  return ok({ ok: true });
}
