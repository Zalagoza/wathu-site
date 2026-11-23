import AuthForm from '@/components/AuthForm';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ title: 'Sign in', description: 'Sign in to your Wathu Digital Creations account.', path: '/in', noindex: true });

export default function Login({ searchParams }) {
  return (
    <div className="page narrow">
      <h1>Sign in</h1>
      <AuthForm mode="login" next={searchParams?.next} />
    </div>
  );
}
