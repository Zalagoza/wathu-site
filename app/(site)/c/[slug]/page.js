import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import { pageMeta, CITY, SITE } from '@/lib/seo';
import { svcPath } from '@/lib/text';
import { money } from '@/lib/util';
import { crumbsSchema } from '@/lib/schema';
import ServiceCard from '@/components/ServiceCard';
import JsonLd from '@/components/JsonLd';

async function load(slug) {
  try {
    const cats = await getCats();
    const cat = cats.find((c) => c.slug === slug);
    if (!cat) return null;
    const services = await q(SERVICE_SELECT + ' where s.active and c.active and s.category = $1 order by s.sort, s.id', [slug]);
    return { cat, cats, services };
  } catch (e) { console.error('Category query failed:', e.message); return null; }
}

export async function generateMetadata({ params }) {
  const d = await load(params.slug);
  if (!d) return { title: 'Page not found', robots: { index: false } };
  const { cat, services } = d;
  const low = services.length ? Math.min(...services.map((s) => Number(s.price))) : 0;
  const cur = services[0] ? services[0].currency : 'MWK';
  return pageMeta({
    title: cat.label + ' in Malawi',
    description: cat.blurb + ' ' + (services.length ? services.length + ' services from ' + money(low, cur) + '. ' : '') + 'Clear prices and online requests.',
    path: '/c/' + cat.slug,
    og: cat.label + ' in Malawi',
    sub: cat.blurb,
  });
}

export default async function CategoryPage({ params }) {
  const d = await load(params.slug);
  if (!d) notFound();
  const { cat, cats, services } = d;
  const pro = cat.kind === 'professional';
  const others = cats.filter((c) => c.slug !== cat.slug);
  const url = SITE + '/c/' + cat.slug;
  const intro = pro
    ? 'Wathu Digital Creations, based in ' + CITY + ', supports individuals and organisations across Malawi. These services start with a signed letter of engagement and a private chat, so your matter stays confidential.'
    : 'Wathu Digital Creations is a ' + CITY + ' studio that works with businesses, organisations and individuals across Malawi. Pick a service below, check the price and send your brief online. We reply in your private chat.';
  return (
    <div className="page">
      <JsonLd data={crumbsSchema([['Home', '/'], ['Services', '/work'], [cat.label, '/c/' + cat.slug]])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: cat.label + ' in Malawi', url, description: cat.blurb,
        mainEntity: { '@type': 'ItemList', itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: SITE + svcPath(s) })) },
      }} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/work">Services</Link><span>›</span><b>{cat.label}</b></nav>
      <h1>{cat.label} in Malawi</h1>
      <p className="lead">{cat.blurb}</p>
      <p className="mute" style={{ maxWidth: '62ch' }}>{intro}</p>
      {services.length === 0 ? <p className="mute">No services listed here yet. Please check back soon.</p> :
        <div className="grid" style={{ marginTop: 22 }}>{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>}
      {others.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <h2>More services</h2>
          <div className="chips">{others.map((c) => <Link key={c.id} href={'/c/' + c.slug} className="chip">{c.label}</Link>)}</div>
        </section>
      )}
    </div>
  );
}
