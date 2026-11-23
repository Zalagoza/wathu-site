import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { STATUS } from '@/lib/cats';

export const metadata = { title: 'Messages', robots: { index: false, follow: false } };

export default async function ChatList() {
  const user = await getUser();
  if (!user) redirect('/in?next=/inbox');
  const rows = await q('select e.id, e.status, e.created_at, s.title from engagements e join services s on s.id = e.service_id where e.user_id = $1 order by e.created_at desc', [user.id]);
  return (
    <div className="page narrow">
      <h1>Messages</h1>
      {rows.length === 0 && <p className="mute">No requests yet. <Link href="/work" style={{ color: 'var(--gold)' }}>Browse services</Link> to get started.</p>}
      {rows.map((r) => (
        <Link key={r.id} href={'/inbox/' + r.id} className="item" style={{ display: 'block' }}>
          <b>{r.title}</b><br />
          <span className="pill y">{STATUS[r.status] || r.status}</span>{' '}
          <span className="mute small">{new Date(r.created_at).toLocaleDateString()}</span>
        </Link>
      ))}
    </div>
  );
}
