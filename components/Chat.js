'use client';
import { useEffect, useRef, useState } from 'react';
import { STATUS } from '@/lib/cats';
import { money } from '@/lib/util';

export default function Chat({ id, admin = false }) {
  const [msgs, setMsgs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const last = useRef(0);
  const box = useRef(null);

  async function load() {
    const r = await fetch('/api/engagements/' + id + '/messages?after=' + last.current, { cache: 'no-store' });
    if (!r.ok) return;
    const d = await r.json();
    setMeta(d.meta);
    if (d.messages.length) {
      last.current = d.messages[d.messages.length - 1].id;
      setMsgs((m) => [...m, ...d.messages]);
    }
  }
  useEffect(() => {
    last.current = 0; setMsgs([]);
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [id]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('paid');
    if (p === '1') setNote('Payment received. Thank you.');
    if (p === '0') setNote('The payment was not completed. You can try again below.');
  }, []);
  useEffect(() => { box.current && box.current.scrollTo(0, box.current.scrollHeight); }, [msgs.length]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    await fetch('/api/engagements/' + id + '/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
    });
    load();
  }

  async function pay(kind) {
    setBusy(true); setNote('');
    const r = await fetch('/api/engagements/' + id + '/pay', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setBusy(false); return setNote(d.error || 'Could not start the payment.'); }
    window.location.href = d.url; // PayChangu checkout: Airtel Money, Mpamba, card or bank
  }

  const mine = admin ? 'admin' : 'user';
  const due = meta && (meta.status === 'awaiting_deposit' || meta.status === 'deposit_reported') ? 'deposit' : meta && meta.balance > 0 ? 'balance' : null;
  const amount = due === 'deposit' ? meta.deposit : meta && meta.balance;

  return (
    <div>
      {meta && <p className="mute small">Status: <span className="pill y">{STATUS[meta.status] || meta.status}</span></p>}
      {note && <p className="okmsg">{note}</p>}
      {!admin && due && (
        <div className="bill">
          <b>{due === 'deposit' ? 'Billing notice: 50% deposit' : 'Balance due'}</b>
          <p style={{ margin: '6px 0' }}>
            {due === 'deposit' ? 'Total ' + money(meta.total, meta.currency) + '. Please pay 50% now: ' : 'Your work is complete. Remaining balance: '}
            <b style={{ color: 'var(--gold)' }}>{money(amount, meta.currency)}</b>.
            {due === 'deposit' && ' Work starts as soon as the payment is confirmed.'}
          </p>
          {meta.online ? (
            <>
              <button className="btn gold" disabled={busy} onClick={() => pay(due)}>{busy ? 'Opening checkout...' : 'Pay ' + money(amount, meta.currency)}</button>
              <p className="mute small" style={{ margin: '8px 0 0' }}>Pay with Airtel Money, TNM Mpamba, card or bank on the secure PayChangu page.</p>
            </>
          ) : <p className="mute small">Online payment is not available yet. Please message us to arrange payment.</p>}
          {meta.pay_note && <p className="mute small" style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>Other ways to pay: {meta.pay_note}</p>}
        </div>
      )}
      <div className="chat">
        <div className="msgs" ref={box}>
          {msgs.length === 0 && <p className="mute" style={{ margin: 'auto' }}>Private chat. Only you and Wathu Digital can see this.</p>}
          {msgs.map((m) => (
            <div key={m.id} className={'bub ' + (m.sender === 'system' ? 'sys' : m.sender === mine ? 'me' : '')}>
              {m.body}
              <time>{new Date(m.created_at).toLocaleString()}</time>
            </div>
          ))}
        </div>
        <form className="compose" onSubmit={send}>
          <input className="input" enterKeyHint="send" autoComplete="off" placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn gold">Send</button>
        </form>
      </div>
    </div>
  );
}
