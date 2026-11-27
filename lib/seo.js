export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000')
).replace(/\/$/, '');

export const BRAND = 'Wathu Digital Creations';
export const TAGLINE = 'Design, media and digital security';

export const ogUrl = (t, s) => '/og?t=' + encodeURIComponent(t) + '&s=' + encodeURIComponent(s || TAGLINE);

// One helper so every page gets the same title, description, canonical address and share preview
// (WhatsApp, Facebook, X, LinkedIn, Telegram).
// image: an absolute https address to use as the share picture (for a project cover, for example)
export function pageMeta({ title, description, path = '/', og, sub = TAGLINE, noindex = false, image }) {
  const images = image ? [{ url: image, alt: title }] : [{ url: ogUrl(og || title, sub), width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: title + ' | ' + BRAND, description, url: path, siteName: BRAND, type: 'website', locale: 'en_US', images },
    twitter: { card: 'summary_large_image', title: title + ' | ' + BRAND, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
