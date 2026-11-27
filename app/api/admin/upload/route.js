import { put } from '@vercel/blob';
import { isAdmin } from '@/lib/auth';
import { sniff, EXT } from '@/lib/files';
import { ok, err } from '@/lib/util';

const IMAGES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const fd = await req.formData();
  const file = fd.get('file');
  const k = fd.get('kind');
  const kind = k === 'cert' ? 'cert' : k === 'work' ? 'work' : 'photo';
  if (!file || typeof file === 'string') return err('No file received.');
  if (file.size > 4 * 1024 * 1024) return err('File must be under 4 MB. Compress it and try again.');
  const buf = await file.arrayBuffer();
  const type = sniff(buf); // what the file really is, not what its name claims
  const allowed = kind === 'cert' ? [...IMAGES, 'application/pdf'] : IMAGES;
  if (!allowed.includes(type)) return err(kind === 'cert' ? 'Use a JPG, PNG, WebP or PDF file.' : 'Use a JPG, PNG or WebP image.');
  const base = String(file.name).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(-40) || 'file';
  try {
    const blob = await put((kind === 'cert' ? 'certs/' : kind === 'work' ? 'work/' : 'team/') + base + '.' + EXT[type], Buffer.from(buf), { access: 'public', addRandomSuffix: true, contentType: type });
    return ok({ url: blob.url, type });
  } catch (e) {
    console.error('Admin upload failed:', e.message);
    return err('Upload failed. Check BLOB_READ_WRITE_TOKEN in .env.local.', 500);
  }
}
