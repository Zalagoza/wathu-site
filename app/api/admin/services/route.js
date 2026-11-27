import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ services: await q('select * from services order by sort, id') });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  const cat = (await q('select kind from categories where slug = $1', [String(b.category || '')]))[0];
  if (!cat) return err('Pick a category.');
  if (clean(b.title).length < 2) return err('Enter a title.');
  const pro = cat.kind === 'professional';
  const row = (await q(
    'insert into services (category,title,description,price,currency,unit,sticker_on,sticker_text,active,sort) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,(select coalesce(min(sort),1) - 1 from services)) returning *',
    [b.category, clean(b.title, 150), clean(b.description, 600), Number(b.price) || 0, clean(b.currency, 5) || 'MWK', clean(b.unit, 40) || 'per project', pro ? false : !!b.sticker_on, clean(b.sticker_text, 20) || 'Offer', b.active !== false]
  ))[0];
  return ok({ service: row });
}
