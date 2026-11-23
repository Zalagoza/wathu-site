import Link from 'next/link';
import { q } from '@/lib/db';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import ServiceCard from '@/components/ServiceCard';

export default async function Home() {
  let services = [], cats = [];
  try {
    cats = await getCats();
    services = await q(SERVICE_SELECT + ' where s.active and c.active order by s.sort, s.id limit 6');
  } catch (e) { console.error('Home query failed:', e.message); }
  return (
    <div className="page">
      <section className="hero">
        <div className="stripe" style={{ width: 84, marginBottom: 22 }} />
        <h1>Creative work that looks sharp.<br />Digital security that holds up.</h1>
        <p>Wathu Digital Creations designs, builds, photographs and films for brands and events, and helps people and organisations with digital forensics, cybersecurity and ICT support.</p>
        <div className="row">
          <Link href="/work" className="btn gold">Browse services</Link>
          <Link href="/join" className="btn">Create an account</Link>
          <Link href="/crew" className="btn">Meet our team</Link>
        </div>
      </section>

      <section className="tiles">
        {cats.map((c) => (
          <Link key={c.id} href={'/work?c=' + c.slug} className={'tile acc-' + c.accent}>
            <b>{c.label}</b>
            <span className="mute small">{c.blurb}</span>
          </Link>
        ))}
      </section>

      {services.length > 0 && (
        <section>
          <h2>Popular services</h2>
          <div className="grid">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
        </section>
      )}

      <section className="panel" style={{ marginTop: 44 }}>
        <h3>Professional services are handled in private</h3>
        <p className="mute" style={{ marginBottom: 0 }}>Digital forensics, cybersecurity support and ICT support begin with a signed letter of engagement and a private chat with us. Read how we work in the <Link href="/code" style={{ color: 'var(--gold)' }}>terms of conduct</Link>.</p>
      </section>
    </div>
  );
}
