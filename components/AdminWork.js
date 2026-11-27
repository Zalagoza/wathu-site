'use client';
import { useEffect, useState } from 'react';
import { call, upload } from '@/components/AdminTeam';
import { PROJECT_KINDS, UPDATE_KINDS } from '@/lib/cats';
import { imgs } from '@/lib/text';

const label = (list, k) => (list.find(([id]) => id === k) || [])[1] || k;

/* ---------------- Projects ---------------- */
const blankP = { title: '', kind: 'artwork', description: '', images: [], link_url: '', managed: false, client: '', year: '', featured: false, active: true };

export function ProjectsAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blankP);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => call('/api/admin/projects', 'GET').then((d) => { if (d.error) setError(d.error); else setList(d.projects || []); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function add(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true); setError('');
    let urls = [...f.images];
    for (const file of files) {
      if (urls.length >= 8) { setError('Up to 8 images per project.'); break; }
      const d = await upload(file, 'work');
      if (d.error) { setError(d.error); break; }
      urls = [...urls, d.url];
      setF((x) => ({ ...x, images: urls }));
    }
    setBusy(false);
  }
  const cover = (u) => setF({ ...f, images: [u, ...f.images.filter((x) => x !== u)] });
  const drop = (u) => setF({ ...f, images: f.images.filter((x) => x !== u) });

  async function save(e) {
    e.preventDefault(); setError('');
    if (busy) return;
    const d = editing ? await call('/api/admin/projects/' + editing, 'PATCH', f) : await call('/api/admin/projects', 'POST', f);
    if (d.error) return setError(d.error);
    setF(blankP); setEditing(null); load();
  }
  async function shift(p, dir) { await call('/api/admin/projects/' + p.id, 'PATCH', { move: dir }); load(); }
  async function patch(p, data) { const d = await call('/api/admin/projects/' + p.id, 'PATCH', data); if (d.error) setError(d.error); load(); }
  async function remove(p) { if (confirm('Remove "' + p.title + '" and its images?')) { await call('/api/admin/projects/' + p.id, 'DELETE'); load(); } }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit project' : 'Add a project'}</h3>
        <div className="field"><label>Type</label>
          <select value={f.kind} onChange={set('kind')}>{PROJECT_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div className="field"><label>Title</label><input className="input" value={f.title} onChange={set('title')} required /></div>
        <div className="field"><label>Description (optional)</label><textarea value={f.description} onChange={set('description')} /></div>
        <div className="field">
          <label>Images: up to 8, JPG, PNG or WebP{f.kind === 'website' ? ' (add a screenshot of the site)' : ''}</label>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={add} />
          {busy && <p className="mute small">Uploading...</p>}
          <div className="thumbs">
            {f.images.map((u, i) => (
              <div key={u} className={'t' + (i === 0 ? ' cover' : '')}>
                <img src={u} alt={'Image ' + (i + 1)} />
                <div className="acts" style={{ marginTop: 4 }}>
                  {i !== 0 && <button type="button" className="btn sm" onClick={() => cover(u)} title="Make cover">Cover</button>}
                  <button type="button" className="btn sm danger" onClick={() => drop(u)}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {f.images.length > 0 && <p className="mute small">The first image is the cover and the link preview picture.</p>}
        </div>
        <div className="field"><label>{f.kind === 'website' ? 'Website link' : 'Link (optional)'}</label><input className="input" inputMode="url" placeholder="https://" value={f.link_url} onChange={set('link_url')} /></div>
        {f.kind === 'website' && <label className="check"><input type="checkbox" checked={f.managed} onChange={set('managed')} /><span>We manage this website</span></label>}
        <div className="row">
          <div className="field" style={{ flex: 2 }}><label>Client (optional)</label><input className="input" value={f.client} onChange={set('client')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Year</label><input className="input" maxLength={20} value={f.year} onChange={set('year')} /></div>
        </div>
        <label className="check"><input type="checkbox" checked={f.featured} onChange={set('featured')} /><span>Feature at the top</span></label>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Visible on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold" disabled={busy}>{editing ? 'Save changes' : 'Add project'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setF(blankP); setEditing(null); setError(''); }}>Cancel</button>}
        </div>
      </form>

      <div>
        <p className="mute small">New projects appear first. Use the arrows to change the order. Featured projects always show before the rest.</p>
        {list.length === 0 && <p className="mute">No projects yet.</p>}
        {list.map((p, i) => (
          <div key={p.id} className="mini" style={{ opacity: p.active ? 1 : 0.55 }}>
            {imgs(p.images)[0] ? <img className="thumb" src={imgs(p.images)[0]} alt={p.title} /> : <span className="thumb">-</span>}
            <div className="grow">
              <b>{p.title}</b>{!p.active && <span className="mute small"> (hidden)</span>}<br />
              <span className="pill">{label(PROJECT_KINDS, p.kind)}</span>{' '}
              {p.featured && <span className="pill y">Featured</span>}{' '}
              {p.managed && <span className="pill g">Managed</span>}
            </div>
            <div className="acts">
              <button className="btn sm" disabled={i === 0} onClick={() => shift(p, 'up')} aria-label="Move up">▲</button>
              <button className="btn sm" disabled={i === list.length - 1} onClick={() => shift(p, 'down')} aria-label="Move down">▼</button>
              <button className="btn sm" onClick={() => { setF({ ...blankP, ...p, images: imgs(p.images) }); setEditing(p.id); setError(''); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn sm" onClick={() => patch(p, { active: !p.active })}>{p.active ? 'Hide' : 'Show'}</button>
              <button className="btn sm danger" onClick={() => remove(p)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Updates ---------------- */
const today = () => new Date().toISOString().slice(0, 10);
const blankU = () => ({ title: '', kind: 'news', body: '', image_url: '', link_url: '', link_label: '', pinned: false, active: true, published_at: today() });

export function UpdatesAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blankU());
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => call('/api/admin/updates', 'GET').then((d) => { if (d.error) setError(d.error); else setList(d.updates || []); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function pick(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setError('');
    const d = await upload(file, 'work');
    setBusy(false);
    if (d.error) return setError(d.error);
    setF((x) => ({ ...x, image_url: d.url }));
  }
  async function save(e) {
    e.preventDefault(); setError('');
    if (busy) return;
    const d = editing ? await call('/api/admin/updates/' + editing, 'PATCH', f) : await call('/api/admin/updates', 'POST', f);
    if (d.error) return setError(d.error);
    setF(blankU()); setEditing(null); load();
  }
  async function patch(u, data) { const d = await call('/api/admin/updates/' + u.id, 'PATCH', data); if (d.error) setError(d.error); load(); }
  async function remove(u) { if (confirm('Remove "' + u.title + '"?')) { await call('/api/admin/updates/' + u.id, 'DELETE'); load(); } }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit update' : 'Post an update'}</h3>
        <div className="field"><label>Type</label>
          <select value={f.kind} onChange={set('kind')}>{UPDATE_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div className="field"><label>Title</label><input className="input" value={f.title} onChange={set('title')} required /></div>
        <div className="field"><label>Text</label><textarea style={{ minHeight: 150 }} value={f.body} onChange={set('body')} required /></div>
        <div className="field">
          <label>Picture (optional, shown in link previews)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
          {busy && <p className="mute small">Uploading...</p>}
          {f.image_url && <div className="thumbs"><div className="t cover"><img src={f.image_url} alt="Preview" /><div className="acts" style={{ marginTop: 4 }}><button type="button" className="btn sm danger" onClick={() => setF({ ...f, image_url: '' })}>✕</button></div></div></div>}
        </div>
        <div className="row">
          <div className="field" style={{ flex: 2 }}><label>Link (optional)</label><input className="input" inputMode="url" placeholder="https://" value={f.link_url} onChange={set('link_url')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Button text</label><input className="input" maxLength={40} placeholder="Learn more" value={f.link_label} onChange={set('link_label')} /></div>
        </div>
        <div className="field"><label>Date</label><input className="input" type="date" value={f.published_at} onChange={set('published_at')} /></div>
        <label className="check"><input type="checkbox" checked={f.pinned} onChange={set('pinned')} /><span>Pin to the top</span></label>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Visible on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold" disabled={busy}>{editing ? 'Save changes' : 'Publish'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setF(blankU()); setEditing(null); setError(''); }}>Cancel</button>}
        </div>
      </form>

      <div>
        <p className="mute small">Pinned updates show first, then the newest by date.</p>
        {list.length === 0 && <p className="mute">No updates yet.</p>}
        {list.map((u) => (
          <div key={u.id} className="mini" style={{ opacity: u.active ? 1 : 0.55 }}>
            {u.image_url ? <img className="thumb" src={u.image_url} alt="" /> : <span className="thumb">-</span>}
            <div className="grow">
              <b>{u.title}</b>{!u.active && <span className="mute small"> (hidden)</span>}<br />
              <span className="pill y">{label(UPDATE_KINDS, u.kind)}</span>{' '}
              {u.pinned && <span className="pill">Pinned</span>}{' '}
              <span className="mute small">{new Date(u.published_at).toLocaleDateString()}</span>
            </div>
            <div className="acts">
              <button className="btn sm" onClick={() => { setF({ ...blankU(), ...u, published_at: String(u.published_at).slice(0, 10) }); setEditing(u.id); setError(''); window.scrollTo(0, 0); }}>Edit</button>
              <button className="btn sm" onClick={() => patch(u, { pinned: !u.pinned })}>{u.pinned ? 'Unpin' : 'Pin'}</button>
              <button className="btn sm" onClick={() => patch(u, { active: !u.active })}>{u.active ? 'Hide' : 'Show'}</button>
              <button className="btn sm danger" onClick={() => remove(u)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
