export const lines = (s) => String(s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
export const tags = (s) => String(s || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
export const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
// Short address for one service, e.g. /work/12-logo-and-brand-identity
export const svcPath = (s) => '/work/' + s.id + '-' + slugify(s.title);
