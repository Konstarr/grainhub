import { Link } from 'react-router-dom';

/**
 * /education — AWI Florida Chapter education programs.
 *
 * Owned by the chapter Education Chair. Lays out the programs the
 * chapter offers to advance woodwork education in Florida, with
 * separate "Get involved" tracks for students/educators and for
 * member shops who want to host, mentor, or donate.
 */
const EDUCATION_CHAIR_EMAIL = 'richard@awiflorida.org';

/* ---- Chapter education programs ---- */
const PROGRAMS = [
  {
    title: 'Chapter Scholarship Fund',
    eyebrow: 'Direct funding',
    blurb:
      'Annual scholarships awarded to Florida students enrolled in accredited cabinetmaking, architectural millwork, or related career & technical education programs. Funded by member dues and chapter event proceeds.',
    items: [
      'Open to students at FL technical colleges and CTE programs',
      'Application opens each spring; awards announced at the annual showcase',
      'Recipients receive a stipend plus a full set of the current AWS standards',
    ],
    cta: { label: 'How to apply', subject: 'AWI FL — scholarship inquiry' },
  },
  {
    title: 'Apprenticeship Network',
    eyebrow: 'Earn while you learn',
    blurb:
      'Chapter members host U.S. Department of Labor Registered Apprenticeships in Cabinetmaker (RAPIDS 0067) and related occupations. The chapter matches qualified applicants with member shops, and helps shops navigate the registration process.',
    items: [
      'Applicants: pre-screened, paired with sponsor shops in your region',
      'Sponsor shops: technical assistance on RAPIDS registration, state tax-credit guidance',
      'Coordinated with the Florida Department of Education and DOL Office of Apprenticeship',
    ],
    cta: { label: 'Join the network', subject: 'AWI FL — apprenticeship interest' },
  },
  {
    title: 'Shop Tour Program',
    eyebrow: 'Classroom → real shop',
    blurb:
      'High school CTE groups and technical college students visit AWI Florida member shops to see commercial architectural woodwork production firsthand — CNC routers, edge banders, finishing booths, install crews, and bidding processes.',
    items: [
      'Member shops host one or two tours per year on their schedule',
      'Chapter handles scheduling, insurance documentation, and student liability waivers',
      'Designed to align with the FL CTE Architectural & Construction cluster',
    ],
    cta: { label: 'Request a tour / host a tour', subject: 'AWI FL — shop tour' },
  },
  {
    title: 'Adopt-a-School',
    eyebrow: 'Direct partnership',
    blurb:
      'Each participating chapter member adopts a local CTE program or technical college, committing to year-over-year support: equipment donations, guest speakers, scholarship referrals, and graduate hiring pipelines.',
    items: [
      'One-to-one shop ↔ school relationships, regional matchmaking',
      'Donate used-but-serviceable shop equipment (table saws, edge banders, etc.)',
      'Annual chapter recognition for shops that hit donation thresholds',
    ],
    cta: { label: 'Adopt a school', subject: 'AWI FL — Adopt-a-School' },
  },
  {
    title: 'Speaker Bureau',
    eyebrow: 'Tell the story',
    blurb:
      'A roster of chapter members willing to speak at FL high schools, CTE programs, and technical colleges about careers in architectural woodwork — what the work actually is, what the pay path looks like, and how to get started.',
    items: [
      'In-person and virtual options',
      'Targets: shop math, careers in construction, women in trades, advanced manufacturing',
      'Chapter provides slide templates and a short pre-visit checklist',
    ],
    cta: { label: 'Volunteer / request a speaker', subject: 'AWI FL — Speaker Bureau' },
  },
  {
    title: 'AWS Standards in the Classroom',
    eyebrow: 'Reference library',
    blurb:
      'The chapter donates current copies of the AWI Architectural Woodwork Standards (AWS) to qualifying Florida CTE programs and technical colleges, so students learn the actual industry reference — not a textbook approximation.',
    items: [
      'Up to 5 copies of the current AWS edition per qualifying program',
      'Co-branded with the chapter and the participating member sponsor',
      'Includes QCP Quality Certification Program overview pack',
    ],
    cta: { label: 'Request standards for your program', subject: 'AWS standards request' },
  },
];

/* ---- Outside resources we point students/educators at ---- */
const RESOURCES = [
  { name: 'AWI National Education',          desc: 'AWI Cornerstone, Skills USA partnership, professional development.', href: 'https://www.awinet.org/education-events' },
  { name: 'AWI Student Chapters',            desc: 'AWI student chapter program at participating universities.',         href: 'https://www.awinet.org' },
  { name: 'AWS Standards',                   desc: 'Architectural Woodwork Standards — the industry reference.',          href: 'https://www.awinet.org/aws' },
  { name: 'QCP — Quality Certification',     desc: 'The certification program FL students should know by name.',          href: 'https://qcp.org' },
  { name: 'Woodwork Career Alliance (WCA)',  desc: 'Skill Standards, Passport credential, instructor training.',           href: 'https://woodworkcareer.org' },
  { name: 'DOL Apprenticeship.gov',          desc: 'Registered Apprenticeship search, state tax-credit info.',             href: 'https://www.apprenticeship.gov' },
  { name: 'BLS — Cabinetmakers (SOC 51-7011)', desc: 'Career outlook, wage data for FL metro areas.',                     href: 'https://www.bls.gov/ooh/production/woodworkers.htm' },
  { name: 'Florida CTE',                     desc: 'Florida Department of Education Career & Technical Education portal.','href': 'https://www.fldoe.org/academics/career-adult-edu/' },
];

export default function Education() {
  return (
    <div style={{ background: '#FAF4E7', minHeight: '70vh' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, #1F4534 0%, #1B3A2E 100%)',
          color: '#F5EAD6',
          padding: '5rem 2rem 4rem',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5A04A', marginBottom: 8, fontWeight: 700 }}>
            AWI Florida Chapter · Education
          </div>
          <h1 style={{ fontSize: 38, lineHeight: 1.15, margin: '0 0 14px', fontWeight: 400 }}>
            Building the <em style={{ color: '#E0CC8A' }}>next generation</em> of Florida's woodwork industry.
          </h1>
          <p style={{ fontSize: 16, maxWidth: 780, lineHeight: 1.6, color: 'rgba(245,234,214,0.9)', margin: 0 }}>
            The skilled labor shortage in millwork and architectural woodwork is real, and it is solved at the
            classroom level — not on Indeed. The AWI Florida Chapter runs programs to put member shops in
            contact with the schools, students, and educators training Florida's next bench of cabinetmakers,
            installers, finishers, and project managers.
          </p>
        </div>
      </section>

      {/* Programs grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="Chapter education programs"
          title="What the chapter is doing — and what we want to do more of"
          sub="Each program below has a real owner on the board and is open for member participation. If you'd like to volunteer, sponsor, or expand one of these, email the Education Chair."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {PROGRAMS.map((p) => <ProgramCard key={p.title} program={p} />)}
        </div>
      </section>

      {/* For students/educators */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="For students & educators"
          title="How to plug into the chapter"
          sub=""
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <InfoTile
            title="Students"
            body="Apply for the chapter scholarship fund, find an apprenticeship in your region, or request a shop tour with your class."
            cta="Email the Education Chair →"
            subject="Student — interested in the chapter"
          />
          <InfoTile
            title="CTE instructors & program directors"
            body="Request AWS standards for your classroom, schedule a chapter member as a guest speaker, or partner with a chapter member shop on tools and curriculum."
            cta="Email the Education Chair →"
            subject="Educator — interested in chapter partnership"
          />
          <InfoTile
            title="Technical college admissions"
            body="The chapter promotes Florida technical colleges directly to high school CTE programs and to chapter member firms hiring entry-level talent. Get listed."
            cta="Email the Education Chair →"
            subject="Technical college — request listing"
          />
        </div>
      </section>

      {/* For member shops */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="For member shops"
          title="How to support chapter education"
          sub=""
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <InfoTile
            title="Host a shop tour"
            body="Open your shop to a CTE group for half a day, once or twice a year. Chapter handles scheduling and waivers."
            cta="Sign up to host →"
            subject="Member shop — host a shop tour"
          />
          <InfoTile
            title="Become an apprenticeship sponsor"
            body="Register a Cabinetmaker apprentice (RAPIDS 0067) through DOL. Chapter provides technical assistance and state tax-credit guidance."
            cta="Sponsor an apprentice →"
            subject="Member shop — apprenticeship sponsor"
          />
          <InfoTile
            title="Adopt a school"
            body="Commit to a single CTE program in your region for year-over-year support: equipment, speakers, hiring pipeline."
            cta="Adopt a school →"
            subject="Member shop — adopt a school"
          />
          <InfoTile
            title="Donate equipment"
            body="Have a serviceable edge bander, panel saw, or finishing booth you're cycling out? Donate it through the chapter to a partner program."
            cta="Donate equipment →"
            subject="Member shop — equipment donation"
          />
        </div>
      </section>

      {/* Resources */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="Resources"
          title="External programs &amp; references"
          sub="The chapter does not duplicate what AWI national, DOL, the WCA, or the Florida DOE already provide. Start here."
        />
        <div style={{
          background: '#fff',
          border: '1px solid #DDE5D8',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {RESOURCES.map((r, i) => (
            <a
              key={r.name}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                padding: '14px 18px',
                borderTop: i === 0 ? 'none' : '1px solid #DDE5D8',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1B3A2E' }}>{r.name}</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{r.desc}</div>
              </div>
              <div style={{ alignSelf: 'center', color: '#2D6A4F', fontSize: 13, fontWeight: 600 }}>
                Open ↗
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Education Chair contact */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <div style={{
          background: 'linear-gradient(180deg, #1F4534, #1B3A2E)',
          color: '#F5EAD6',
          borderRadius: 14,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: '#B5A04A', fontWeight: 800 }}>
            Education Chair
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>
            Have an idea for an education program? Reach out.
          </div>
          <p style={{ fontSize: 15, color: 'rgba(245,234,214,0.85)', lineHeight: 1.6, margin: '4px 0 8px', maxWidth: 720 }}>
            Every program on this page exists because a chapter member raised a hand. If you teach woodwork,
            employ apprentices, or want to start something the chapter doesn't already run — email the
            Education Chair. The board reviews education proposals at every meeting.
          </p>
          <div>
            <a
              href={`mailto:${EDUCATION_CHAIR_EMAIL}?subject=${encodeURIComponent('AWI FL — Education program idea')}`}
              style={{
                display: 'inline-block',
                background: '#B5A04A',
                color: '#1B3A2E',
                padding: '10px 18px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Email Richard Barrieau ({EDUCATION_CHAIR_EMAIL})
            </a>
            <Link
              to="/board"
              style={{
                marginLeft: 12,
                display: 'inline-block',
                color: '#E0CC8A',
                fontSize: 13.5,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Meet the full board →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.6, color: '#8C7A35', textTransform: 'uppercase', marginBottom: 6 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 500, color: '#1B3A2E', margin: '0 0 6px', lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontSize: 14.5, color: '#475569', margin: 0, lineHeight: 1.55, maxWidth: 760 }}>{sub}</p>}
    </div>
  );
}

function ProgramCard({ program: p }) {
  const mailto = `mailto:${EDUCATION_CHAIR_EMAIL}?subject=${encodeURIComponent(p.cta.subject)}`;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DDE5D8',
      borderRadius: 14,
      padding: '22px 22px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 1px 4px rgba(27, 58, 46, 0.05)',
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8C7A35', marginBottom: 6 }}>
          {p.eyebrow}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#1B3A2E', lineHeight: 1.2 }}>{p.title}</div>
      </div>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>{p.blurb}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
        {p.items.map((it, i) => (
          <li key={i} style={{ fontSize: 13, color: '#1F2937', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#B5A04A', fontWeight: 700, flexShrink: 0 }}>✦</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 'auto', paddingTop: 6 }}>
        <a
          href={mailto}
          style={{
            display: 'inline-block',
            background: '#2D6A4F',
            color: '#F5EAD6',
            padding: '8px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {p.cta.label} →
        </a>
      </div>
    </div>
  );
}

function InfoTile({ title, body, cta, subject }) {
  const mailto = `mailto:${EDUCATION_CHAIR_EMAIL}?subject=${encodeURIComponent(subject)}`;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DDE5D8',
      borderRadius: 12,
      padding: '18px 18px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1B3A2E' }}>{title}</div>
      <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.55, margin: 0 }}>{body}</p>
      <a
        href={mailto}
        style={{
          marginTop: 'auto',
          color: '#2D6A4F',
          fontWeight: 600,
          fontSize: 13,
          textDecoration: 'none',
        }}
      >
        {cta}
      </a>
    </div>
  );
}
