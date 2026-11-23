const KNOWN = [
  ['Googlebot', /googlebot|adsbot-google|mediapartners-google|google-inspectiontool/i],
  ['Bingbot', /bingbot|bingpreview|msnbot/i],
  ['Yahoo Slurp', /slurp/i],
  ['DuckDuckBot', /duckduckbot/i],
  ['Baidu', /baiduspider/i],
  ['Yandex', /yandex/i],
  ['Applebot', /applebot/i],
  ['Facebook', /facebookexternalhit|meta-externalagent/i],
  ['Twitter', /twitterbot/i],
  ['LinkedIn', /linkedinbot/i],
  ['WhatsApp', /whatsapp/i],
  ['Telegram', /telegrambot/i],
  ['Ahrefs', /ahrefsbot/i],
  ['Semrush', /semrushbot/i],
  ['MJ12', /mj12bot/i],
  ['Petal', /petalbot/i],
  ['GPTBot', /gptbot|chatgpt-user|oai-searchbot/i],
  ['ClaudeBot', /claudebot|claude-web/i],
  ['CommonCrawl', /ccbot/i],
  ['Bytespider', /bytespider/i],
  ['Headless browser', /headlesschrome|phantomjs|puppeteer|playwright/i],
  ['Lighthouse', /lighthouse|pagespeed|gtmetrix/i],
  ['Uptime monitor', /uptimerobot|pingdom|statuscake|betterstack/i],
  ['Script', /curl\/|wget|python-requests|python-urllib|axios|node-fetch|go-http-client|okhttp|java\//i],
];

export function detectBot(ua) {
  if (!ua || ua.length < 10) return { bot: true, name: 'No user agent' };
  for (const [name, re] of KNOWN) if (re.test(ua)) return { bot: true, name };
  if (/bot|crawl|spider|scrape|fetch|monitor|preview|scan/i.test(ua)) return { bot: true, name: 'Other bot' };
  return { bot: false, name: null };
}
