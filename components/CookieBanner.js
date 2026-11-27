'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsent, setConsent } from '@/lib/consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (getConsent() === null) setShow(true);
    const open = () => setShow(true);
    window.addEventListener('wdc-cookie-open', open);
    return () => window.removeEventListener('wdc-cookie-open', open);
  }, []);
  if (!show) return null;
  const choose = (v) => { setConsent(v); setShow(false); };
  return (
    <div className="cookie" role="dialog" aria-label="Cookie choices">
      <p style={{ margin: '0 0 12px' }}>
        We use essential cookies to keep you signed in. With your permission we also use a cookie to count visits, so we can see what works and improve the site.{' '}
        <Link href="/cookies" style={{ textDecoration: 'underline' }}>Cookie policy</Link>
      </p>
      <div className="row">
        <button type="button" className="btn gold sm" onClick={() => choose('yes')}>Accept</button>
        <button type="button" className="btn sm" onClick={() => choose('no')}>Decline</button>
      </div>
    </div>
  );
}

// A button that reopens the banner so a visitor can change their choice
export function CookieSettingsButton({ className, children }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event('wdc-cookie-open'))}>
      {children || 'Cookie settings'}
    </button>
  );
}
