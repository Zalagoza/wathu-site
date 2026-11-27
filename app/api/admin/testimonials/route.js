import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ testimonials: await q('select * from testimonials order by id desc') });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (clean(b.name, 100).length < 2) return err('Enter the client name.');
  if (clean(b.quote, 600).length < 10) return err('Enter what the client said.');
  const row = (await q(
    'insert into testimonials (name, role, quote, active) values ($1,$2,$3,$4) returning *',
    [clean(b.name, 100), clean(b.role, 120), clean(b.quote, 600), b.active !== false]
  ))[0];
  return ok({ testimonial: row });
}
