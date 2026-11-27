import Link from 'next/link';
import { q } from '@/lib/db';
import { SERVICE_SELECT, getCats } from '@/lib/categories';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import UpdateCard from '@/components/UpdateCard';
import JsonLd from '@/components/JsonLd';
import { getUser } from '@/lib/auth';
import { getFooter } from '@/lib/footer';
import { CITY } from '@/lib/seo';
import { FAQ } from '@/lib/faq';
import { orgSchema, websiteSchema, faqSchema } from '@/lib/schema';

export const metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  let services = [], cats = [], projects = [], updates = [], testimonials = [], user = null;
  try { user = await getUser(); } catch {}
  try {
    cats = await getCats();
    services = await q(SERVICE_SELECT + " where s.active and c.active order by (s.sticker_on and c.kind <> 'professional') desc, s.sort, s.id limit 6");
  } catch (e) { console.error('Home query failed:', e.message); }
  try {
    projects = await q('select * from projects where active order by featured desc, sort, id desc limit 3');
    updates = await q('select * from updates where active order by pinned desc, published_at desc, id desc limit 3');
  } catch (e) { console.error('Home work/news query failed:', e.message); }
  try { testimonials = await q('select * from testimonials where active order by id desc limit 6'); } catch (e) { console.error('Home testimonials query failed:', e.message); }
  const footer = await getFooter();
  const wa = 'https://wa.me/' + (process.env.NEXT_PUBLIC_WHATSAPP || '265996103277').replace(/\D/g, '') + '?text=' + encodeURIComponent('Hello Wathu Digital Creations, I would like to start a project.');
  return (
    <div className="page">
      <JsonLd data={orgSchema(footer, cats)} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={faqSchema(FAQ)} />
      <section className="hero">
        <div className="stripe" style={{ width: 84, marginBottom: 22 }} />
        <p className="kicker">Wathu Digital Creations · {CITY}, Malawi</p>
        <h1>Graphic design, websites, photography and digital security in Malawi</h1>
        <p>We design, build, photograph and film for brands and events, and help people and organisations with digital forensics, cybersecurity and ICT support. Clear prices. Start online in minutes.</p>
        <div className="row">
          <Link href="/work" className="btn gold">Browse services</Link>
          <a href={wa} className="btn green" target="_blank" rel="noopener noreferrer">Start on WhatsApp</a>
          {user ? <Link href="/inbox" className="btn">My messages</Link> : <Link href="/join" className="btn">Create an account</Link>}
        </div>
      </section>

      <ul className="trust">
        <li><b>Clear prices</b><span>Every service is priced in Malawi Kwacha.</span></li>
        <li><b>Start online</b><span>Send your brief any time. We reply in your private chat.</span></li>
        <li><b>Pay securely</b><span>A 50% deposit through PayChangu starts your work.</span></li>
        <li><b>Private by design</b><span>Forensics and cybersecurity begin with a signed engagement letter.</span></li>
      </ul>

      <section className="tiles">
        {cats.map((c) => (
          <Link key={c.id} href={'/c/' + c.slug} className={'tile acc-' + c.accent}>
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

      <section style={{ marginTop: 44 }}>
        <h2>How it works</h2>
        <ol className="steps">
          <li><b>1. Choose a service</b><span>Browse the list and check the price.</span></li>
          <li><b>2. Send your brief</b><span>Tell us what you need. A free account lets us reply to you privately.</span></li>
          <li><b>3. Pay the deposit</b><span>We confirm the details and send a billing notice. Work starts when the 50% deposit is received.</span></li>
          <li><b>4. Get your work</b><span>We keep you updated in the chat until it is ready.</span></li>
        </ol>
      </section>

      {projects.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Recent work</h2>
            <Link href="/folio" className="btn sm">See all work</Link>
          </div>
          <div className="proj-grid">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <h2>What clients say</h2>
          <div className="quotes">
            {testimonials.map((t) => (
              <figure key={t.id} className="quote">
                <blockquote>{t.quote}</blockquote>
                <figcaption><b>{t.name}</b>{t.role ? <span className="mute small"> , {t.role}</span> : null}</figcaption>
              </figure>
            ))}
          </div>
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

      <section style={{ marginTop: 44 }}>
        <h2>Questions people ask</h2>
        <div className="faq">
          {FAQ.map(([question, answer]) => (
            <details key={question}><summary>{question}</summary><p className="mute">{answer}</p></details>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 44 }}>
        <h3>Professional services are handled in private</h3>
        <p className="mute" style={{ marginBottom: 0 }}>Digital forensics, cybersecurity support and ICT support begin with a signed letter of engagement and a private chat with us. Read how we work in the <Link href="/code" style={{ color: 'var(--gold)' }}>terms of conduct</Link>.</p>
      </section>

      <section className="cta-band">
        <h2>Ready to start your project?</h2>
        <p className="mute">Pick a service and send your brief, or message us on WhatsApp and we will point you the right way.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link href="/work" className="btn gold">Browse services</Link>
          <a href={wa} className="btn green" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
        </div>
      </section>
    </div>
  );
}
