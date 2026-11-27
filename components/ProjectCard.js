import Link from 'next/link';
import { PROJECT_KINDS } from '@/lib/cats';
import { folioPath, imgs } from '@/lib/text';

export default function ProjectCard({ p }) {
  const cover = imgs(p.images)[0];
  const kind = (PROJECT_KINDS.find(([k]) => k === p.kind) || [])[1] || 'Project';
  return (
    <Link href={folioPath(p)} className="proj">
      <div className="proj-cover">
        {cover && <img src={cover} alt={p.title} loading="lazy" decoding="async" />}
        {p.kind === 'website' && <span className="proj-tag">Live site</span>}
      </div>
      <div className="proj-body">
        <span><span className="pill">{kind}</span>{p.managed && <span className="pill g" style={{ marginLeft: 6 }}>We manage it</span>}</span>
        <h3>{p.title}</h3>
        <span className="mute small">{[p.client, p.year].filter(Boolean).join(' | ') || ' '}</span>
      </div>
    </Link>
  );
}
