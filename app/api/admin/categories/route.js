import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';
import { slugify } from '@/lib/text';

const KINDS = ['creative', 'professional'];
const REFS = ['required', 'optional', 'none'];
const ACCENTS = ['green', 'gold', 'red', 'rasta'];

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const rows = await q('select c.*, (select count(*)::int from services s where s.category = c.slug) as n from categories c order by c.sort, c.id');
  return ok({ categories: rows });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  const label = clean(b.label, 60);
  if (label.length < 2) return err('Enter a category name.');
  const kind = KINDS.includes(b.kind) ? b.kind : 'creative';
  const refs = kind === 'professional' ? 'none' : REFS.includes(b.refs) ? b.refs : 'optional';
  const accent = ACCENTS.includes(b.accent) ? b.accent : 'green';
  let icon = clean(b.icon, 2) || label.slice(0, 2);
  icon = icon.charAt(0).toUpperCase() + icon.slice(1).toLowerCase();

  const base = slugify(label) || 'category';
  let slug = base, n = 2;
  while ((await q('select 1 from categories where slug = $1', [slug])).length) slug = base + '-' + n++;

  const row = (await q(
    'insert into categories (slug,label,blurb,icon,kind,refs,accent,active,sort) values ($1,$2,$3,$4,$5,$6,$7,$8,(select coalesce(max(sort),-1)+1 from categories)) returning *',
    [slug, label, clean(b.blurb, 200), icon, kind, refs, accent, b.active !== false]
  ))[0];
  return ok({ category: row });
}
