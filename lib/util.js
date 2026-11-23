export const money = (n, c = 'MWK') => c + ' ' + Number(n || 0).toLocaleString('en-US');
export const ok = (data = {}) => Response.json(data);
export const err = (message, status = 400) => Response.json({ error: message }, { status });
export const clean = (s, max = 2000) => String(s || '').trim().slice(0, max);
export const normPhone = (p) => String(p || '').replace(/[^0-9+]/g, '');
