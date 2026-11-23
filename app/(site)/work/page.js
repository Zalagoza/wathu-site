import Link from 'next/link';
import { q } from '@/lib/db';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import { pageMeta } from '@/lib/seo';
import ServiceCard from '@/components/ServiceCard';

const slugOf = (sp) => (sp && (sp.c || sp.cat)) || '';

export async function generateMetadata({ searchParams }) {
  let cat = null;
  try { cat = (await getCats()).find((c) => c.slug === slugOf(searchParams)); } catch {}
  return pageMeta({
    title: cat ? cat.label + ' services' : 'Services and prices',
    description: cat ? cat.blurb + ' See prices and start your request.' : 'Graphic design, web design, photography, videography, digital forensics, cybersecurity and ICT support, with clear prices.',
    path: cat ? '/work?c=' + cat.slug : '/work',
    og: cat ? cat.label : 'Services and prices',
    sub: cat ? cat.blurb : 'Design, media and digital security',
  });
}

export default async function Work({ searchParams }) {
  let cats = [], services = [];
  try {
    cats = await getCats();
    const slug = cats.find((c) => c.slug === slugOf(searchParams))?.slug;
    services = slug
      ? await q(SERVICE_SELECT + ' where s.active and c.active and s.category = $1 order by s.sort, s.id', [slug])
      : await q(SERVICE_SELECT + ' where s.active and c.active order by c.sort, s.sort, s.id');
  } catch (e) { console.error('Work query failed:', e.message); }
  const cur = cats.find((c) => c.slug === slugOf(searchParams))?.slug;
  return (
    <div className="page">
      <h1>Services</h1>
      <p className="mute">Prices are set by us and shown in Malawi Kwacha unless stated.</p>
      <div className="chips">
        <Link href="/work" className={'chip' + (!cur ? ' on' : '')}>All</Link>
        {cats.map((c) => <Link key={c.id} href={'/work?c=' + c.slug} className={'chip' + (cur === c.slug ? ' on' : '')}>{c.label}</Link>)}
      </div>
      {services.length === 0 ? <p className="mute">No services listed yet. Please check back soon.</p> :
        <div className="grid">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>}
    </div>
  );
}
