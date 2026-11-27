import { blocked, record } from '@/lib/limit';

export const aiEnabled = () => !!process.env.GEMINI_API_KEY;

// One call to Gemini. A daily cap (AI_DAILY_CAP, default 150) keeps you inside the free allowance.
export async function askAI(prompt, { json = false } = {}) {
  const cap = Number(process.env.AI_DAILY_CAP) || 150;
  if (await blocked('ai:day', cap, 86400)) throw new Error('cap');
  await record('ai:day');
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1200, ...(json ? { responseMimeType: 'application/json' } : {}) },
    }),
  });
  if (!r.ok) { console.error('Gemini error:', r.status, (await r.text().catch(() => '')).slice(0, 200)); throw new Error('ai'); }
  const d = await r.json().catch(() => ({}));
  const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
  const text = (parts || []).map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('ai');
  return text;
}
