export function sniff(buf) {
  const u = new Uint8Array(buf.slice(0, 16));
  const is = (...a) => a.every((v, i) => u[i] === v);
  if (is(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (is(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (is(0x52, 0x49, 0x46, 0x46) && u[8] === 0x57 && u[9] === 0x45 && u[10] === 0x42 && u[11] === 0x50) return 'image/webp';
  if (is(0x25, 0x50, 0x44, 0x46)) return 'application/pdf';
  return '';
}
export const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
