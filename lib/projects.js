import { clean, cleanUrl } from '@/lib/util';

const KINDS = ['artwork', 'photo', 'website', 'other'];

// Validates and cleans a project coming from the admin form.
export function readProject(b) {
  const title = clean(b.title, 150);
  if (title.length < 2) return { error: 'Enter a title.' };
  const kind = KINDS.includes(b.kind) ? b.kind : 'artwork';
  const images = (Array.isArray(b.images) ? b.images : []).filter((u) => typeof u === 'string' && u.startsWith('https://')).slice(0, 8);
  if (images.length < 1) return { error: 'Add at least one image. For a website, add a screenshot.' };
  const link = cleanUrl(b.link_url);
  if (clean(b.link_url) && !link) return { error: 'The link must start with http:// or https://' };
  if (kind === 'website' && !link) return { error: 'Add the website link.' };
  return {
    v: {
      title, kind, images, link_url: link,
      description: clean(b.description, 4000),
      managed: kind === 'website' && !!b.managed,
      client: clean(b.client, 120), year: clean(b.year, 20),
      featured: !!b.featured, active: b.active !== false,
    },
  };
}
