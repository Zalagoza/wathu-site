import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const cur = (await q('select * from services where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const b = { ...cur, ...(await req.json().catch(() => ({}))) };
  const cat = (await q('select kind from categories where slug = $1', [String(b.category || '')]))[0];
  if (!cat) return err('Pick a category.');
  const pro = cat.kind === 'professional';
  const row = (await q(
    'update services set category=$1,title=$2,description=$3,price=$4,currency=$5,unit=$6,sticker_on=$7,sticker_text=$8,active=$9 where id=$10 returning *',
    [b.category, clean(b.title, 150), clean(b.description, 600), Number(b.price) || 0, clean(b.currency, 5) || 'MWK', clean(b.unit, 40), pro ? false : !!b.sticker_on, clean(b.sticker_text, 20) || 'Offer', !!b.active, cur.id]
  ))[0];
  return ok({ service: row });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  try { await q('delete from services where id = $1', [params.id]); }
  catch { await q('update services set active = false where id = $1', [params.id]); } // in use: hide instead
  return ok({ ok: true });
}
