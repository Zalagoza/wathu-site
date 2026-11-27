import Link from 'next/link';
import { q } from '@/lib/db';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import UpdateCard from '@/components/UpdateCard';
import { getUser } from '@/lib/auth';

export default async function Home() {
  let services = [], cats = [], projects = [], updates = [], user = null;
  try { user = await getUser(); } catch {}
  try {
    cats = await getCats();
    services = await q(SERVICE_SELECT + " where s.active and c.active order by (s.sticker_on and c.kind <> 'professional') desc, s.sort, s.id limit 6");
  } catch (e) { console.error('Home query failed:', e.message); }
  try {
    projects = await q('select * from projects where active order by featured desc, sort, id desc limit 3');
    updates = await q('select * from updates where active order by pinned desc, published_at desc, id desc limit 3');
  } catch (e) { console.error('Home work/news query failed:', e.message); }
  return (
    <div className="page">
      <section className="hero">
        <div className="stripe" style={{ width: 84, marginBottom: 22 }} />
        <h1>Creative work that looks sharp.<br />Digital security that holds up.</h1>
        <p>Wathu Digital Creations designs, builds, photographs and films for brands and events, and helps people and organisations with digital forensics, cybersecurity and ICT support.</p>
        <div className="row">
          <Link href="/work" className="btn gold">Browse services</Link>
          {user ? <Link href="/inbox" className="btn">My messages</Link> : <Link href="/join" className="btn">Create an account</Link>}
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
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Popular services</h2>
            <Link href="/work" className="btn sm">All services</Link>
          </div>
          <div className="grid">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Recent work</h2>
            <Link href="/folio" className="btn sm">See all work</Link>
          </div>
          <div className="proj-grid">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        </section>
      )}

      {updates.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Latest updates</h2>
            <Link href="/news" className="btn sm">All updates</Link>
          </div>
          {updates.map((u) => <UpdateCard key={u.id} u={u} />)}
        </section>
      )}

      <section className="panel" style={{ marginTop: 44 }}>
        <h3>Professional services are handled in private</h3>
        <p className="mute" style={{ marginBottom: 0 }}>Digital forensics, cybersecurity support and ICT support begin with a signed letter of engagement and a private chat with us. Read how we work in the <Link href="/code" style={{ color: 'var(--gold)' }}>terms of conduct</Link>.</p>
      </section>
    </div>
  );
}
