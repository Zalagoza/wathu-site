import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { SERVICE_SELECT } from '@/lib/categories';
import { money } from '@/lib/util';
import EngageForm from '@/components/EngageForm';

export const metadata = { title: 'Request engagement', robots: { index: false, follow: false } };

export default async function Engage({ params }) {
  const user = await getUser();
  if (!user) redirect('/in?next=/e/' + params.id);
  const s = (await q(SERVICE_SELECT + ' where s.id = $1 and s.active and c.active', [params.id]))[0];
  if (!s || s.cat_kind !== 'professional') notFound();
  return (
    <div className="page narrow">
      <h1>{s.title}</h1>
      <p className="mute">{money(s.price, s.currency)} {s.unit}. Please read the <Link href="/code" style={{ color: 'var(--gold)' }}>terms of conduct</Link>, then sign the letter of engagement. A private chat with us opens straight away.</p>
      <EngageForm serviceId={s.id} fullName={user.full_name} />
    </div>
  );
}
