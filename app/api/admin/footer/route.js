import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getFooter } from '@/lib/footer';
import { audit } from '@/lib/audit';
import { ok, err, clean, cleanUrl } from '@/lib/util';

const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['x', 'X (Twitter)'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube']];

export async function GET() {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  return ok({ footer: await getFooter() });
}

export async function PUT(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const b = await req.json().catch(() => ({}));
  const email = clean(b.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('That email address does not look right.');
  const social = {};
  for (const [k, label] of SOCIAL) {
    const raw = clean(b.social && b.social[k], 500);
    if (!raw) continue;
    const u = cleanUrl(raw);
    if (!u) return err(label + ' link must start with https://');
    social[k] = u;
  }
  const value = {
    about: clean(b.about, 400),
    address: clean(b.address, 200),
    phone: clean(b.phone, 40),
    email,
    whatsapp: String(b.whatsapp || '').replace(/\D/g, '').slice(0, 15),
    social,
    copyright: clean(b.copyright, 150),
  };
  await q("insert into settings (key, value) values ('footer', $1::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()", [JSON.stringify(value)]);
  await audit('footer_update', 'Footer edited');
  return ok({ footer: value });
}
