'use client';
import { useEffect, useState } from 'react';
import { call } from '@/components/AdminTeam';
import { ACCENTS } from '@/lib/cats';

const blank = { label: '', blurb: '', icon: '', kind: 'creative', refs: 'optional', accent: 'green', active: true };
const REF_LABEL = { required: 'References required', optional: 'References optional', none: 'No references' };

export default function CategoriesAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = () => call('/api/admin/categories', 'GET').then((d) => { if (d.error) setError(d.error); else setList(d.categories || []); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const pro = f.kind === 'professional';

  async function save(e) {
    e.preventDefault(); setError('');
    const d = editing ? await call('/api/admin/categories/' + editing, 'PATCH', f) : await call('/api/admin/categories', 'POST', f);
    if (d.error) return setError(d.error);
    setF(blank); setEditing(null); load();
  }
  async function shift(c, dir) { await call('/api/admin/categories/' + c.id, 'PATCH', { move: dir }); load(); }
  async function toggle(c) { await call('/api/admin/categories/' + c.id, 'PATCH', { active: !c.active }); load(); }
  async function remove(c) {
    if (!confirm('Remove the category "' + c.label + '"?')) return;
    const d = await call('/api/admin/categories/' + c.id, 'DELETE');
    if (d.error) setError(d.error); else { setError(''); load(); }
  }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit category' : 'Create a category'}</h3>
        <div className="field"><label>Name</label><input className="input" placeholder="e.g. Branding" value={f.label} onChange={set('label')} required /></div>
        <div className="field"><label>Short description (shown on the website)</label><input className="input" value={f.blurb} onChange={set('blurb')} /></div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Icon letters (2)</label><input className="input" maxLength={2} value={f.icon} onChange={set('icon')} placeholder="Br" /></div>
          <div className="field" style={{ flex: 2 }}><label>Accent colour</label>
            <select value={f.accent} onChange={set('accent')}>{ACCENTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        </div>
        <div className="field"><label>Type</label>
          <select value={f.kind} onChange={set('kind')}>
            <option value="creative">Creative (client sends a brief)</option>
            <option value="professional">Professional (terms of conduct, letter of engagement, no stickers)</option>
          </select></div>
        {!pro && (
          <div className="field"><label>Reference designs</label>
            <select value={f.refs} onChange={set('refs')}>
              <option value="required">Required (1 to 3 images)</option>
              <option value="optional">Optional</option>
              <option value="none">Do not ask (e.g. videography)</option>
            </select></div>
        )}
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Visible on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold">{editing ? 'Save changes' : 'Create category'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setF(blank); setEditing(null); setError(''); }}>Cancel</button>}
        </div>
      </form>

      <div>
        <p className="mute small">Use the arrows to set the order on the website. After creating a category, add its services in the Services and prices tab.</p>
        {list.length === 0 && <p className="mute">No categories yet.</p>}
        {list.map((c, i) => (
          <div key={c.id} className="mini" style={{ opacity: c.active ? 1 : 0.55 }}>
            <span className="thumb">{c.icon}</span>
            <div className="grow">
              <b>{c.label}</b>{!c.active && <span className="mute small"> (hidden)</span>}<br />
              <span className="pill">{c.kind === 'professional' ? 'Professional' : 'Creative'}</span>{' '}
              <span className="pill">{c.kind === 'professional' ? 'Letter of engagement' : REF_LABEL[c.refs]}</span>{' '}
              <span className="mute small">{c.n} service{c.n === 1 ? '' : 's'}</span>
            </div>
            <div className="acts">
              <button className="btn sm" disabled={i === 0} onClick={() => shift(c, 'up')} aria-label="Move up">▲</button>
              <button className="btn sm" disabled={i === list.length - 1} onClick={() => shift(c, 'down')} aria-label="Move down">▼</button>
              <button className="btn sm" onClick={() => { setF({ ...blank, ...c }); setEditing(c.id); setError(''); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn sm" onClick={() => toggle(c)}>{c.active ? 'Hide' : 'Show'}</button>
              <button className="btn sm danger" onClick={() => remove(c)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
