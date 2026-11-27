'use client';
import Link from 'next/link';
import { CookieSettingsButton } from '@/components/CookieBanner';
import { normPhone } from '@/lib/util';

const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['x', 'X (Twitter)'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube']];

export default function SiteFooter({ footer }) {
  const f = footer || {};
  const social = SOCIAL.filter(([k]) => f.social && f.social[k]);
  const hasContact = f.address || f.phone || f.email || f.whatsapp;
  return (
    <footer className="site-foot">
      <div className="sf-grid">
        <div>
          <span className="sf-brand">Wathu Digital Creations</span>
          {f.about && <p className="mute small">{f.about}</p>}
        </div>
        {hasContact && (
          <div>
            <h4>Contact</h4>
            {f.address && <p className="mute small">{f.address}</p>}
            {f.phone && <a href={'tel:' + normPhone(f.phone)}>{f.phone}</a>}
            {f.whatsapp && <a href={'https://wa.me/' + String(f.whatsapp).replace(/\D/g, '')} target="_blank" rel="noreferrer">WhatsApp us</a>}
            {f.email && <a href={'mailto:' + f.email}>{f.email}</a>}
          </div>
        )}
        {social.length > 0 && (
          <div>
            <h4>Follow us</h4>
            {social.map(([k, label]) => <a key={k} href={f.social[k]} target="_blank" rel="noreferrer noopener">{label}</a>)}
          </div>
        )}
        <div>
          <h4>Legal</h4>
          <Link href="/tnc">Terms and conditions</Link>
          <Link href="/code">Terms of conduct</Link>
          <Link href="/cookies">Cookie policy</Link>
          <CookieSettingsButton className="sf-link" />
        </div>
      </div>
      <p className="sf-copy mute small" suppressHydrationWarning>{'© ' + new Date().getFullYear() + ' ' + (f.copyright || 'Wathu Digital Creations. All rights reserved.')}</p>
    </footer>
  );
}
