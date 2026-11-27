'use client';
import { useEffect, useState } from 'react';
import { call } from '@/components/AdminTeam';

const blank = { name: '', role: '', quote: '', active: true };

export default function TestimonialsAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = () => call('/api/admin/testimonials', 'GET').then((d) => { if (d.error) setError(d.error); else setList(d.testimonials || []); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save(e) {
    e.preventDefault(); setError('');
    const d = editing ? await call('/api/admin/testimonials/' + editing, 'PATCH', f) : await call('/api/admin/testimonials', 'POST', f);
    if (d.error) return setError(d.error);
    setF(blank); setEditing(null); load();
  }
  async function toggle(t) { await call('/api/admin/testimonials/' + t.id, 'PATCH', { active: !t.active }); load(); }
  async function remove(t) { if (confirm('Delete the testimonial from ' + t.name + '?')) { await call('/api/admin/testimonials/' + t.id, 'DELETE'); load(); } }
  function edit(t) { setEditing(t.id); setF({ name: t.name, role: t.role, quote: t.quote, active: t.active }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit testimonial' : 'Add a testimonial'}</h3>
        <p className="mute small">Only add real feedback from real clients, and ask their permission first. Testimonials show on the home page.</p>
        <div className="field"><label>Client name</label><input className="input" value={f.name} onChange={set('name')} required /></div>
        <div className="field"><label>Business or role (optional)</label><input className="input" value={f.role} onChange={set('role')} placeholder="e.g. Owner, Mzuzu Bakery" /></div>
        <div className="field"><label>What they said</label><textarea value={f.quote} onChange={set('quote')} maxLength={600} required /></div>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Show on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold">{editing ? 'Save changes' : 'Add testimonial'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setF(blank); setEditing(null); }}>Cancel</button>}
        </div>
      </form>
      <div>
        {list.length === 0 && <p className="mute">No testimonials yet.</p>}
        {list.map((t) => (
          <div key={t.id} className="panel" style={{ marginBottom: 12, opacity: t.active ? 1 : 0.55 }}>
            <p style={{ margin: '0 0 8px' }}>{t.quote}</p>
            <b>{t.name}</b>{t.role && <span className="mute small"> , {t.role}</span>}{!t.active && <span className="mute small"> (hidden)</span>}
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn sm" onClick={() => edit(t)}>Edit</button>
              <button className="btn sm" onClick={() => toggle(t)}>{t.active ? 'Hide' : 'Show'}</button>
              <button className="btn sm danger" onClick={() => remove(t)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
