import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { PROJECT_KINDS } from '@/lib/cats';
import { pageMeta, SITE, BRAND } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { folioPath, imgs } from '@/lib/text';
import ShareButton from '@/components/ShareButton';

async function load(slug) {
  const id = parseInt(String(slug), 10);
  if (!id) return null;
  try { return (await q('select * from projects where id = $1 and active', [id]))[0] || null; }
  catch (e) { console.error('Project query failed:', e.message); return null; }
}

const kindLabel = (k) => (PROJECT_KINDS.find(([id]) => id === k) || [])[1] || 'Project';

export async function generateMetadata({ params }) {
  const p = await load(params.slug);
  if (!p) return { title: 'Project not found', robots: { index: false } };
  const cover = imgs(p.images)[0];
  return pageMeta({
    title: p.title,
    description: p.description ? p.description.replace(/\s+/g, ' ').slice(0, 150) : kindLabel(p.kind) + ' by Wathu Digital Creations.',
    path: folioPath(p),
    image: cover,
    og: p.title,
    sub: kindLabel(p.kind),
  });
}

export default async function ProjectPage({ params }) {
  const p = await load(params.slug);
  if (!p) notFound();
  const list = imgs(p.images);
  let host = '';
  try { if (p.link_url) host = new URL(p.link_url).host; } catch {}
  return (
    <div className="page">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, description: p.description || kindLabel(p.kind), url: SITE + folioPath(p), ...(list.length ? { image: list } : {}), dateCreated: new Date(p.created_at).toISOString(), creator: { '@type': 'Organization', name: BRAND, url: SITE } }} />
      <Link href="/folio" className="crumb">← All work</Link>
      <h1>{p.title}</h1>
      <p style={{ marginBottom: 14 }}>
        <span className="pill">{kindLabel(p.kind)}</span>
        {p.managed && <span className="pill g" style={{ marginLeft: 6 }}>We manage this site</span>}
        {[p.client, p.year].filter(Boolean).length > 0 && <span className="mute small" style={{ marginLeft: 10 }}>{[p.client, p.year].filter(Boolean).join(' | ')}</span>}
      </p>
      {p.description && <p className="prose">{p.description}</p>}
      <div className="row" style={{ marginTop: 6 }}>
        {p.link_url && <a className="btn gold" href={p.link_url} target="_blank" rel="noopener noreferrer">Visit {host || 'website'}</a>}
        <ShareButton title={p.title} text={p.title + ' by Wathu Digital Creations'} label="Share this project" />
      </div>
      <div className="gallery">
        {list.map((u, i) => (
          <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt={p.title + ' ' + (i + 1)} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" /></a>
        ))}
      </div>
      <div className="panel">
        <h3>Want something like this?</h3>
        <p className="mute">See our services and prices, or start a brief.</p>
        <Link href="/work" className="btn gold">Browse services</Link>
      </div>
    </div>
  );
}
