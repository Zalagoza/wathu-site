import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { q } from '@/lib/db';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import { pageMeta } from '@/lib/seo';
import ServiceCard from '@/components/ServiceCard';

export const metadata = pageMeta({
  title: 'Services and prices in Malawi',
  description: 'Graphic design, web design, photography, videography, digital forensics, cybersecurity and ICT support, with clear prices in Malawi Kwacha.',
  path: '/work',
  og: 'Services and prices',
});

export default async function Work({ searchParams }) {
  // old filter addresses (/work?c=web-design) now live at /c/web-design
  const old = (searchParams && (searchParams.c || searchParams.cat)) || '';
  if (old) permanentRedirect('/c/' + encodeURIComponent(String(old)));
  let cats = [], services = [];
  try {
    cats = await getCats();
    services = await q(SERVICE_SELECT + ' where s.active and c.active order by c.sort, s.sort, s.id');
  } catch (e) { console.error('Work query failed:', e.message); }
  return (
    <div className="page">
      <h1>Services and prices in Malawi</h1>
      <p className="mute">Prices are set by us and shown in Malawi Kwacha unless stated.</p>
      <div className="chips">
        <Link href="/work" className="chip on">All</Link>
        {cats.map((c) => <Link key={c.id} href={'/c/' + c.slug} className="chip">{c.label}</Link>)}
      </div>
      {services.length === 0 ? <p className="mute">No services listed yet. Please check back soon.</p> :
        <div className="grid">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>}
    </div>
  );
}
