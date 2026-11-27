import Shell from '@/components/Shell';
import Tracker from '@/components/Tracker';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  let user = null, recent = [], unread = 0;
  try {
    user = await getUser();
    if (user) {
      recent = await q('select e.id, s.title from engagements e join services s on s.id = e.service_id where e.user_id = $1 order by e.created_at desc limit 6', [user.id]);
      unread = (await q('select count(*)::int as c from notifications where user_id = $1 and not read', [user.id]))[0].c;
    }
  } catch (e) { console.error('SiteLayout query failed:', e.message); }
  return (
    <Shell user={user} recent={recent} unread={unread}>
      {children}
      <Tracker />
      <WhatsAppButton />
    </Shell>
  );
}
