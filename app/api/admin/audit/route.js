import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err } from '@/lib/util';

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ log: await q('select * from audit_log order by id desc limit 100') });
}
