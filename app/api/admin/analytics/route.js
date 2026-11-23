import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ok, err } from '@/lib/util';

export async function GET(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  const sp = new URL(req.url).searchParams;
  const days = Math.min(Math.max(parseInt(sp.get('days')) || 30, 1), 365);
  const country = (sp.get('country') || '').toUpperCase().slice(0, 2);

  const W = "created_at > now() - make_interval(days => $1::int) and ($2 = '' or country = $2)";
  const P = [days, country];
  const human = W + ' and not is_bot';

  try {
  const [sum, daily, countries, allCountries, cities, paths, refs, recent, bots] = await Promise.all([
    q('select count(distinct vid) filter (where not is_bot)::int as visitors, count(*) filter (where not is_bot)::int as views, count(*) filter (where is_bot)::int as bots from visits where ' + W, P),
    q("select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as d, count(distinct vid)::int as v from visits where " + human + ' group by 1 order by 1', P),
    q("select coalesce(country,'??') as country, count(distinct vid)::int as v from visits where " + human + ' group by 1 order by v desc limit 15', P),
    q("select distinct country from visits where country is not null and created_at > now() - make_interval(days => $1::int) order by 1", [days]),
    q("select coalesce(city,'Unknown') as city, coalesce(country,'??') as country, count(distinct vid)::int as v from visits where " + human + ' group by 1,2 order by v desc limit 12', P),
    q('select path, count(*)::int as v from visits where ' + human + ' group by 1 order by v desc limit 10', P),
    q("select coalesce(referrer,'Direct') as referrer, count(distinct vid)::int as v from visits where " + human + ' group by 1 order by v desc limit 8', P),
    q('select path, city, country, referrer, created_at from visits where ' + human + ' order by id desc limit 25', P),
    q("select coalesce(bot_name,'Unknown') as name, count(*)::int as v from visits where is_bot and created_at > now() - make_interval(days => $1::int) group by 1 order by v desc limit 12", [days]),
  ]);

  return ok({
    summary: sum[0], daily, countries, allCountries: allCountries.map((r) => r.country),
    cities, paths, refs, recent, bots,
  });
  } catch (e) {
    console.error('Analytics failed:', e.message);
    return err('Analytics query failed: ' + e.message, 500);
  }
}
