import { q } from '@/lib/db';

const TABLES = { team: 'team', certificates: 'certificates', categories: 'categories' };

// Moves one row up or down in the display order, then renumbers the whole list.
export async function move(table, id, dir) {
  const t = TABLES[table];
  if (!t) return;
  const rows = await q('select id from ' + t + ' order by sort, id');
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(Number(id));
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) await q('update ' + t + ' set sort = $1 where id = $2', [k, ids[k]]);
}
