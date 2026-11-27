'use client';
import { useEffect, useState } from 'react';
import { shrink } from '@/lib/shrink';

export async function call(path, method, data) {
  try {
    const opt = data === undefined ? { method } : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
    const r = await fetch(path, opt);
    const d = await r.json().catch(() => null);
    if (!r.ok || !d) return { error: (d && d.error) || 'Request failed (' + r.status + '). Check the terminal running npm run dev.' };
    return d;
  } catch { return { error: 'Network error.' }; }
}

export async function upload(file, kind) {
  const fd = new FormData();
  fd.append('file', await shrink(file, kind === 'cert' ? 2400 : kind === 'work' ? 1800 : 1000, kind === 'cert' ? 0.88 : kind === 'work' ? 0.85 : 0.85));
  fd.append('kind', kind);
  try {
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const d = await r.json().catch(() => null);
    if (!r.ok || !d) return { error: (d && d.error) || 'Upload failed (' + r.status + ').' };
    return d;
  } catch { return { error: 'Network error.' }; }
}

const initials = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ---------------- Team ---------------- */
const blankMember = { name: '', role: '', photo_url: '', qualifications: '', skills: '', experience: '', active: true };

export function TeamAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blankMember);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => call('/api/admin/team', 'GET').then((d) => { if (d.error) setError(d.error); else setList(d.team || []); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function pick(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    const d = await upload(file, 'photo');
    setBusy(false);
    if (d.error) return setError(d.error);
    setF((x) => ({ ...x, photo_url: d.url }));
  }
  async function save(e) {
    e.preventDefault(); setError('');
    if (busy) return;
    const d = editing ? await call('/api/admin/team/' + editing, 'PATCH', f) : await call('/api/admin/team', 'POST', f);
    if (d.error) return setError(d.error);
    setF(blankMember); setEditing(null); load();
  }
  async function shift(m, dir) { await call('/api/admin/team/' + m.id, 'PATCH', { move: dir }); load(); }
  async function toggle(m) { await call('/api/admin/team/' + m.id, 'PATCH', { active: !m.active }); load(); }
  async function remove(m) { if (confirm('Remove ' + m.name + ' from the team?')) { await call('/api/admin/team/' + m.id, 'DELETE'); load(); } }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit team member' : 'Add a team member'}</h3>
        <div className="field">
          <label>Display picture (JPG, PNG or WebP, under 4 MB)</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            {f.photo_url ? <img className="pic sm" src={f.photo_url} alt="Preview" /> : <span className="pic sm">{initials(f.name)}</span>}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
          </div>
          {busy && <p className="mute small">Uploading...</p>}
          {f.photo_url && <button type="button" className="btn sm" style={{ marginTop: 8 }} onClick={() => setF({ ...f, photo_url: '' })}>Remove picture</button>}
        </div>
        <div className="field"><label>Full name</label><input className="input" value={f.name} onChange={set('name')} required /></div>
        <div className="field"><label>Role / position</label><input className="input" placeholder="e.g. Lead Designer" value={f.role} onChange={set('role')} required /></div>
        <div className="field"><label>Qualifications (one per line)</label><textarea value={f.qualifications} onChange={set('qualifications')} placeholder={'BSc Computer Science, University of Malawi\nCertified Ethical Hacker'} /></div>
        <div className="field"><label>Skills (separate with commas)</label><input className="input" value={f.skills} onChange={set('skills')} placeholder="Branding, Photography, Digital forensics" /></div>
        <div className="field"><label>Experience background (one paragraph per line)</label><textarea value={f.experience} onChange={set('experience')} /></div>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Show on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold" disabled={busy}>{editing ? 'Save changes' : 'Add to team'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setF(blankMember); setEditing(null); }}>Cancel</button>}
        </div>
      </form>

      <div>
        <p className="mute small">Use the arrows to set the order members appear on the website. The first one shows first.</p>
        {list.length === 0 && <p className="mute">No team members yet.</p>}
        {list.map((m, i) => (
          <div key={m.id} className="mini" style={{ opacity: m.active ? 1 : 0.55 }}>
            {m.photo_url ? <img className="pic sm" src={m.photo_url} alt={m.name} /> : <span className="pic sm">{initials(m.name)}</span>}
            <div className="grow">
              <b>{m.name}</b>{!m.active && <span className="mute small"> (hidden)</span>}<br />
              <span className="mute small">{m.role}</span>
            </div>
            <div className="acts">
              <button className="btn sm" disabled={i === 0} onClick={() => shift(m, 'up')} aria-label="Move up">▲</button>
              <button className="btn sm" disabled={i === list.length - 1} onClick={() => shift(m, 'down')} aria-label="Move down">▼</button>
              <button className="btn sm" onClick={() => { setF({ ...blankMember, ...m }); setEditing(m.id); setError(''); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn sm" onClick={() => toggle(m)}>{m.active ? 'Hide' : 'Show'}</button>
              <button className="btn sm danger" onClick={() => remove(m)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Certificates ---------------- */
const blankCert = { title: '', issuer: '', issued_on: '', file_url: '', file_type: '', active: true };

export function CertsAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blankCert);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => call('/api/admin/certificates', 'GET').then((d) => { if (d.error) setError(d.error); else setList(d.certificates || []); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function pick(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    const d = await upload(file, 'cert');
    setBusy(false);
    if (d.error) return setError(d.error);
    setF((x) => ({ ...x, file_url: d.url, file_type: d.type }));
  }
  async function save(e) {
    e.preventDefault(); setError('');
    if (busy) return;
    const d = editing ? await call('/api/admin/certificates/' + editing, 'PATCH', f) : await call('/api/admin/certificates', 'POST', f);
    if (d.error) return setError(d.error);
    setF(blankCert); setEditing(null); load();
  }
  async function shift(c, dir) { await call('/api/admin/certificates/' + c.id, 'PATCH', { move: dir }); load(); }
  async function toggle(c) { await call('/api/admin/certificates/' + c.id, 'PATCH', { active: !c.active }); load(); }
  async function remove(c) { if (confirm('Remove "' + c.title + '"?')) { await call('/api/admin/certificates/' + c.id, 'DELETE'); load(); } }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit certificate' : 'Upload a certificate'}</h3>
        <div className="field"><label>Title</label><input className="input" placeholder="e.g. Certificate of Incorporation" value={f.title} onChange={set('title')} required /></div>
        <div className="field"><label>Issued by (optional)</label><input className="input" placeholder="e.g. Registrar General" value={f.issuer} onChange={set('issuer')} /></div>
        <div className="field"><label>Year or date (optional)</label><input className="input" value={f.issued_on} onChange={set('issued_on')} /></div>
        <div className="field">
          <label>File: JPG, PNG, WebP or PDF, under 4 MB</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pick} />
          {busy && <p className="mute small">Uploading...</p>}
          {f.file_url && !busy && (
            <p className="okmsg small" style={{ marginTop: 8 }}>
              File ready. <a href={f.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Open it</a>
            </p>
          )}
        </div>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Show on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold" disabled={busy || !f.file_url}>{editing ? 'Save changes' : 'Add certificate'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setF(blankCert); setEditing(null); }}>Cancel</button>}
        </div>
      </form>

      <div>
        <p className="mute small">Certificates show on the Our team page. Use the arrows to set their order.</p>
        {list.length === 0 && <p className="mute">No certificates yet.</p>}
        {list.map((c, i) => (
          <div key={c.id} className="mini" style={{ opacity: c.active ? 1 : 0.55 }}>
            {c.file_type === 'application/pdf' ? <span className="thumb">PDF</span> : <img className="thumb" src={c.file_url} alt={c.title} />}
            <div className="grow">
              <b>{c.title}</b>{!c.active && <span className="mute small"> (hidden)</span>}<br />
              <span className="mute small">{[c.issuer, c.issued_on].filter(Boolean).join(', ') || ' '}</span>
            </div>
            <div className="acts">
              <button className="btn sm" disabled={i === 0} onClick={() => shift(c, 'up')} aria-label="Move up">▲</button>
              <button className="btn sm" disabled={i === list.length - 1} onClick={() => shift(c, 'down')} aria-label="Move down">▼</button>
              <button className="btn sm" onClick={() => { setF({ ...blankCert, ...c }); setEditing(c.id); setError(''); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn sm" onClick={() => toggle(c)}>{c.active ? 'Hide' : 'Show'}</button>
              <button className="btn sm danger" onClick={() => remove(c)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
