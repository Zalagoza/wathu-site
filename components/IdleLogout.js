'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const IDLE_MS = 15 * 60 * 1000;   // keep equal to IDLE_MINUTES in lib/auth.js
const PING_MS = 60 * 1000;        // renew the session at most once a minute while the person is active

async function post(url, method) {
  try {
    const r = await fetch(url, { method: method || 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: method === 'DELETE' ? undefined : '{}' });
    return await r.json();
  } catch { return null; }
}

export default function IdleLogout() {
  const pathname = usePathname();
  const pingRef = useRef(null);

  useEffect(() => {
    let last = Date.now();
    let lastPing = 0;
    let state = { user: false, admin: false };
    let done = false;

    async function ping() {
      lastPing = Date.now();
      const d = await post('/api/session/touch');
      if (!d || done) return;
      const was = state.user || state.admin;
      state = { user: !!d.user, admin: !!d.admin };
      // the server already ended the session (for example the device was asleep): refresh so the page matches
      if (was && !state.user && !state.admin) { done = true; window.location.reload(); }
    }
    pingRef.current = ping;

    async function expire() {
      if (done) return;
      done = true;
      const s = state;
      if (s.user) await post('/api/auth/logout');
      if (s.admin) await post('/api/admin/login', 'DELETE');
      if (s.user || s.admin) window.location.reload();
    }

    function check() {
      if (Date.now() - last >= IDLE_MS) expire();
    }

    function onActivity() {
      if (done) return;
      const now = Date.now();
      if (now - last >= IDLE_MS) { expire(); return; }
      last = now;
      const gap = state.user || state.admin ? PING_MS : PING_MS * 2;
      if (now - lastPing > gap) ping();
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel', 'click'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    const timer = setInterval(check, 30000);
    ping();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
      clearInterval(timer);
    };
  }, []);

  // a page change is activity too, and it is when a fresh sign-in gets noticed
  useEffect(() => { if (pingRef.current) pingRef.current(); }, [pathname]);

  return null;
}
