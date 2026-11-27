'use client';
import { useEffect, useState } from 'react';
import { call } from '@/components/AdminTeam';

const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['x', 'X (Twitter)'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube']];
const blank = { about: '', address: '', phone: '', email: '', whatsapp: '', copyright: '', social: {} };

export default function FooterAdmin() {
  const [f, setF] = useState(blank);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    call('/api/admin/footer', 'GET').then((d) => {
      if (d.error) setError(d.error);
      else setF({ ...blank, ...d.footer, social: { ...(d.footer.social || {}) } });
    });
  }, []);
  const set = (k) => (e) => { setSaved(false); setF({ ...f, [k]: e.target.value }); };
  const setS = (k) => (e) => { setSaved(false); setF({ ...f, social: { ...f.social, [k]: e.target.value } }); };

  async function save(e) {
    e.preventDefault(); setError(''); setSaved(false); setBusy(true);
    const d = await call('/api/admin/footer', 'PUT', f);
    setBusy(false);
    if (d.error) return setError(d.error);
    setSaved(true);
  }

  return (
    <form className="panel" onSubmit={save} style={{ maxWidth: 640 }}>
      <h3>Website footer</h3>
      <p className="mute small">This is the footer at the bottom of every public page. Leave a box empty to hide that part. The legal links and the cookie settings link are always shown.</p>
      <div className="field"><label>About us (short line under the name)</label><textarea value={f.about} onChange={set('about')} maxLength={400} /></div>
      <div className="field"><label>Address</label><input className="input" value={f.address} onChange={set('address')} placeholder="e.g. Area 47, Lilongwe, Malawi" /></div>
      <div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set('phone')} placeholder="+265 ..." /></div>
      <div className="field"><label>WhatsApp number (digits with country code)</label><input className="input" value={f.whatsapp} onChange={set('whatsapp')} placeholder="265..." inputMode="numeric" /></div>
      <div className="field"><label>Email</label><input className="input" type="email" value={f.email} onChange={set('email')} /></div>
      <h4 style={{ margin: '22px 0 10px' }}>Social media links (full address starting with https://)</h4>
      {SOCIAL.map(([k, label]) => (
        <div className="field" key={k}><label>{label}</label><input className="input" value={f.social[k] || ''} onChange={setS(k)} placeholder="https://" /></div>
      ))}
      <div className="field"><label>Copyright line (the year is added for you)</label><input className="input" value={f.copyright} onChange={set('copyright')} placeholder="Wathu Digital Creations. All rights reserved." /></div>
      {error && <p className="error">{error}</p>}
      {saved && <p className="okmsg">Saved. The footer on the website is updated.</p>}
      <button className="btn gold" disabled={busy}>{busy ? 'Saving...' : 'Save footer'}</button>
    </form>
  );
}
