'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LOE } from '@/lib/legal';
import Link from 'next/link';

export default function EngageForm({ serviceId, fullName }) {
  const router = useRouter();
  const [details, setDetails] = useState('');
  const [signed, setSigned] = useState('');
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const match = signed.trim().toLowerCase() === fullName.trim().toLowerCase();

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const r = await fetch('/api/engagements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, details, signedName: signed, accepted: a && b }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setError(d.error || 'Something went wrong.');
    router.push('/inbox/' + d.id);
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label>Briefly describe your matter (kept private)</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} required />
      </div>
      <h3>Letter of engagement</h3>
      <ol className="scroll">{LOE.map((t, i) => <li key={i}>{t}</li>)}</ol>
      <label className="check"><input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} />
        <span>I accept the <Link href="/code" target="_blank" style={{ color: 'var(--gold)' }}>Terms of Conduct for Professional Services</Link>.</span></label>
      <label className="check"><input type="checkbox" checked={b} onChange={(e) => setB(e.target.checked)} />
        <span>I agree to the letter of engagement above, including the 50% deposit before work starts.</span></label>
      <div className="field">
        <label>Sign by typing your full name exactly as registered: {fullName}</label>
        <input className="input" value={signed} onChange={(e) => setSigned(e.target.value)} required />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn gold" disabled={busy || !a || !b || !match}>{busy ? 'Signing...' : 'Sign and open private chat'}</button>
    </form>
  );
}
