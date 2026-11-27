import { q } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { askAI, aiEnabled } from '@/lib/ai';
import { blocked, record } from '@/lib/limit';
import { ok, err } from '@/lib/util';

export async function POST(req) {
  if (!(await isAdmin())) return err('Unauthorized', 401);
  if (!aiEnabled()) return err('AI is not switched on. Add GEMINI_API_KEY.', 503);
  const b = await req.json().catch(() => ({}));
  const e = (await q('select e.id, e.kind, e.brief, s.title from engagements e join services s on s.id = e.service_id where e.id = $1', [Number(b.id)]))[0];
  if (!e) return err('Not found', 404);
  if (e.kind === 'professional') return err('Professional matters are never sent to AI, to protect client confidentiality.', 400);
  if (await blocked('aisum', 30, 3600)) return err('Too many summaries this hour. Try again later.', 429);
  await record('aisum');

  const msgs = (await q("select sender, body from messages where engagement_id = $1 and sender in ('user','admin') order by id desc limit 60", [e.id])).reverse();
  const talk = msgs.map((m) => (m.sender === 'admin' ? 'Studio: ' : 'Client: ') + String(m.body).slice(0, 400)).join('\n');
  const brief = e.brief ? 'Brief title: ' + (e.brief.title || '') + '\nBrief: ' + (e.brief.description || '') + '\nStyle: ' + (e.brief.style || '') + '\nDeadline: ' + (e.brief.deadline || '') : '';
  const prompt =
    'You help the owner of a creative studio in Malawi. Service: ' + e.title + '.\n' + brief + '\nChat so far:\n' + (talk || '(no messages yet)') + '\n\n' +
    'Write in plain text with these headings: Summary (3 to 5 short lines), Open questions, Next actions, Draft reply (short, friendly and professional, ready to send). Use only facts above and do not invent details.';
  try {
    return ok({ text: await askAI(prompt) });
  } catch (x) {
    return err(x.message === 'cap' ? 'Daily AI limit reached. Try again tomorrow.' : 'The AI service is not available right now.', 503);
  }
}
