'use client';
import { useEffect, useState } from 'react';
import { call } from '@/components/AdminTeam';

export function AiSummary({ id, kind }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setText(''); setError(''); }, [id]);
  if (kind === 'professional') return <p className="mute small">Professional matters are never sent to AI, to protect client confidentiality.</p>;
  async function run() {
    setBusy(true); setError(''); setText('');
    const d = await call('/api/admin/ai/summary', 'POST', { id });
    setBusy(false);
    if (d.error) setError(d.error); else setText(d.text);
  }
  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="row">
        <button className="btn sm" onClick={run} disabled={busy}>{busy ? 'Thinking...' : 'Summarise chat and draft a reply (AI)'}</button>
        <span className="mute small">Free AI, creative jobs only.</span>
      </div>
      {error && <p className="error" style={{ marginTop: 10 }}>{error}</p>}
      {text && <p className="prose small" style={{ marginTop: 12 }}>{text}</p>}
    </div>
  );
}

export function ActivityLog() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { call('/api/admin/audit', 'GET').then((d) => { if (d.error) setError(d.error); else setRows(d.log || []); }); }, []);
  return (
    <div className="panel" style={{ overflow: 'auto' }}>
      <h3>Admin activity</h3>
      <p className="mute small">Logins and important changes. Failed logins are listed too, so you can spot guessing attempts.</p>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Time</th><th>Action</th><th>Detail</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={3} className="mute">Nothing recorded yet.</td></tr>}
          {rows.map((r) => <tr key={r.id}><td>{new Date(r.at).toLocaleString()}</td><td>{r.action}</td><td>{r.detail}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
