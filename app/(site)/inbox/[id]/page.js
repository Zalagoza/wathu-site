import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';
import Chat from '@/components/Chat';

export const metadata = { title: 'Chat', robots: { index: false, follow: false } };

export default async function ChatRoom({ params }) {
  const user = await getUser();
  if (!user) redirect('/in?next=/inbox/' + params.id);
  const e = (await q('select e.id, s.title from engagements e join services s on s.id = e.service_id where e.id = $1 and e.user_id = $2', [params.id, user.id]))[0];
  if (!e) notFound();
  return (
    <div className="page narrow">
      <h1>{e.title}</h1>
      <Chat id={e.id} />
    </div>
  );
}
