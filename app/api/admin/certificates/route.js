import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err, clean } from '@/lib/util';

const CERT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ certificates: await q('select * from certificates order by sort, id') });
}

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  if (clean(b.title, 150).length < 2) return err('Enter the certificate title.');
  const url = clean(b.file_url, 600);
  if (!url.startsWith('https://')) return err('Upload the certificate file first.');
  if (!CERT_TYPES.includes(b.file_type)) return err('Unsupported file type.');
  const row = (await q(
    'insert into certificates (title, issuer, issued_on, file_url, file_type, active, sort) values ($1,$2,$3,$4,$5,$6,(select coalesce(max(sort), -1) + 1 from certificates)) returning *',
    [clean(b.title, 150), clean(b.issuer, 150), clean(b.issued_on, 40), url, b.file_type, b.active !== false]
  ))[0];
  return ok({ certificate: row });
}
