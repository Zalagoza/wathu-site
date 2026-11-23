import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { move } from '@/lib/reorder';
import { ok, err, clean } from '@/lib/util';

const KINDS = ['creative', 'professional'];
const REFS = ['required', 'optional', 'none'];
const ACCENTS = ['green', 'gold', 'red', 'rasta'];

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (b.move === 'up' || b.move === 'down') { await move('categories', params.id, b.move); return ok({ ok: true }); }
  const cur = (await q('select * from categories where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const c = { ...cur, ...b };
  const label = clean(c.label, 60);
  if (label.length < 2) return err('Enter a category name.');
  const kind = KINDS.includes(c.kind) ? c.kind : cur.kind;
  const refs = kind === 'professional' ? 'none' : REFS.includes(c.refs) ? c.refs : cur.refs;
  const accent = ACCENTS.includes(c.accent) ? c.accent : cur.accent;
  let icon = clean(c.icon, 2) || label.slice(0, 2);
  icon = icon.charAt(0).toUpperCase() + icon.slice(1).toLowerCase();
  const row = (await q(
    'update categories set label=$1, blurb=$2, icon=$3, kind=$4, refs=$5, accent=$6, active=$7 where id=$8 returning *',
    [label, clean(c.blurb, 200), icon, kind, refs, accent, !!c.active, cur.id]
  ))[0];
  // a category that is now professional cannot carry promotion stickers
  if (kind === 'professional') await q('update services set sticker_on = false where category = $1', [cur.slug]);
  return ok({ category: row });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const c = (await q('select slug from categories where id = $1', [params.id]))[0];
  if (!c) return err('Not found', 404);
  const n = (await q('select count(*)::int as c from services where category = $1', [c.slug]))[0].c;
  if (n) return err('This category still has ' + n + ' service(s). Move or remove them first, or hide the category instead.', 409);
  await q('delete from categories where id = $1', [params.id]);
  return ok({ ok: true });
}
