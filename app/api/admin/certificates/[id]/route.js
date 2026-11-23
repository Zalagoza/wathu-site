import { del } from '@vercel/blob';
import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { move } from '@/lib/reorder';
import { ok, err, clean } from '@/lib/util';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const dropFile = async (url) => { if (url) { try { await del(url); } catch {} } };

export async function PATCH(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (b.move === 'up' || b.move === 'down') { await move('certificates', params.id, b.move); return ok({ ok: true }); }
  const cur = (await q('select * from certificates where id = $1', [params.id]))[0];
  if (!cur) return err('Not found', 404);
  const c = { ...cur, ...b };
  if (clean(c.title, 150).length < 2) return err('Enter the certificate title.');
  const url = clean(c.file_url, 600);
  if (!url.startsWith('https://')) return err('Invalid file link.');
  if (!TYPES.includes(c.file_type)) return err('Unsupported file type.');
  const row = (await q(
    'update certificates set title=$1, issuer=$2, issued_on=$3, file_url=$4, file_type=$5, active=$6 where id=$7 returning *',
    [clean(c.title, 150), clean(c.issuer, 150), clean(c.issued_on, 40), url, c.file_type, !!c.active, cur.id]
  ))[0];
  if (cur.file_url !== url) await dropFile(cur.file_url);
  return ok({ certificate: row });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const gone = await q('delete from certificates where id = $1 returning file_url', [params.id]);
  if (gone[0]) await dropFile(gone[0].file_url);
  return ok({ ok: true });
}
