import { SITE } from '@/lib/seo';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/inbox', '/alerts', '/e/', '/b/', '/in', '/join'] }],
    sitemap: SITE + '/sitemap.xml',
  };
}
