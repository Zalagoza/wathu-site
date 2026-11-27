import { q } from '@/lib/db';

// Records important admin actions (shown in the admin Activity tab).
export async function audit(action, detail = '') {
  try { await q('insert into audit_log (action, detail) values ($1,$2)', [action, String(detail).slice(0, 300)]); }
  catch (e) { console.error('Audit failed:', e.message); }
}
