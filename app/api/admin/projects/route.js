import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { readProject } from '@/lib/projects';
import { ok, err } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ projects: await q('select * from projects order by sort, id desc') });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const r = readProject(await req.json().catch(() => ({})));
  if (r.error) return err(r.error);
  const v = r.v;
  const row = (await q(
    'insert into projects (title,kind,description,images,link_url,managed,client,year,featured,active,sort) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,(select coalesce(min(sort),1) - 1 from projects)) returning *',
    [v.title, v.kind, v.description, JSON.stringify(v.images), v.link_url, v.managed, v.client, v.year, v.featured, v.active]
  ))[0];
  return ok({ project: row });
}
