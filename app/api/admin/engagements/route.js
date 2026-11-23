import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const rows = await q(
    'select e.*, s.title, s.category, s.currency, s.price, u.full_name, u.phone, u.location from engagements e join services s on s.id = e.service_id join users u on u.id = e.user_id order by e.created_at desc limit 200'
  );
  return ok({ engagements: rows });
}
