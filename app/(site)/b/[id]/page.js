import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { q } from '@/lib/db';
import { SERVICE_SELECT } from '@/lib/categories';
import BriefForm from '@/components/BriefForm';

export const metadata = { title: 'Start a brief', robots: { index: false, follow: false } };

const HINT = {
  required: 'This service needs at least one reference design, and up to three.',
  optional: 'References help us, but are optional.',
  none: 'Describe what you need and we will take it from there.',
};

export default async function Brief({ params }) {
  const user = await getUser();
  if (!user) redirect('/in?next=/b/' + params.id);
  const s = (await q(SERVICE_SELECT + ' where s.id = $1 and s.active and c.active', [params.id]))[0];
  if (!s || s.cat_kind === 'professional') notFound();
  return (
    <div className="page narrow">
      <h1>{s.title}</h1>
      <p className="mute">Tell us what you need. {HINT[s.cat_refs] || HINT.optional}</p>
      <BriefForm serviceId={s.id} refsMode={s.cat_refs} />
    </div>
  );
}
