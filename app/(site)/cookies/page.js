import { pageMeta } from '@/lib/seo';
import { CookieSettingsButton } from '@/components/CookieBanner';

export const metadata = pageMeta({
  title: 'Cookie policy',
  description: 'The cookies Wathu Digital Creations uses, why we use them, and how to change your choice.',
  path: '/cookies',
});

const ROWS = [
  ['wdc_session', 'Essential', 'Keeps you signed in to your account. Ends after 15 minutes without activity or when you close the browser.'],
  ['wdc_admin', 'Essential', 'Used only by our staff to sign in to the studio area. Same 15 minute and browser-close limits.'],
  ['wdc_consent', 'Essential', 'Remembers your cookie choice so we do not ask on every visit. Kept for 6 months.'],
  ['wdc_vid', 'Analytics (only if you accept)', 'A random number that lets us count visitors without knowing who they are. Kept for 12 months.'],
];

export default function Cookies() {
  return (
    <div className="page narrow">
      <h1>Cookie policy</h1>
      <p className="mute">Cookies are small files a website saves in your browser. We use as few as we can.</p>

      <div className="ck-wrap">
        <table className="ck-table">
          <thead><tr><th>Cookie</th><th>Type</th><th>What it does</th></tr></thead>
          <tbody>{ROWS.map(([n, t, d]) => <tr key={n}><td><b>{n}</b></td><td>{t}</td><td className="mute">{d}</td></tr>)}</tbody>
        </table>
      </div>

      <h3>What we count when you accept</h3>
      <p className="mute">The pages you open, the country and city your connection appears to be in, the website you came from and your browser type. We do not collect your name or phone number through this, and we do not sell or share it for advertising.</p>

      <h3>If you decline</h3>
      <p className="mute">We do not count your visit and we remove the visitor number from your browser. The site works the same. Essential cookies stay, because signing in does not work without them.</p>

      <h3>Other websites</h3>
      <p className="mute">When you pay online you are sent to PayChangu, and WhatsApp and social media links open those services. They have their own cookie rules.</p>

      <h3>Change your choice</h3>
      <p><CookieSettingsButton className="btn gold">Open cookie settings</CookieSettingsButton></p>
    </div>
  );
}
