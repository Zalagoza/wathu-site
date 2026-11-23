import AuthForm from '@/components/AuthForm';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ title: 'Create account', description: 'Create your Wathu Digital Creations account with your names, phone number and location.', path: '/join', noindex: true });

export default function Signup({ searchParams }) {
  return (
    <div className="page narrow">
      <h1>Create your account</h1>
      <p className="mute">We only ask for your names, phone number and location.</p>
      <AuthForm mode="signup" next={searchParams?.next} />
    </div>
  );
}
