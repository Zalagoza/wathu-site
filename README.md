# Wathu Digital Creations

Next.js 14 + Neon + Vercel Blob + PayChangu.

1. Copy .env.example to .env.local and fill it in
2. npm install
3. npm run db:init   (creates/updates tables, categories and sample services; safe to run again)
   Payments: add the PAYCHANGU_* keys and set the webhook URL to https://YOUR-SITE/api/paychangu/webhook
4. npm run dev

Admin: open /wdc-admin (not linked anywhere on the public site).

## Public addresses
/work (services), /work/12-logo-design (one service), /crew (team), /code (terms of conduct), /tnc (terms),
/in (sign in), /join (create account), /inbox (messages), /alerts (notifications), /e/ID and /b/ID (request forms).
Old addresses redirect to these (see next.config.mjs).

## Link previews (WhatsApp, Facebook, X)
Every page has title, description and a preview image made at /og. Set NEXT_PUBLIC_SITE_URL to your real address.
To refresh a cached preview use the Facebook Sharing Debugger.

## Where things live
- app/(site)      public pages with the sidebar shell
- app/(admin)     admin dashboard (analytics, requests, services, categories, team, certificates)
- app/api         all backend routes
- lib/            db, auth, legal text, bot detection, SEO helpers
- scripts/db-init.mjs   schema and seed data

## Before going live
- Have a lawyer review lib/legal.js (terms, conduct, letter of engagement).
- Add rate limiting on /api/auth/* and /api/admin/login.
- Add SMS or WhatsApp verification for phone numbers.
- Replace chat polling with a realtime service when traffic grows.
