import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getUser } from '@/lib/auth';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ title: 'Create account', description: 'Create your Wathu Digital Creations account with your names, phone number and location.', path: '/join', noindex: true });

export default async function Signup({ searchParams }) {
  let user = null;
  try { user = await getUser(); } catch {}
  const next = searchParams?.next;
  if (user) redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : '/');
  return (
    <div className="page narrow">
      <h1>Create your account</h1>
      <p className="mute">We only ask for your names, phone number and location. Your password needs at least 8 characters.</p>
      <AuthForm mode="signup" next={next} />
    </div>
  );
}
