import './globals.css';
import { Montserrat, Poppins } from 'next/font/google';
import { SITE, BRAND, TAGLINE, ogUrl } from '@/lib/seo';
import IdleLogout from '@/components/IdleLogout';

const head = Montserrat({ subsets: ['latin'], variable: '--font-head', display: 'swap' });
const body = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body', display: 'swap' });

const DESC = 'Websites, logos and branding, photography, videography, digital forensics and cybersecurity across Malawi. Clear prices in MWK. Start your request online.';

const verification = {};
if (process.env.GOOGLE_SITE_VERIFICATION) verification.google = process.env.GOOGLE_SITE_VERIFICATION;
if (process.env.BING_SITE_VERIFICATION) verification.other = { 'msvalidate.01': process.env.BING_SITE_VERIFICATION };
const image = [{ url: ogUrl(BRAND, TAGLINE), width: 1200, height: 630, alt: BRAND }];

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Web Design, Graphic Design & Security in Malawi | Wathu Digital', template: '%s | ' + BRAND },
  description: DESC,
  applicationName: BRAND,
  authors: [{ name: BRAND }],
  creator: BRAND,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  ...(Object.keys(verification).length ? { verification } : {}),
  openGraph: { title: BRAND, description: DESC, url: '/', siteName: BRAND, type: 'website', locale: 'en_US', images: image },
  twitter: { card: 'summary_large_image', title: BRAND, description: DESC, images: image.map((i) => i.url) },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#14120e' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={head.variable + ' ' + body.variable}>
      <body>{children}<IdleLogout /></body>
    </html>
  );
}
