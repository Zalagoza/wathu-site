import { touchSessions } from '@/lib/auth';
import { ok } from '@/lib/util';

// Renews a signed-in session for another 15 minutes. Does no database work.
export async function POST() {
  return ok(await touchSessions());
}
