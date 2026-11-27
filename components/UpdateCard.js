import Link from 'next/link';
import { UPDATE_KINDS } from '@/lib/cats';
import { newsPath, fmtDate } from '@/lib/text';

export default function UpdateCard({ u }) {
  const kind = (UPDATE_KINDS.find(([k]) => k === u.kind) || [])[1] || 'News';
  const text = u.body.length > 170 ? u.body.slice(0, 170).replace(/\s+\S*$/, '') + '...' : u.body;
  return (
    <Link href={newsPath(u)} className={'upd' + (u.pinned ? ' pin' : '')}>
      {u.image_url && <img src={u.image_url} alt="" loading="lazy" decoding="async" />}
      <div>
        <span className="pill y">{kind}</span>{u.pinned && <span className="pill" style={{ marginLeft: 6 }}>Pinned</span>}{' '}
        <span className="mute small">{fmtDate(u.published_at)}</span>
        <h3>{u.title}</h3>
        <p>{text}</p>
      </div>
    </Link>
  );
}
