import { neon } from '@neondatabase/serverless';
// @neondatabase/serverless 0.10.x: call the client as a function: sql(text, params)
const sql = neon(process.env.DATABASE_URL);

const schema = [
  'create table if not exists users (id serial primary key, full_name text not null, phone text unique not null, location text not null, password_hash text not null, terms_accepted_at timestamptz not null default now(), created_at timestamptz not null default now())',
  "create table if not exists categories (id serial primary key, slug text unique not null, label text not null, blurb text not null default '', icon text not null default '', kind text not null default 'creative' check (kind in ('creative','professional')), refs text not null default 'optional' check (refs in ('required','optional','none')), accent text not null default 'green', active boolean not null default true, sort int not null default 0, created_at timestamptz not null default now())",
  "create table if not exists services (id serial primary key, category text not null, title text not null, description text not null default '', price numeric not null default 0, currency text not null default 'MWK', unit text not null default 'per project', sticker_on boolean not null default false, sticker_text text not null default 'Offer', active boolean not null default true, sort int not null default 0, created_at timestamptz not null default now())",
  // older installs had a fixed category list; categories are now managed from the admin
  'alter table services drop constraint if exists services_category_check',
  "create table if not exists engagements (id serial primary key, user_id int not null references users(id) on delete cascade, service_id int not null references services(id), kind text not null check (kind in ('professional','creative')), status text not null default 'submitted', details text, brief jsonb, refs jsonb, signed_name text, signed_at timestamptz, total_amount numeric, deposit_amount numeric, pay_note text, created_at timestamptz not null default now())",
  "create table if not exists messages (id serial primary key, engagement_id int not null references engagements(id) on delete cascade, sender text not null check (sender in ('user','admin','system')), body text not null, created_at timestamptz not null default now())",
  "create table if not exists notifications (id serial primary key, user_id int not null references users(id) on delete cascade, engagement_id int references engagements(id) on delete cascade, kind text not null default 'info', title text not null, body text not null default '', read boolean not null default false, created_at timestamptz not null default now())",
  'create table if not exists visits (id bigserial primary key, vid text not null, path text not null, country text, city text, referrer text, ua text, is_bot boolean not null default false, bot_name text, created_at timestamptz not null default now())',
  "create table if not exists payments (id serial primary key, engagement_id int not null references engagements(id) on delete cascade, tx_ref text unique not null, kind text not null check (kind in ('deposit','balance')), amount numeric not null, currency text not null, status text not null default 'pending', provider_ref text, created_at timestamptz not null default now(), paid_at timestamptz)",
  "create table if not exists team (id serial primary key, name text not null, role text not null, photo_url text not null default '', qualifications text not null default '', skills text not null default '', experience text not null default '', active boolean not null default true, sort int not null default 0, created_at timestamptz not null default now())",
  "create table if not exists certificates (id serial primary key, title text not null, issuer text not null default '', issued_on text not null default '', file_url text not null, file_type text not null default 'image/jpeg', active boolean not null default true, sort int not null default 0, created_at timestamptz not null default now())",
  'create index if not exists visits_created on visits (created_at)',
  'create index if not exists messages_eng on messages (engagement_id, id)',
  'create index if not exists notif_user on notifications (user_id, read)',
];

// [slug, label, blurb, icon, kind, references, accent]
const cats = [
  ['graphic', 'Graphic design', 'Logos, brand identity, flyers and print.', 'Gd', 'creative', 'required', 'green'],
  ['web-design', 'Web design', 'Websites, landing pages and online stores.', 'Wd', 'creative', 'required', 'gold'],
  ['photography', 'Photography', 'Events, portraits and product shoots.', 'Ph', 'creative', 'optional', 'green'],
  ['videography', 'Videography', 'Event coverage, promos and adverts.', 'Vd', 'creative', 'none', 'red'],
  ['professional', 'Professional services', 'Digital forensics, cybersecurity and ICT support.', 'Ps', 'professional', 'none', 'rasta'],
];

// [category, title, description, price, unit]
const seed = [
  ['graphic', 'Logo and brand identity', 'Logo, colour palette, type choices and a simple brand guide.', 150000, 'per project'],
  ['graphic', 'Flyers and posters', 'Print-ready or social-ready promotional designs.', 35000, 'per design'],
  ['graphic', 'Social media kit', 'A set of branded templates for your pages.', 80000, 'per kit'],
  ['web-design', 'Business website', 'A fast, mobile-friendly website with up to 5 pages.', 450000, 'per project'],
  ['web-design', 'Landing page', 'A single focused page built to turn visitors into customers.', 200000, 'per page'],
  ['web-design', 'Online store', 'Product pages, cart and payment set-up.', 750000, 'per project'],
  ['photography', 'Event photography', 'Full coverage with edited, high-resolution delivery.', 120000, 'per event'],
  ['photography', 'Portrait and product shoots', 'Studio or on-location sessions with retouching.', 60000, 'per session'],
  ['videography', 'Event videography', 'Multi-angle coverage with a polished edit.', 250000, 'per event'],
  ['videography', 'Promo and ad videos', 'Scripted, shot and edited for your brand.', 400000, 'per video'],
  ['professional', 'Digital forensics: consultancy and advocacy', 'Expert guidance and support on digital evidence matters.', 75000, 'per hour'],
  ['professional', 'Cybersecurity technical support', 'Assessments, hardening and incident response help.', 50000, 'per hour'],
  ['professional', 'ICT support', 'Hands-on support for your devices, networks and systems.', 30000, 'per hour'],
];

for (const s of schema) await sql(s);

// Add any missing categories. A category that is brand new also gets its sample services (only if it has none).
let order = 0;
for (const [slug, label, blurb, icon, kind, refs, accent] of cats) {
  const added = await sql(
    'insert into categories (slug,label,blurb,icon,kind,refs,accent,sort) values ($1,$2,$3,$4,$5,$6,$7,(select coalesce(max(sort),-1)+1 from categories)) on conflict (slug) do nothing returning slug',
    [slug, label, blurb, icon, kind, refs, accent]
  );
  order++;
  if (!added.length) continue;
  const have = (await sql('select count(*)::int as c from services where category = $1', [slug]))[0].c;
  if (have) continue;
  for (const [cat, title, desc, price, unit] of seed.filter((x) => x[0] === slug)) {
    await sql('insert into services (category,title,description,price,unit,sort) values ($1,$2,$3,$4,$5,(select coalesce(max(sort),-1)+1 from services))', [cat, title, desc, price, unit]);
  }
  console.log('Added category: ' + label);
}
console.log('Database ready.');
