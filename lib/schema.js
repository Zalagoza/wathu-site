import { SITE, BRAND, CITY } from '@/lib/seo';
import { svcPath } from '@/lib/text';

const ctx = 'https://schema.org';

// The business itself. Contact details and social links come from the footer you edit in the admin.
export function orgSchema(footer, cats = []) {
  const f = footer || {};
  const same = Object.values(f.social || {}).filter(Boolean);
  return {
    '@context': ctx,
    '@type': 'ProfessionalService',
    '@id': SITE + '/#business',
    name: BRAND,
    url: SITE,
    description: 'Graphic design, web design, photography, videography, digital forensics, cybersecurity and ICT support in Malawi.',
    image: SITE + '/og?t=' + encodeURIComponent(BRAND),
    areaServed: { '@type': 'Country', name: 'Malawi' },
    address: { '@type': 'PostalAddress', addressLocality: CITY, addressCountry: 'MW', ...(f.address ? { streetAddress: f.address } : {}) },
    ...(f.phone ? { telephone: f.phone } : {}),
    ...(f.email ? { email: f.email } : {}),
    ...(same.length ? { sameAs: same } : {}),
    knowsAbout: cats.map((c) => c.label),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: cats.map((c) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: c.label, description: c.blurb, url: SITE + '/c/' + c.slug } })),
    },
  };
}

export const websiteSchema = () => ({
  '@context': ctx, '@type': 'WebSite', '@id': SITE + '/#website', url: SITE, name: BRAND, inLanguage: 'en',
  publisher: { '@id': SITE + '/#business' },
});

export const faqSchema = (faq) => ({
  '@context': ctx, '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// items: [['Home', '/'], ['Services', '/work'], ...]
export const crumbsSchema = (items) => ({
  '@context': ctx, '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
});

export const serviceSchema = (s) => ({
  '@context': ctx, '@type': 'Service',
  name: s.title,
  description: s.description || s.title,
  serviceType: s.cat_label,
  url: SITE + svcPath(s),
  provider: { '@id': SITE + '/#business' },
  areaServed: { '@type': 'Country', name: 'Malawi' },
  offers: { '@type': 'Offer', url: SITE + svcPath(s), price: String(Number(s.price) || 0), priceCurrency: s.currency || 'MWK', description: 'Priced ' + s.unit },
});
