import { q } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { SERVICE_SELECT } from '@/lib/categories';
import { ok, err, clean } from '@/lib/util';

export async function POST(req) {
  const user = await getUser();
  if (!user) return err('Please sign in.', 401);
  const b = await req.json().catch(() => ({}));
  const s = (await q(SERVICE_SELECT + ' where s.id = $1 and s.active and c.active', [Number(b.serviceId)]))[0];
  if (!s) return err('Service not found.', 404);

  let row;
  if (s.cat_kind === 'professional') {
    const signed = clean(b.signedName, 120);
    if (!b.accepted) return err('You must accept the terms of conduct and the letter of engagement.');
    if (signed.toLowerCase() !== user.full_name.trim().toLowerCase()) return err('Signature must match your registered name.');
    if (clean(b.details).length < 10) return err('Please describe your matter.');
    row = (await q("insert into engagements (user_id, service_id, kind, status, details, signed_name, signed_at) values ($1,$2,'professional','signed',$3,$4,now()) returning id", [user.id, s.id, clean(b.details), signed]))[0];
    await q("insert into messages (engagement_id, sender, body) values ($1,'system',$2)", [row.id, 'Letter of engagement signed by ' + signed + '. Private chat opened. We will send a billing notice shortly.']);
  } else {
    // Reference designs follow the category setting: required, optional or none (e.g. videography)
    const mode = s.cat_refs;
    const refs = mode === 'none' ? [] : (Array.isArray(b.refs) ? b.refs : []).filter((u) => typeof u === 'string' && u.startsWith('https://')).slice(0, 3);
    if (mode === 'required' && refs.length < 1) return err('Add at least one reference design.');
    const br = b.brief || {};
    if (clean(br.title).length < 2 || clean(br.description).length < 10) return err('Please complete your brief.');
    const brief = { title: clean(br.title, 150), description: clean(br.description), style: clean(br.style, 300), deadline: clean(br.deadline, 20) };
    row = (await q("insert into engagements (user_id, service_id, kind, status, brief, refs) values ($1,$2,'creative','submitted',$3,$4) returning id", [user.id, s.id, JSON.stringify(brief), JSON.stringify(refs)]))[0];
    await q("insert into messages (engagement_id, sender, body) values ($1,'system',$2)", [row.id, 'Brief received: ' + brief.title + '. We will reply here.']);
  }
  return ok({ id: row.id });
}
