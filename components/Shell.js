'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  ['/', 'Home', '⌂'],
  ['/work', 'Services', '▦'],
  ['/inbox', 'Messages', '✉'],
  ['/alerts', 'Notifications', '●'],
  ['/crew', 'Our team', '☺'],
  ['/code', 'Terms of conduct', '§'],
];

const TABS = [
  ['/', 'Home', '⌂'],
  ['/work', 'Services', '▦'],
  ['/inbox', 'Messages', '✉'],
  ['/alerts', 'Alerts', '●'],
];

const on = (path, href) => path === href || (href !== '/' && path.startsWith(href));

export default function Shell({ user, recent, unread, children }) {
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(false);
  const path = usePathname();
  const router = useRouter();
  useEffect(() => setOpen(false), [path]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className={'shell' + (col ? ' col' : '') + (open ? ' open' : '')}>
      <aside className="side">
        <div className="stripe" />
        <div className="side-head">
          <Link href="/" className="brand"><span className="mark">W</span><span className="lbl">Wathu Digital</span></Link>
          <button className="icon-btn" aria-label="Toggle sidebar" onClick={() => (window.innerWidth < 821 ? setOpen(false) : setCol(!col))}>◧</button>
        </div>
        <Link href="/work" className="new"><span>＋</span><span className="lbl">New request</span></Link>
        <nav className="nav">
          {NAV.map(([href, label, ic]) => (
            <Link key={href} href={href} className={on(path, href) ? 'on' : ''}>
              <span className="ic">{ic}</span><span className="lbl">{label}</span>
              {href === '/alerts' && unread > 0 && <span className="badge">{unread}</span>}
            </Link>
          ))}
        </nav>
        <div className="recents">
          {recent.length > 0 && <h4>Recent requests</h4>}
          {recent.map((r) => <Link key={r.id} href={'/inbox/' + r.id}>{r.title}</Link>)}
        </div>
        <div className="side-foot">
          {user ? (
            <>
              <span className="avatar">{user.full_name[0]}</span>
              <span className="lbl" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name}</span>
              <button className="icon-btn lbl" onClick={logout} title="Sign out">Sign out</button>
            </>
          ) : (
            <span className="lbl row" style={{ width: '100%' }}>
              <Link href="/in" className="btn sm" style={{ flex: 1 }}>Sign in</Link>
              <Link href="/join" className="btn sm gold" style={{ flex: 1 }}>Create account</Link>
            </span>
          )}
        </div>
      </aside>
      <nav className="tabbar" aria-label="Main">
        {TABS.map(([href, label, ic]) => (
          <Link key={href} href={href} className={'tb' + (on(path, href) ? ' on' : '')}>
            <span className="tic">{ic}</span><span>{label}</span>
            {href === '/alerts' && unread > 0 && <span className="badge">{unread}</span>}
          </Link>
        ))}
        <button className="tb" onClick={() => setOpen(true)} aria-label="Open menu"><span className="tic">☰</span><span>Menu</span></button>
      </nav>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <div className="topbar">
          <button className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}>☰</button>
          <span className="brand"><span className="mark">W</span>Wathu Digital</span>
        </div>
        {children}
      </div>
    </div>
  );
}
