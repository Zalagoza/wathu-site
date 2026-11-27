import { clean, cleanUrl } from '@/lib/util';

const KINDS = ['news', 'offer', 'announcement', 'event'];

export function readUpdate(b) {
  const title = clean(b.title, 150);
  if (title.length < 2) return { error: 'Enter a title.' };
  const body = clean(b.body, 6000);
  if (body.length < 5) return { error: 'Write the update text.' };
  const image = clean(b.image_url, 600);
  if (image && !image.startsWith('https://')) return { error: 'Invalid image link.' };
  const link = cleanUrl(b.link_url);
  if (clean(b.link_url) && !link) return { error: 'The link must start with http:// or https://' };
  const d = new Date(b.published_at);
  return {
    v: {
      title, body, image_url: image, link_url: link,
      kind: KINDS.includes(b.kind) ? b.kind : 'news',
      link_label: link ? clean(b.link_label, 40) || 'Learn more' : '',
      pinned: !!b.pinned, active: b.active !== false,
      published_at: isNaN(d) ? new Date().toISOString() : d.toISOString(),
    },
  };
}
