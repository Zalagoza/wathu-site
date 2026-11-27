import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { UPDATE_KINDS } from '@/lib/cats';
import { pageMeta } from '@/lib/seo';
import { newsPath, fmtDate } from '@/lib/text';
import ShareButton from '@/components/ShareButton';

async function load(slug) {
  const id = parseInt(String(slug), 10);
  if (!id) return null;
  try { return (await q('select * from updates where id = $1 and active', [id]))[0] || null; }
  catch (e) { console.error('Update query failed:', e.message); return null; }
}

export async function generateMetadata({ params }) {
  const u = await load(params.slug);
  if (!u) return { title: 'Update not found', robots: { index: false } };
  return pageMeta({
    title: u.title,
    description: u.body.replace(/\s+/g, ' ').slice(0, 150),
    path: newsPath(u),
    image: u.image_url || undefined,
    og: u.title,
    sub: 'News and updates',
  });
}

export default async function UpdatePage({ params }) {
  const u = await load(params.slug);
  if (!u) notFound();
  const kind = (UPDATE_KINDS.find(([k]) => k === u.kind) || [])[1] || 'News';
  return (
    <div className="page narrow" style={{ maxWidth: 760 }}>
      <Link href="/news" className="crumb">← All updates</Link>
      <p style={{ marginBottom: 8 }}><span className="pill y">{kind}</span> <span className="mute small">{fmtDate(u.published_at)}</span></p>
      <h1>{u.title}</h1>
      {u.image_url && <img src={u.image_url} alt="" style={{ width: '100%', height: 'auto', borderRadius: 14, border: '1px solid var(--line)', margin: '8px 0 20px', display: 'block' }} />}
      <p className="prose">{u.body}</p>
      <div className="row">
        {u.link_url && <a className="btn gold" href={u.link_url} target="_blank" rel="noopener noreferrer">{u.link_label || 'Learn more'}</a>}
        <ShareButton title={u.title} text={u.title} label="Share this update" />
      </div>
    </div>
  );
}
