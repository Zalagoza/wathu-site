'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AuthForm({ mode, next }) {
  const router = useRouter();
  const signup = mode === 'signup';
  const [v, setV] = useState({ fullName: '', phone: '', location: '', password: '', accept: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const r = await fetch('/api/auth/' + mode, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setError(d.error || 'Something went wrong.');
    router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="panel">
      {signup && (
        <div className="field"><label>Full names</label><input className="input" autoComplete="name" value={v.fullName} onChange={set('fullName')} required /></div>
      )}
      <div className="field"><label>Phone number</label><input className="input" inputMode="tel" autoComplete="tel" name="phone" placeholder="+265..." value={v.phone} onChange={set('phone')} required /></div>
      {signup && (
        <div className="field"><label>Location</label><input className="input" autoComplete="address-level2" placeholder="City or town" value={v.location} onChange={set('location')} required /></div>
      )}
      <div className="field"><label>Password</label><input className="input" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} value={v.password} onChange={set('password')} required /></div>
      {signup && (
        <label className="check"><input type="checkbox" checked={v.accept} onChange={set('accept')} />
          <span>I have read and accept the <Link href="/tnc" target="_blank" style={{ color: 'var(--gold)' }}>Terms and Conditions</Link>.</span>
        </label>
      )}
      {error && <p className="error">{error}</p>}
      <button className="btn gold" disabled={busy || (signup && !v.accept)} style={{ width: '100%' }}>
        {busy ? 'Please wait...' : signup ? 'Create account' : 'Sign in'}
      </button>
      <p className="mute small" style={{ marginTop: 14, marginBottom: 0 }}>
        {signup ? <>Already registered? <Link href="/in" style={{ color: 'var(--gold)' }}>Sign in</Link></> : <>New here? <Link href="/join" style={{ color: 'var(--gold)' }}>Create an account</Link></>}
      </p>
    </form>
  );
}
