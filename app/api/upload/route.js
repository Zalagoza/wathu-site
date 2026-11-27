import { put } from '@vercel/blob';
import { getUser } from '@/lib/auth';
import { sniff, EXT } from '@/lib/files';
import { blocked, record } from '@/lib/limit';
import { ok, err } from '@/lib/util';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
  const user = await getUser();
  if (!user) return err('Please sign in.', 401);
  if (await blocked('upload:' + user.id, 30, 3600)) return err('Too many uploads. Please try again later.', 429);
  const file = (await req.formData()).get('file');
  if (!file || typeof file === 'string') return err('No file received.');
  if (file.size > 4 * 1024 * 1024) return err('Each image must be under 4 MB.');
  const buf = await file.arrayBuffer();
  const type = sniff(buf); // what the file really is, not what its name claims
  if (!TYPES.includes(type)) return err('Only JPG, PNG or WebP images are allowed.');
  await record('upload:' + user.id);
  const base = String(file.name).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(-40) || 'image';
  const blob = await put('refs/' + user.id + '/' + base + '.' + EXT[type], Buffer.from(buf), { access: 'public', addRandomSuffix: true, contentType: type });
  return ok({ url: blob.url });
}
