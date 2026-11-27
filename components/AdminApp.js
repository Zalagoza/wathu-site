'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { TeamAdmin, CertsAdmin } from '@/components/AdminTeam';
import CategoriesAdmin from '@/components/AdminCategories';
import { ProjectsAdmin, UpdatesAdmin } from '@/components/AdminWork';
import { AiSummary, ActivityLog } from '@/components/AdminTools';
import { STATUS } from '@/lib/cats';
import { money } from '@/lib/util';

const api = async (path, opt) => {
  const o = opt && opt.body ? { ...opt, headers: { 'Content-Type': 'application/json' } } : opt;
  try {
    const r = await fetch(path, o);
    const d = await r.json().catch(() => null);
    if (!r.ok || !d) return { error: (d && d.error) || 'Request failed (' + r.status + '). Check the terminal running npm run dev.' };
    return d;
  } catch { return { error: 'Network error.' }; }
};
const J = (method, data) => ({ method, body: JSON.stringify(data) });
const countryName = (c) => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(c); } catch { return c; } };

export default function AdminApp() {
  const [tab, setTab] = useState('analytics');
  const router = useRouter();
  async function out() { await api('/api/admin/login', { method: 'DELETE' }); router.refresh(); }
  return (
    <div>
      <div className="stripe" />
      <div className="adm">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Wathu Digital studio</h2>
          <button className="btn sm" onClick={out}>Sign out</button>
        </div>
        <div className="tabs">
          {[['analytics', 'Analytics'], ['requests', 'Requests'], ['services', 'Services and prices'], ['categories', 'Categories'], ['projects', 'Projects'], ['updates', 'Updates'], ['team', 'Team'], ['certs', 'Certificates'], ['activity', 'Activity']].map(([k, l]) => (
            <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {tab === 'analytics' && <Analytics />}
        {tab === 'requests' && <Requests />}
        {tab === 'services' && <Services />}
        {tab === 'categories' && <CategoriesAdmin />}
        {tab === 'projects' && <ProjectsAdmin />}
        {tab === 'updates' && <UpdatesAdmin />}
        {tab === 'team' && <TeamAdmin />}
        {tab === 'certs' && <CertsAdmin />}
        {tab === 'activity' && <ActivityLog />}
      </div>
    </div>
  );
}

/* ---------------- Analytics ---------------- */
function Analytics() {
  const [days, setDays] = useState(30);
  const [country, setCountry] = useState('');
  const [d, setD] = useState(null);
  useEffect(() => { api('/api/admin/analytics?days=' + days + '&country=' + country).then(setD); }, [days, country]);
  if (!d || d.error || !d.daily) return <p className="mute">{d && d.error ? d.error : 'Loading...'}</p>;
  const max = Math.max(1, ...d.daily.map((x) => x.v));
  const List = ({ title, rows, a, b }) => (
    <div className="panel"><h3>{title}</h3>
      <table><tbody>{rows.length === 0 && <tr><td className="mute">No data yet</td></tr>}
        {rows.map((r, i) => <tr key={i}><td>{a(r)}</td><td style={{ textAlign: 'right' }}>{b(r)}</td></tr>)}</tbody></table>
    </div>
  );
  return (
    <div>
      <div className="row" style={{ marginBottom: 18 }}>
        <select style={{ width: 'auto' }} value={days} onChange={(e) => setDays(+e.target.value)}>
          {[7, 30, 90, 365].map((n) => <option key={n} value={n}>Last {n} days</option>)}
        </select>
        <select style={{ width: 'auto' }} value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {d.allCountries.map((c) => <option key={c} value={c}>{countryName(c)}</option>)}
        </select>
        <span className="mute small">Bots and crawlers are counted separately and left out of the visitor numbers.</span>
      </div>
      <div className="stats">
        <div className="stat"><b>{d.summary.visitors}</b>Real visitors</div>
        <div className="stat"><b>{d.summary.views}</b>Page views</div>
        <div className="stat"><b>{d.summary.bots}</b>Bot hits filtered out</div>
      </div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <h3>Visitors per day</h3>
        <div className="bars">{d.daily.map((x) => <i key={x.d} title={x.d + ': ' + x.v} style={{ height: (x.v / max) * 100 + '%' }} />)}</div>
      </div>
      <div className="two">
        <List title="Countries" rows={d.countries} a={(r) => countryName(r.country)} b={(r) => r.v} />
        <List title="Cities" rows={d.cities} a={(r) => r.city + ', ' + r.country} b={(r) => r.v} />
        <List title="Top pages" rows={d.paths} a={(r) => r.path} b={(r) => r.v} />
        <List title="Where visitors come from" rows={d.refs} a={(r) => r.referrer} b={(r) => r.v} />
        <List title="Bots filtered out" rows={d.bots} a={(r) => r.name} b={(r) => r.v} />
      </div>
      <div className="panel" style={{ overflow: 'auto' }}>
        <h3>Latest visitors</h3>
        <table><thead><tr><th>Time</th><th>Page</th><th>Location</th><th>From</th></tr></thead>
          <tbody>{d.recent.map((r, i) => (
            <tr key={i}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.path}</td><td>{(r.city || 'Unknown') + (r.country ? ', ' + countryName(r.country) : '')}</td><td>{r.referrer || 'Direct'}</td></tr>
          ))}</tbody></table>
      </div>
      <p className="mute small">Location comes from Vercel headers, so it shows after you deploy (not on localhost).</p>
    </div>
  );
}

/* ---------------- Requests ---------------- */
function Requests() {
  const [list, setList] = useState([]);
  const [sel, setSel] = useState(null);
  const [total, setTotal] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => api('/api/admin/engagements').then((d) => setList(d.engagements || []));
  useEffect(() => { load(); }, []);
  const e = list.find((x) => x.id === sel);

  async function bill() {
    const d = await api('/api/admin/engagements/' + e.id + '/billing', J('POST', { total, note }));
    setMsg(d.error || 'Billing notice sent. Deposit: ' + money(d.deposit, e.currency));
    load();
  }
  async function status(s) { await api('/api/admin/engagements/' + e.id, J('PATCH', { status: s })); load(); }

  return (
    <div className="split">
      <div>
        {list.length === 0 && <p className="mute">No requests yet.</p>}
        {list.map((x) => (
          <button key={x.id} className={'item' + (sel === x.id ? ' on' : '')} onClick={() => { setSel(x.id); setTotal(x.total_amount || x.price || ''); setNote(x.pay_note || ''); setMsg(''); setTimeout(() => { if (window.innerWidth < 821) { const el = document.getElementById('req-detail'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }, 60); }}>
            <b>{x.full_name}</b> <span className="mute small">{x.title}</span><br />
            <span className="pill y">{STATUS[x.status] || x.status}</span>
          </button>
        ))}
      </div>
      <div id="req-detail">
        {!e ? <p className="mute">Pick a request to open it.</p> : (
          <div>
            <div className="panel" style={{ marginBottom: 16 }}>
              <h3>{e.title}</h3>
              <p className="mute small">{e.full_name}, {e.phone}, {e.location}</p>
              {e.kind === 'professional' && <p><b>Matter:</b> {e.details}<br /><span className="mute small">Signed by {e.signed_name} on {new Date(e.signed_at).toLocaleString()}</span></p>}
              {e.brief && <div><p><b>{e.brief.title}</b><br />{e.brief.description}</p>
                {e.brief.style && <p className="mute small">Style: {e.brief.style}</p>}
                {e.brief.deadline && <p className="mute small">Deadline: {e.brief.deadline}</p>}
                <div className="refs">{(e.refs || []).map((u) => <a key={u} href={u} target="_blank"><img src={u} alt="Reference" /></a>)}</div></div>}
              <div className="row" style={{ marginTop: 14 }}>
                <select style={{ width: 'auto' }} value={e.status} onChange={(ev) => status(ev.target.value)}>
                  {Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="panel" style={{ marginBottom: 16 }}>
              <h3>Billing notice</h3>
              <div className="row">
                <div className="field" style={{ flex: 1 }}><label>Total price ({e.currency})</label><input className="input" type="number" value={total} onChange={(ev) => setTotal(ev.target.value)} /></div>
                <div className="field" style={{ flex: 1 }}><label>Deposit due (50%)</label><input className="input" readOnly value={total ? Math.round(total / 2).toLocaleString('en-US') : ''} /></div>
              </div>
              <div className="field"><label>How to pay (account or mobile money details)</label><textarea value={note} onChange={(ev) => setNote(ev.target.value)} /></div>
              {msg && <p className="okmsg">{msg}</p>}
              <button className="btn gold" onClick={bill}>Send billing notice</button>
            </div>
            <AiSummary id={e.id} kind={e.kind} />
            <Chat id={e.id} admin />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Services ---------------- */
const blank = { category: '', title: '', description: '', price: '', currency: 'MWK', unit: 'per project', sticker_on: false, sticker_text: 'Offer', active: true };

function Services() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = () => api('/api/admin/services').then((d) => setList(d.services || []));
  useEffect(() => {
    load();
    api('/api/admin/categories').then((d) => {
      const c = d.categories || [];
      setCats(c);
      setF((x) => (x.category || !c.length ? x : { ...x, category: c[0].slug }));
    });
  }, []);
  const catOf = (slug) => cats.find((c) => c.slug === slug);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const pro = catOf(f.category)?.kind === 'professional';
  const reset = () => { setF({ ...blank, category: cats[0] ? cats[0].slug : '' }); setEditing(null); };

  async function save(e) {
    e.preventDefault(); setError('');
    const d = editing ? await api('/api/admin/services/' + editing, J('PATCH', f)) : await api('/api/admin/services', J('POST', f));
    if (d.error) return setError(d.error);
    reset(); load();
  }
  async function patch(s, data) { await api('/api/admin/services/' + s.id, J('PATCH', data)); load(); }
  async function del(s) { if (confirm('Remove "' + s.title + '"?')) { await api('/api/admin/services/' + s.id, { method: 'DELETE' }); load(); } }

  return (
    <div className="split wide">
      <form className="panel" onSubmit={save} style={{ alignSelf: 'start' }}>
        <h3>{editing ? 'Edit service' : 'Add a service'}</h3>
        <div className="field"><label>Category (create new ones in the Categories tab)</label>
          <select value={f.category} onChange={set('category')} required>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.label}{c.active ? '' : ' (hidden)'}</option>)}
          </select></div>
        <div className="field"><label>Title</label><input className="input" value={f.title} onChange={set('title')} required /></div>
        <div className="field"><label>Description</label><textarea value={f.description} onChange={set('description')} /></div>
        <div className="row">
          <div className="field" style={{ flex: 2 }}><label>Price</label><input className="input" type="number" min="0" value={f.price} onChange={set('price')} required /></div>
          <div className="field" style={{ flex: 1 }}><label>Currency</label><input className="input" value={f.currency} onChange={set('currency')} /></div>
        </div>
        <div className="field"><label>Unit (per hour, per project...)</label><input className="input" value={f.unit} onChange={set('unit')} /></div>
        {!pro && (
          <div className="field">
            <label className="check"><input type="checkbox" checked={f.sticker_on} onChange={set('sticker_on')} /><span>Show promotion sticker</span></label>
            {f.sticker_on && <input className="input" placeholder="Sticker text, e.g. 20% off" maxLength={20} value={f.sticker_text} onChange={set('sticker_text')} />}
          </div>
        )}
        {pro && <p className="mute small">Professional categories never show promotion stickers.</p>}
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /><span>Visible on the website</span></label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn gold">{editing ? 'Save changes' : 'Add service'}</button>
          {editing && <button type="button" className="btn" onClick={reset}>Cancel</button>}
        </div>
      </form>
      <div className="panel" style={{ overflow: 'auto' }}>
        <table>
          <thead><tr><th>Service</th><th>Price</th><th>Sticker</th><th></th></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.id} style={{ opacity: s.active ? 1 : 0.5 }}>
              <td><b>{s.title}</b><br /><span className="mute small">{catOf(s.category)?.label || s.category}{s.active ? '' : ' (hidden)'}</span></td>
              <td>{money(s.price, s.currency)}<br /><span className="mute small">{s.unit}</span></td>
              <td>{catOf(s.category)?.kind === 'professional' ? <span className="mute small">Not allowed</span> :
                <button className={'btn sm' + (s.sticker_on ? ' gold' : '')} onClick={() => patch(s, { sticker_on: !s.sticker_on })}>{s.sticker_on ? 'On: ' + s.sticker_text : 'Off'}</button>}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <button className="btn sm" onClick={() => { setF({ ...s, price: s.price }); setEditing(s.id); window.scrollTo(0, 0); }}>Edit</button>{' '}
                <button className="btn sm danger" onClick={() => del(s)}>Remove</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
