import { CONDUCT } from '@/lib/legal';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Terms of conduct for professional services',
  description: 'How we handle digital forensics, cybersecurity and ICT support work: lawful authority, confidentiality, evidence handling and fair advice.',
  path: '/code',
  sub: 'Digital forensics, cybersecurity and ICT support',
});

export default function Conduct() {
  return (
    <div className="page narrow">
      <div className="stripe" style={{ width: 84, marginBottom: 22 }} />
      <h1>Terms of conduct for professional services</h1>
      <p className="mute">These apply to digital forensics (consultancy and advocacy), cybersecurity technical support and ICT support.</p>
      {CONDUCT.map(([h, p]) => <div key={h}><h3>{h}</h3><p className="mute">{p}</p></div>)}
    </div>
  );
}
