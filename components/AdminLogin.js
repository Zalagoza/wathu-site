'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const [v, setV] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
    if (!r.ok) { const d = await r.json().catch(() => ({})); return setError(d.error || 'Wrong details.'); }
    router.refresh();
  }
  return (
    <div className="page narrow" style={{ paddingTop: 90 }}>
      <div className="stripe" style={{ width: 84, marginBottom: 22 }} />
      <h1>Studio</h1>
      <form onSubmit={submit} className="panel">
        <div className="field"><label>Username</label><input className="input" value={v.username} onChange={(e) => setV({ ...v, username: e.target.value })} /></div>
        <div className="field"><label>Password</label><input className="input" type="password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></div>
        {error && <p className="error">{error}</p>}
        <button className="btn gold" style={{ width: '100%' }}>Sign in</button>
      </form>
    </div>
  );
}
