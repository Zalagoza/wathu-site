'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getConsent } from '@/lib/consent';

export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    const send = () => {
      if (getConsent() !== 'yes') return; // visits are counted only after the visitor accepts cookies
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, referrer: document.referrer }),
        keepalive: true,
      }).catch(() => {});
    };
    send();
    window.addEventListener('wdc-consent', send); // counts the current page right after they accept
    return () => window.removeEventListener('wdc-consent', send);
  }, [path]);
  return null;
}
