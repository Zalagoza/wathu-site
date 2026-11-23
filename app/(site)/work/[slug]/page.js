import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { SERVICE_SELECT } from '@/lib/categories';
import { pageMeta } from '@/lib/seo';
import { svcPath } from '@/lib/text';
import { money } from '@/lib/util';
import ServiceCard from '@/components/ServiceCard';
import ShareButton from '@/components/ShareButton';

async function load(slug) {
  const id = parseInt(String(slug), 10);
  if (!id) return null;
  try { return (await q(SERVICE_SELECT + ' where s.id = $1 and s.active and c.active', [id]))[0] || null; }
  catch (e) { console.error('Service query failed:', e.message); return null; }
}

export async function generateMetadata({ params }) {
  const s = await load(params.slug);
  if (!s) return { title: 'Service not found', robots: { index: false } };
  const price = money(s.price, s.currency) + ' ' + s.unit;
  const sticker = s.cat_kind !== 'professional' && s.sticker_on ? ' (' + s.sticker_text + ')' : '';
  return pageMeta({
    title: s.title,
    description: (s.description ? s.description.slice(0, 130).replace(/\s+$/, '') + '. ' : '') + 'From ' + price + sticker + '.',
    path: svcPath(s),
    og: s.title,
    sub: s.cat_label + ' | ' + price,
  });
}

export default async function ServicePage({ params }) {
  const s = await load(params.slug);
  if (!s) notFound();
  const pro = s.cat_kind === 'professional';
  return (
    <div className="page">
      <Link href={'/work'} className="crumb">← All services</Link>
      <h1>{s.title}</h1>
      <p className="lead">{s.description}</p>
      <div style={{ maxWidth: 420, margin: '26px 0 20px' }}><ServiceCard s={s} /></div>
      <div className="row"><ShareButton title={s.title} text={s.title + ' from Wathu Digital Creations'} /></div>
      {pro && <p className="mute small" style={{ marginTop: 16 }}>Professional services are handled under our <Link href="/code" style={{ color: 'var(--gold)' }}>terms of conduct</Link> and start with a signed letter of engagement.</p>}
    </div>
  );
}
