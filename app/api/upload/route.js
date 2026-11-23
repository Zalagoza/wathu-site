import { put } from '@vercel/blob';
import { getUser } from '@/lib/auth';
import { ok, err } from '@/lib/util';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
  const user = await getUser();
  if (!user) return err('Please sign in.', 401);
  const file = (await req.formData()).get('file');
  if (!file || typeof file === 'string') return err('No file received.');
  if (!TYPES.includes(file.type)) return err('Only JPG, PNG or WebP images are allowed.');
  if (file.size > 4 * 1024 * 1024) return err('Each image must be under 4 MB.');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
  const blob = await put('refs/' + user.id + '/' + safe, file, { access: 'public', addRandomSuffix: true });
  return ok({ url: blob.url });
}
