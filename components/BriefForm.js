'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { shrink } from '@/lib/shrink';

export default function BriefForm({ serviceId, refsMode = 'optional', ai = false }) {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [tips, setTips] = useState([]);
  const [v, setV] = useState({ title: '', description: '', style: '', deadline: '' });
  const [files, setFiles] = useState([null, null, null]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const showRefs = refsMode !== 'none';
  const picked = showRefs ? files.filter(Boolean) : [];

  async function draft() {
    setAiBusy(true); setAiMsg(''); setTips([]);
    try {
      const r = await fetch('/api/ai/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId, idea }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'The brief helper is not available.');
      setV((x) => ({ ...x, title: d.title || x.title, description: d.description || x.description, style: d.style || x.style }));
      setTips(d.tips || []);
    } catch (e2) { setAiMsg(e2.message); }
    setAiBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (refsMode === 'required' && picked.length < 1) return setError('Add at least one reference design (up to three).');
    setBusy(true);
    try {
      const refs = [];
      for (const orig of picked) {
        const file = await shrink(orig);
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Upload failed');
        refs.push(d.url);
      }
      const r = await fetch('/api/engagements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, brief: v, refs }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not send brief');
      router.push('/inbox/' + d.id);
      router.refresh();
    } catch (e2) {
      setError(e2.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {ai && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <label>Not sure how to write it? Describe it in a sentence or two and we will draft your brief (AI)</label>
          <textarea style={{ minHeight: 70 }} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. A flyer for our church youth conference on 14 December" />
          <p className="mute small">This uses an outside AI service, so please do not include private or sensitive details. You can edit everything afterwards.</p>
          <button type="button" className="btn" disabled={aiBusy || idea.trim().length < 10} onClick={draft}>{aiBusy ? 'Drafting...' : 'Draft my brief'}</button>
          {aiMsg && <p className="error" style={{ marginTop: 10 }}>{aiMsg}</p>}
          {tips.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p className="small mute" style={{ marginBottom: 4 }}>Worth adding to your brief:</p>
              <ul className="small mute" style={{ margin: 0, paddingLeft: 18 }}>{tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      <div className="field"><label>Project title</label><input className="input" value={v.title} onChange={set('title')} required /></div>
      <div className="field"><label>Your brief: what do you need and who is it for?</label><textarea value={v.description} onChange={set('description')} required /></div>
      <div className="field"><label>Style, colours or mood (optional)</label><input className="input" value={v.style} onChange={set('style')} /></div>
      <div className="field"><label>Deadline (optional)</label><input className="input" type="date" value={v.deadline} onChange={set('deadline')} /></div>
      {showRefs && (
        <>
          <h3>Reference designs {refsMode === 'required' ? '(1 required, up to 3)' : '(optional, up to 3)'}</h3>
          <p className="mute small">Upload images you like. JPG, PNG or WebP. Big phone photos are shrunk for you automatically.</p>
          <div className="refs" style={{ marginBottom: 18 }}>
            {files.map((file, i) => (
              <label key={i} style={{ cursor: 'pointer' }}>
                {file ? <img src={URL.createObjectURL(file)} alt={'Reference ' + (i + 1)} /> :
                  <span className="panel" style={{ width: 92, height: 92, display: 'grid', placeItems: 'center', padding: 0 }}>＋ {i + 1}</span>}
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden
                  onChange={(e) => setFiles(files.map((x, j) => (j === i ? e.target.files[0] || null : x)))} />
              </label>
            ))}
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
      <button className="btn gold" disabled={busy}>{busy ? 'Sending...' : 'Send brief'}</button>
    </form>
  );
}
