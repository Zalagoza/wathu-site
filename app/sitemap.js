import { q } from '@/lib/db';
import { SITE } from '@/lib/seo';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import { svcPath, folioPath, newsPath } from '@/lib/text';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const out = [{ url: SITE, changeFrequency: 'weekly', priority: 1 }];
  ['/work', '/folio', '/news', '/crew'].forEach((p) => out.push({ url: SITE + p, changeFrequency: 'weekly', priority: 0.8 }));
  ['/code', '/tnc', '/cookies'].forEach((p) => out.push({ url: SITE + p, changeFrequency: 'yearly', priority: 0.3 }));
  try {
    (await getCats()).forEach((c) => out.push({ url: SITE + '/c/' + c.slug, changeFrequency: 'weekly', priority: 0.9 }));
    (await q(SERVICE_SELECT + ' where s.active and c.active order by s.id')).forEach((s) => out.push({ url: SITE + svcPath(s), changeFrequency: 'monthly', priority: 0.7 }));
    (await q('select id, title, created_at from projects where active order by id')).forEach((p) => out.push({ url: SITE + folioPath(p), lastModified: new Date(p.created_at), priority: 0.6 }));
    (await q('select id, title, published_at from updates where active order by id')).forEach((u) => out.push({ url: SITE + newsPath(u), lastModified: new Date(u.published_at), priority: 0.5 }));
  } catch (e) { console.error('Sitemap query failed:', e.message); }
  return out;
}
