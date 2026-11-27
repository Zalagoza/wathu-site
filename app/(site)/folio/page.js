import Link from 'next/link';
import { q } from '@/lib/db';
import { PROJECT_KINDS } from '@/lib/cats';
import { pageMeta } from '@/lib/seo';
import ProjectCard from '@/components/ProjectCard';

const kindOf = (sp) => (PROJECT_KINDS.find(([k]) => k === (sp && sp.k)) || [])[0];

export async function generateMetadata({ searchParams }) {
  const k = PROJECT_KINDS.find(([id]) => id === kindOf(searchParams));
  return pageMeta({
    title: k ? k[1] + ' projects' : 'Our work',
    description: 'A selection of graphic artworks, photographs and websites created and managed by Wathu Digital Creations.',
    path: k ? '/folio?k=' + k[0] : '/folio',
    og: k ? k[1] + ' projects' : 'Our work',
    sub: 'Artwork, photography and websites',
  });
}

export default async function Folio({ searchParams }) {
  const kind = kindOf(searchParams);
  let projects = [];
  try {
    projects = kind
      ? await q('select * from projects where active and kind = $1 order by featured desc, sort, id desc', [kind])
      : await q('select * from projects where active order by featured desc, sort, id desc');
  } catch (e) { console.error('Folio query failed:', e.message); }
  return (
    <div className="page">
      <h1>Our work</h1>
      <p className="mute" style={{ maxWidth: '60ch' }}>Graphic artworks, photographs we took, and websites we built and look after.</p>
      <div className="chips">
        <Link href="/folio" className={'chip' + (!kind ? ' on' : '')}>All</Link>
        {PROJECT_KINDS.map(([k, l]) => <Link key={k} href={'/folio?k=' + k} className={'chip' + (kind === k ? ' on' : '')}>{l}</Link>)}
      </div>
      {projects.length === 0 ? <p className="mute">Projects are coming soon.</p> :
        <div className="proj-grid">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>}
    </div>
  );
}
