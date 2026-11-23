import { q } from '@/lib/db';
import { lines, tags } from '@/lib/text';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Meet our team',
  description: 'The people behind Wathu Digital Creations, with their qualifications, skills and experience.',
  path: '/crew',
  sub: 'The people behind the work',
});

const initials = (n) => String(n).trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default async function Team() {
  let team = [], certs = [];
  try {
    team = await q('select * from team where active order by sort, id');
    certs = await q('select * from certificates where active order by sort, id');
  } catch (e) { console.error('Team page query failed:', e.message); }

  return (
    <div className="page">
      <div className="stripe" style={{ width: 84, marginBottom: 22 }} />
      <h1>Meet our team</h1>
      <p className="mute" style={{ maxWidth: '60ch' }}>The people behind Wathu Digital Creations, with the qualifications and experience they bring to your work.</p>

      {team.length === 0 ? <p className="mute">Our team profiles are coming soon.</p> : (
        <div className="team-grid" style={{ marginTop: 28 }}>
          {team.map((m) => (
            <article key={m.id} className="member">
              <div className="row" style={{ gap: 16, flexWrap: 'nowrap', marginTop: 6 }}>
                {m.photo_url ? <img className="pic" loading="lazy" decoding="async" src={m.photo_url} alt={m.name} /> : <span className="pic">{initials(m.name)}</span>}
                <div>
                  <h3 style={{ margin: 0 }}>{m.name}</h3>
                  <p className="role">{m.role}</p>
                </div>
              </div>
              {lines(m.qualifications).length > 0 && (
                <div><h4>Qualifications</h4><ul>{lines(m.qualifications).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              )}
              {tags(m.skills).length > 0 && (
                <div><h4>Skills</h4><div className="tags">{tags(m.skills).map((x, i) => <span key={i} className="tag">{x}</span>)}</div></div>
              )}
              {lines(m.experience).length > 0 && (
                <div><h4>Experience</h4>{lines(m.experience).map((x, i) => <p key={i}>{x}</p>)}</div>
              )}
            </article>
          ))}
        </div>
      )}

      {certs.length > 0 && (
        <section>
          <h2>Certificates and registrations</h2>
          <p className="mute">Tap a certificate to open it.</p>
          <div className="certs">
            {certs.map((c) => (
              <a key={c.id} href={c.file_url} target="_blank" rel="noreferrer" className="cert">
                {c.file_type === 'application/pdf' ? <div className="doc">PDF</div> : <img loading="lazy" decoding="async" src={c.file_url} alt={c.title} />}
                <b>{c.title}</b>
                <span className="mute small">{[c.issuer, c.issued_on].filter(Boolean).join(', ')}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
