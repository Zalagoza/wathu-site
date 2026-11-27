import { q } from '@/lib/db';
import { SITE } from '@/lib/seo';
import { SERVICE_SELECT } from '@/lib/categories';
import { svcPath, folioPath, newsPath } from '@/lib/text';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const now = new Date();
  const pages = ['/', '/work', '/folio', '/news', '/crew', '/code', '/tnc'].map((p) => ({ url: SITE + p, lastModified: now }));
  const out = [...pages];
  try {
    (await q(SERVICE_SELECT + ' where s.active and c.active order by s.id')).forEach((s) => out.push({ url: SITE + svcPath(s), lastModified: now }));
    (await q('select id, title from projects where active order by id')).forEach((p) => out.push({ url: SITE + folioPath(p), lastModified: now }));
    (await q('select id, title, published_at from updates where active order by id')).forEach((u) => out.push({ url: SITE + newsPath(u), lastModified: new Date(u.published_at) }));
  } catch (e) { console.error('Sitemap query failed:', e.message); }
  return out;
}
