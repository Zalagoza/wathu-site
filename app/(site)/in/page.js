import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getUser } from '@/lib/auth';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ title: 'Sign in', description: 'Sign in to your Wathu Digital Creations account.', path: '/in', noindex: true });

export default async function Login({ searchParams }) {
  let user = null;
  try { user = await getUser(); } catch {}
  const next = searchParams?.next;
  if (user) redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : '/');
  return (
    <div className="page narrow">
      <h1>Sign in</h1>
      <AuthForm mode="login" next={next} />
    </div>
  );
}
