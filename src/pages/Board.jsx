import { Link } from 'react-router-dom';

/**
 * /board — AWI Florida Chapter Board of Directors.
 *
 * Each member's email is rendered as a clickable mailto link below
 * their name. To update: edit the BOARD constant below. If a member
 * gets a real chapter email at a different address, replace the email
 * string. To use a photo, set `photoUrl`.
 */
const BOARD = [
  { role: 'President',          name: 'Sebastian DesMarais', email: 'sebastian@awiflorida.org', bio: '', photoUrl: '' },
  { role: 'Vice President',     name: 'Caroline Tart',       email: 'caroline@awiflorida.org',  bio: '', photoUrl: '' },
  { role: 'Secretary',          name: 'Alba Rybak',          email: 'alba@awiflorida.org',      bio: '', photoUrl: '' },
  { role: 'Treasurer',          name: 'Joe Sorrelli',        email: 'joe@awiflorida.org',       bio: '', photoUrl: '' },
  { role: 'Education Chair',    name: 'Richard Barrieau',    email: 'richard@awiflorida.org',   bio: '', photoUrl: '' },
  { role: 'Membership Chair',   name: 'Nik Athanasakos',     email: 'nik@awiflorida.org',       bio: '', photoUrl: '' },
  { role: 'Social Media Chair', name: 'Vincent Federici',    email: 'vincent@awiflorida.org',   bio: '', photoUrl: '' },
  { role: 'Sponsorship Chair',  name: 'Edmond Zaho',         email: 'edmond@awiflorida.org',    bio: '', photoUrl: '' },
];

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => (p[0] || '').toUpperCase())
    .join('');
}

export default function Board() {
  return (
    <div style={{ background: '#FAF4E7', minHeight: '70vh' }}>
      {/* Hero — consistent with Membership */}
      <section
        style={{
          background: 'linear-gradient(180deg, #1F4534 0%, #1B3A2E 100%)',
          color: '#F5EAD6',
          padding: '5rem 2rem 4rem',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#B5A04A', marginBottom: 8, fontWeight: 700,
          }}>
            AWI Florida Chapter · Leadership
          </div>
          <h1 style={{ fontSize: 38, lineHeight: 1.15, margin: '0 0 14px', fontWeight: 400 }}>
            Board of <em style={{ color: '#E0CC8A' }}>Directors</em>
          </h1>
          <p style={{
            fontSize: 16, maxWidth: 760, lineHeight: 1.55,
            color: 'rgba(245,234,214,0.85)', margin: 0,
          }}>
            The volunteer leadership team running the AWI Florida Chapter. Board members
            serve elected terms and are drawn from chapter Manufacturer and Supplier members
            in good standing.
          </p>
        </div>
      </section>

      {/* Board grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 18,
        }}>
          {BOARD.map((m) => (
            <BoardCard key={m.role} member={m} />
          ))}
        </div>

        {/* Contact note */}
        <div style={{
          marginTop: 32,
          padding: '18px 20px',
          background: '#fff',
          border: '1px solid #DDE5D8',
          borderRadius: 10,
          fontSize: 14.5,
          color: '#475569',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: '#1B3A2E' }}>Reach the board.</strong>{' '}
          Email any chair directly above, or route by topic — events through the Education
          Chair, dues and tier questions through the Membership Chair, payment and accounting
          through the Treasurer, and event sponsorships through the Sponsorship Chair. Or
          contact the chapter at large via the{' '}
          <Link to="/membership" style={{ color: '#2D6A4F', fontWeight: 600 }}>Membership page</Link>.
        </div>
      </section>
    </div>
  );
}

function BoardCard({ member }) {
  const ini = initials(member.name);
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #DDE5D8',
        borderRadius: 14,
        padding: '20px 18px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8,
        boxShadow: '0 1px 4px rgba(27, 58, 46, 0.05)',
      }}
    >
      {/* Avatar */}
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={`${member.name} portrait`}
          width={96}
          height={96}
          style={{
            width: 96, height: 96, borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #B5A04A',
          }}
        />
      ) : (
        <div
          style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1F4534, #2D6A4F)',
            color: '#F5EAD6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 700, letterSpacing: '0.5px',
            border: '3px solid #B5A04A',
          }}
          aria-hidden="true"
        >
          {ini}
        </div>
      )}

      {/* Role — gold eyebrow */}
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
        textTransform: 'uppercase', color: '#8C7A35', marginTop: 6,
      }}>
        {member.role}
      </div>

      {/* Name — forest green */}
      <div style={{
        fontSize: 18, fontWeight: 600, color: '#1B3A2E', lineHeight: 1.2,
      }}>
        {member.name}
      </div>

      {/* Email — mailto, displayed under the name */}
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          style={{
            fontSize: 13, fontWeight: 500, color: '#2D6A4F',
            textDecoration: 'none', wordBreak: 'break-all',
            borderBottom: '1px dotted #2D6A4F', paddingBottom: 1,
          }}
        >
          {member.email}
        </a>
      )}

      {/* Bio when provided */}
      {member.bio && (
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '4px 0 0' }}>
          {member.bio}
        </p>
      )}
    </div>
  );
}
