'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  return null;
}
