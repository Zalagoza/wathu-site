import { neon } from '@neondatabase/serverless';
// @neondatabase/serverless 0.10.x: call the client as a function: sql(text, params)
const sql = neon(process.env.DATABASE_URL);

const schema = [
  "create table if not exists testimonials (id serial primary key, name text not null, role text not null default '', quote text not null, active boolean not null default true, created_at timestamptz not null default now())",
  "create table if not exists settings (key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now())",
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
  "create table if not exists projects (id serial primary key, title text not null, kind text not null default 'artwork' check (kind in ('artwork','photo','website','other')), description text not null default '', images jsonb not null default '[]', link_url text not null default '', managed boolean not null default false, client text not null default '', year text not null default '', featured boolean not null default false, active boolean not null default true, sort int not null default 0, created_at timestamptz not null default now())",
  "create table if not exists updates (id serial primary key, title text not null, kind text not null default 'news' check (kind in ('news','offer','announcement','event')), body text not null default '', image_url text not null default '', link_url text not null default '', link_label text not null default '', pinned boolean not null default false, active boolean not null default true, published_at timestamptz not null default now(), created_at timestamptz not null default now())",
  'create table if not exists rate_hits (id bigserial primary key, key text not null, at timestamptz not null default now())',
  'create index if not exists rate_hits_key on rate_hits (key, at)',
  "create table if not exists audit_log (id bigserial primary key, at timestamptz not null default now(), action text not null, detail text not null default '')",
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
// Team members added by the scaffold. Added only if no member with the same name exists yet, so running db:init again never duplicates.
// Edit role, photo and text any time from /wdc-admin -> Team. Qualifications and experience: one item per line. Skills: comma separated.
const team = [
  {
    // top: show first on the page. refresh: if he already exists (e.g. added by hand in the admin), update his details instead of skipping.
    name: 'Kingsley Phiri',
    role: 'C.E.O',
    photo_url: '',
    top: true,
    refresh: true,
    qualifications: [
      'Bachelor of Social Science in Law Enforcement Management and Leadership (Forensic Science), University of Malawi (2026)',
      'Certificate in Accounting and Finance, Public Accountants Examination Council (now ICAM)',
      'Malawi School Certificate of Education (MSCE)',
    ].join('\n'),
    skills: [
      'Photography', 'Programming', 'Graphic design', 'Video editing and production', 'Web development',
      'Digital forensics', 'ICT support', 'Data recovery', 'Fraud detection', 'Branding',
    ].join(', '),
    experience: [
      'Founder, Wathu Digital Creations: designs, builds, hosts and maintains websites for clients and produces branding, print and digital graphics.',
      'ICT Support Officer, Department of Immigration and Citizenship Services, Kamuzu International Airport (2026 - present): administers the Migration Information and Data Analysis System (MIDAS) and provides ICT support, backup and recovery.',
      'ICT Help Desk Assistant (2022 - 2023) and Data Clerk (2019 - 2022), Department of Immigration and Citizenship Services.',
      'Freelance Photographer (2016 - 2019): event and portrait photography, image processing and photo recovery.',
      'Research: impact of the absence of forensic document examination in detecting fraudulent documents at Kamuzu International Airport.',
    ].join('\n'),
  },
  {
    name: 'Pillow Ishmael Absent',
    role: 'Team Member',
    photo_url: '',
    qualifications: [
      'Bachelor of Social Science in Law Enforcement Management and Leadership, University of Malawi (2022 - 2026)',
      'Malawi School Certificate of Education (MSCE), Blantyre Secondary School',
    ].join('\n'),
    skills: [
      'Investigative techniques', 'Crime scene analysis', 'Evidence collection', 'Forensic document examination',
      'Fraud analysis', 'Report writing', 'Legal compliance', 'Conflict resolution', 'Sales and marketing',
      'Publicity and communications', 'Community engagement', 'English, Chichewa and Yao',
    ].join(', '),
    experience: [
      'Sales Representative, Polymed SACCO Limited: promoted savings, loans and investment products, ran field outreach and client presentations, and met sales targets.',
      'Publicity Secretary, UNIMA Law Enforcement Society: handled publicity, announcements and liaison with law enforcement stakeholders.',
      'Disciplinary Officer and Complaint Officer, UNIMA Let Love Lead Organization: investigated conduct breaches and complaints, advised leadership and kept accurate records.',
      'Laboratory Prefect, Blantyre Secondary School: oversaw laboratory safety, order and equipment care.',
    ].join('\n'),
  },
];
for (const m of team) {
  const sortExpr = m.top ? '(select coalesce(min(sort),1)-1 from team)' : '(select coalesce(max(sort),-1)+1 from team)';
  const added = await sql(
    'insert into team (name, role, photo_url, qualifications, skills, experience, sort) select $1,$2,$3,$4,$5,$6,' + sortExpr + ' where not exists (select 1 from team where name = $1) returning name',
    [m.name, m.role, m.photo_url, m.qualifications, m.skills, m.experience]
  );
  if (added.length) { console.log('Added team member: ' + m.name); continue; }
  if (m.refresh) {
    // keeps any photo already uploaded in the admin
    await sql('update team set role=$2, qualifications=$3, skills=$4, experience=$5 where name=$1', [m.name, m.role, m.qualifications, m.skills, m.experience]);
    console.log('Updated team member: ' + m.name);
  }
}
console.log('Database ready.');
