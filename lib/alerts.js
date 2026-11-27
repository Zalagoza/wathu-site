import { q } from '@/lib/db';
import { blocked, record } from '@/lib/limit';
import { notifyOwner } from '@/lib/notify';
import { SITE } from '@/lib/seo';

export async function alertOwner(kind, engagementId, extra = '') {
  try {
    if (kind === 'message') {
      if (await blocked('wa:' + engagementId, 1, 120)) return; // at most one alert per chat every 2 minutes
      await record('wa:' + engagementId);
    }
    const e = (await q('select e.kind, e.brief, u.full_name, s.title from engagements e join users u on u.id = e.user_id join services s on s.id = e.service_id where e.id = $1', [engagementId]))[0];
    if (!e) return;
    const pro = e.kind === 'professional';
    const who = e.full_name + ' (' + e.title + ')';
    let text = '';
    if (kind === 'new') {
      const t = !pro && e.brief && e.brief.title ? ': ' + e.brief.title : '';
      text = pro ? 'New engagement request from ' + who + '.' : 'New brief from ' + who + t + '.';
    } else if (kind === 'message') {
      text = 'New message from ' + who + (!pro && extra ? ': "' + String(extra).slice(0, 100) + '"' : '') + '.';
    } else if (kind === 'paid') {
      text = 'Payment received: ' + extra + ' from ' + who + '.';
    }
    if (!text) return;
    await notifyOwner('Wathu Digital: ' + text + ' Open ' + SITE + '/wdc-admin (Requests).');
  } catch (x) { console.error('alertOwner failed:', x.message); }
}
