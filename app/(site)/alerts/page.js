import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';

export const metadata = { title: 'Notifications', robots: { index: false, follow: false } };

export default async function Notifications() {
  const user = await getUser();
  if (!user) redirect('/in?next=/alerts');
  const rows = await q('select * from notifications where user_id = $1 order by created_at desc limit 50', [user.id]);
  // Mark as read after loading (the badge clears on the next page view).
  await q('update notifications set read = true where user_id = $1 and not read', [user.id]);
  return (
    <div className="page narrow">
      <h1>Notifications</h1>
      {rows.length === 0 && <p className="mute">Nothing new.</p>}
      {rows.map((n) => (
        <Link key={n.id} href={n.engagement_id ? '/inbox/' + n.engagement_id : '/alerts'} className="item" style={{ display: 'block', borderColor: n.read ? 'var(--line)' : 'var(--gold)' }}>
          <b>{n.title}</b>
          <div className="mute small">{n.body}</div>
          <div className="mute small">{new Date(n.created_at).toLocaleString()}</div>
        </Link>
      ))}
    </div>
  );
}
