import { q } from '@/lib/db';
import { SITE } from '@/lib/seo';
import { SERVICE_SELECT } from '@/lib/categories';
import { svcPath } from '@/lib/text';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const now = new Date();
  const pages = ['/', '/work', '/crew', '/code', '/tnc'].map((p) => ({ url: SITE + p, lastModified: now }));
  let services = [];
  try {
    const rows = await q(SERVICE_SELECT + ' where s.active and c.active order by s.id');
    services = rows.map((s) => ({ url: SITE + svcPath(s), lastModified: now }));
  } catch (e) { console.error('Sitemap query failed:', e.message); }
  return [...pages, ...services];
}
