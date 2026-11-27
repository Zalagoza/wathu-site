import { q } from '@/lib/db';
import { pageMeta } from '@/lib/seo';
import UpdateCard from '@/components/UpdateCard';

export const metadata = pageMeta({
  title: 'News and updates',
  description: 'Offers, announcements and important updates from Wathu Digital Creations.',
  path: '/news',
  sub: 'Offers, announcements and updates',
});

export default async function News() {
  let rows = [];
  try { rows = await q('select * from updates where active order by pinned desc, published_at desc, id desc limit 50'); }
  catch (e) { console.error('News query failed:', e.message); }
  return (
    <div className="page narrow" style={{ maxWidth: 760 }}>
      <h1>News and updates</h1>
      <p className="mute">Offers, announcements and important updates from us.</p>
      {rows.length === 0 ? <p className="mute">Nothing posted yet.</p> : rows.map((u) => <UpdateCard key={u.id} u={u} />)}
    </div>
  );
}
