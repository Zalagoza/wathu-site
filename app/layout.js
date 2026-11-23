import './globals.css';
import { Montserrat, Poppins } from 'next/font/google';
import { SITE, BRAND, TAGLINE, ogUrl } from '@/lib/seo';

const head = Montserrat({ subsets: ['latin'], variable: '--font-head', display: 'swap' });
const body = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body', display: 'swap' });

const DESC = 'Graphic design, web design, photography, videography, digital forensics, cybersecurity and ICT support.';
const image = [{ url: ogUrl(BRAND, TAGLINE), width: 1200, height: 630, alt: BRAND }];

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: BRAND + ': ' + TAGLINE, template: '%s | ' + BRAND },
  description: DESC,
  applicationName: BRAND,
  openGraph: { title: BRAND, description: DESC, url: '/', siteName: BRAND, type: 'website', locale: 'en_US', images: image },
  twitter: { card: 'summary_large_image', title: BRAND, description: DESC, images: image.map((i) => i.url) },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#14120e' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={head.variable + ' ' + body.variable}>
      <body>{children}</body>
    </html>
  );
}
