import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { readUpdate } from '@/lib/updates';
import { ok, err } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ updates: await q('select * from updates order by pinned desc, published_at desc, id desc') });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const r = readUpdate(await req.json().catch(() => ({})));
  if (r.error) return err(r.error);
  const v = r.v;
  const row = (await q(
    'insert into updates (title,kind,body,image_url,link_url,link_label,pinned,active,published_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *',
    [v.title, v.kind, v.body, v.image_url, v.link_url, v.link_label, v.pinned, v.active, v.published_at]
  ))[0];
  return ok({ update: row });
}
