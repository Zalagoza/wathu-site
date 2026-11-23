import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ team: await q('select * from team order by sort, id') });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (clean(b.name, 120).length < 2) return err('Enter the name.');
  if (clean(b.role, 120).length < 2) return err('Enter the role.');
  const photo = clean(b.photo_url, 600);
  if (photo && !photo.startsWith('https://')) return err('Invalid photo link.');
  const row = (await q(
    'insert into team (name, role, photo_url, qualifications, skills, experience, active, sort) values ($1,$2,$3,$4,$5,$6,$7,(select coalesce(max(sort), -1) + 1 from team)) returning *',
    [clean(b.name, 120), clean(b.role, 120), photo, clean(b.qualifications, 3000), clean(b.skills, 1500), clean(b.experience, 4000), b.active !== false]
  ))[0];
  return ok({ member: row });
}
