# Wathu Digital Creations

Next.js 14 + Neon + Vercel Blob + PayChangu.

1. Copy .env.example to .env.local and fill it in
2. npm install
3. npm run db:init   (creates/updates tables, categories and sample services; safe to run again)
   Payments: add the PAYCHANGU_* keys and set the webhook URL to https://YOUR-SITE/api/paychangu/webhook
4. npm run dev

Admin: open /wdc-admin (not linked anywhere on the public site).

Sign-in sessions (clients and admin) end after 15 minutes without activity and when the browser is closed.
Change the time with IDLE_MINUTES in lib/auth.js and IDLE_MS in components/IdleLogout.js (keep them equal).

## Public addresses
/work (services), /work/12-logo-design (one service), /crew (team), /code (terms of conduct), /tnc (terms),
/cookies (cookie policy), /in (sign in), /join (create account), /inbox (messages), /alerts (notifications), /e/ID and /b/ID (request forms), /folio (our work, projects), /news (offers and updates).
Old addresses redirect to these (see next.config.mjs).

## Search engine optimisation (SEO)
Built in: a page per category (/c/web-design), keyword titles and descriptions, canonical addresses, sitemap.xml, robots.txt,
structured data (business, services, breadcrumbs, FAQ, articles, projects) and fast mobile pages.
After going live:
1. Add the site in Google Search Console, verify it (GOOGLE_SITE_VERIFICATION) and submit https://YOUR-SITE/sitemap.xml. Do the same in Bing Webmaster Tools.
2. Create and verify a free Google Business Profile for the studio. It is the biggest local search boost.
3. Fill in the Footer tab (address, phone, WhatsApp, socials) and add real client testimonials.
4. Post news or projects regularly from the admin. Fresh, useful pages are what rank.
5. Redirect www to the main address in your Vercel domain settings so there is one version of the site.

## Link previews (WhatsApp, Facebook, X)
Every page has title, description and a preview image made at /og. Set NEXT_PUBLIC_SITE_URL to your real address.
To refresh a cached preview use the Facebook Sharing Debugger.

## Where things live
- app/(site)      public pages with the sidebar shell
- app/(admin)     admin dashboard (analytics, requests, services, categories, team, certificates, footer)
- app/api         all backend routes
- lib/            db, auth, legal text, bot detection, SEO helpers
- scripts/db-init.mjs   schema and seed data

## Before going live
- Have a lawyer review lib/legal.js (terms, conduct, letter of engagement).
- Add rate limiting on /api/auth/* and /api/admin/login.
- Add SMS or WhatsApp verification for phone numbers.
- Replace chat polling with a realtime service when traffic grows.
