export const lines = (s) => String(s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
export const tags = (s) => String(s || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
export const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
// Short address for one service, e.g. /work/12-logo-and-brand-identity
export const svcPath = (s) => '/work/' + s.id + '-' + slugify(s.title);
export const folioPath = (p) => '/folio/' + p.id + '-' + slugify(p.title);
export const newsPath = (u) => '/news/' + u.id + '-' + slugify(u.title);
// jsonb comes back as an array; be forgiving if it is a string
export const imgs = (v) => { if (Array.isArray(v)) return v; try { const x = JSON.parse(v); return Array.isArray(x) ? x : []; } catch { return []; } };
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
