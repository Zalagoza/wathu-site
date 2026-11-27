import { del } from '@vercel/blob';
import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { readUpdate } from '@/lib/updates';
import { ok, err } from '@/lib/util';

const dropFile = async (url) => { if (url) { try { await del(url); } catch {} } };

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const cur = (await q('select * from updates where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const r = readUpdate({ ...cur, ...(await req.json().catch(() => ({}))) });
  if (r.error) return err(r.error);
  const v = r.v;
  const row = (await q(
    'update updates set title=$1, kind=$2, body=$3, image_url=$4, link_url=$5, link_label=$6, pinned=$7, active=$8, published_at=$9 where id=$10 returning *',
    [v.title, v.kind, v.body, v.image_url, v.link_url, v.link_label, v.pinned, v.active, v.published_at, cur.id]
  ))[0];
  if (cur.image_url && cur.image_url !== v.image_url) await dropFile(cur.image_url);
  return ok({ update: row });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const gone = await q('delete from updates where id = $1 returning image_url', [params.id]);
  if (gone[0]) await dropFile(gone[0].image_url);
  return ok({ ok: true });
}
