import { TERMS } from '@/lib/legal';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Terms and conditions',
  description: 'The terms that apply when you use Wathu Digital Creations: accounts, briefs, payment, ownership and privacy.',
  path: '/tnc',
});

export default function Terms() {
  return (
    <div className="page narrow">
      <h1>Terms and conditions</h1>
      {TERMS.map(([h, p]) => <div key={h}><h3>{h}</h3><p className="mute">{p}</p></div>)}
    </div>
  );
}
