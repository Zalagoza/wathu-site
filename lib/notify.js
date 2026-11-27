const E = process.env;

const withTimeout = (p, ms = 5000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

// Sends one WhatsApp alert to the owner. Never throws: a failed alert must not break the site.
//  WHATSAPP_PROVIDER=meta  -> official WhatsApp Cloud API (needs an approved template with one text variable)
//  otherwise               -> CallMeBot (free) when CALLMEBOT_API_KEY is set
export async function notifyOwner(text) {
  const to = String(E.OWNER_WHATSAPP || '265996103277').replace(/\D/g, '');
  const msg = String(text).replace(/\s+/g, ' ').trim().slice(0, 500);
  try {
    if (E.WHATSAPP_PROVIDER === 'meta' && E.META_WA_TOKEN && E.META_WA_PHONE_ID) {
      const r = await withTimeout(fetch('https://graph.facebook.com/' + (E.META_GRAPH_VERSION || 'v21.0') + '/' + E.META_WA_PHONE_ID + '/messages', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + E.META_WA_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp', to, type: 'template',
          template: { name: E.META_WA_TEMPLATE || 'new_request_alert', language: { code: E.META_WA_LANG || 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: msg }] }] },
        }),
      }));
      if (!r.ok) console.error('WhatsApp (Meta) failed:', r.status, (await r.text().catch(() => '')).slice(0, 200));
      return;
    }
    if (E.CALLMEBOT_API_KEY) {
      const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent('+' + to) + '&text=' + encodeURIComponent(msg) + '&apikey=' + encodeURIComponent(E.CALLMEBOT_API_KEY);
      const r = await withTimeout(fetch(url));
      if (!r.ok) console.error('CallMeBot failed:', r.status);
    }
  } catch (e) { console.error('WhatsApp alert failed:', e.message); }
}
