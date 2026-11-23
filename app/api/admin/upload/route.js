import { put } from '@vercel/blob';
import { isAdmin } from '@/lib/auth';
import { ok, err } from '@/lib/util';

const IMAGES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const fd = await req.formData();
  const file = fd.get('file');
  const kind = fd.get('kind') === 'cert' ? 'cert' : 'photo';
  if (!file || typeof file === 'string') return err('No file received.');
  const allowed = kind === 'cert' ? [...IMAGES, 'application/pdf'] : IMAGES;
  if (!allowed.includes(file.type)) return err(kind === 'cert' ? 'Use a JPG, PNG, WebP or PDF file.' : 'Use a JPG, PNG or WebP image.');
  if (file.size > 4 * 1024 * 1024) return err('File must be under 4 MB. Compress it and try again.');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
  try {
    const blob = await put((kind === 'cert' ? 'certs/' : 'team/') + safe, file, { access: 'public', addRandomSuffix: true });
    return ok({ url: blob.url, type: file.type });
  } catch (e) {
    console.error('Admin upload failed:', e.message);
    return err('Upload failed. Check BLOB_READ_WRITE_TOKEN in .env.local.', 500);
  }
}
