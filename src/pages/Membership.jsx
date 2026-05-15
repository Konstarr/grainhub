import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * /membership — AWI Florida Chapter membership + sponsorship hub.
 *
 * Reads two reference tables from Supabase:
 *   - chapter_tiers           the 3 membership tiers (manufacturer / supplier / guest)
 *   - chapter_sponsorships    annual chapter sponsors + event-level sponsorship slots
 *
 * Both tables are seeded by migration-awi-florida-tiers-v2.sql and are
 * editable by admins, so the chapter can adjust dues, perks, and
 * sponsorship pricing without a code deploy.
 */
const TREASURER_EMAIL = 'treasurer@awiflorida.org';

export default function Membership() {
  const { isAuthed, profile } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [tiersRes, sponRes] = await Promise.all([
        supabase.from('chapter_tiers').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        supabase.from('chapter_sponsorships').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      ]);
      if (cancelled) return;
      if (tiersRes.error) setErr(tiersRes.error.message || 'Could not load membership tiers.');
      setTiers(tiersRes.data || []);
      setSponsorships(sponRes.data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const annualSponsorships = useMemo(() => sponsorships.filter((s) => s.tier === 'annual'), [sponsorships]);
  const eventSponsorships  = useMemo(() => sponsorships.filter((s) => s.tier === 'event'),  [sponsorships]);

  // Group event sponsorships by event_slug so we can render them under
  // a heading for each event (golf, showcase, etc.).
  const eventGroups = useMemo(() => {
    const groups = {};
    for (const s of eventSponsorships) {
      const key = s.event_slug || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return groups;
  }, [eventSponsorships]);

  const currentTier = profile?.membership_tier || 'guest';

  const tierCTA = (tierId) => {
    if (!isAuthed) {
      return (
        <Link to="/signup" className="claim-btn primary" style={{ width: '100%', textAlign: 'center' }}>
          Sign up
        </Link>
      );
    }
    if (tierId === currentTier) {
      return (
        <div style={{
          width: '100%', textAlign: 'center', padding: '10px 14px',
          background: '#DDEFD3', color: '#2E6F2E',
          borderRadius: 8, fontWeight: 700, fontSize: 13,
        }}>
          Your current tier
        </div>
      );
    }
    const subject = encodeURIComponent(`AWI Florida — request ${tierId} membership`);
    const body = encodeURIComponent(
      `Hello,\n\nI'd like to apply for the ${tierId} membership tier for the AWI Florida Chapter.\n\n` +
      `My current tier: ${currentTier}\n` +
      `Name: ${profile?.full_name || ''}\n` +
      `Company: ${profile?.business_name || profile?.company_name || ''}\n` +
      `Region: ${profile?.region || ''}\n\nThank you.`
    );
    return (
      <a
        href={`mailto:${TREASURER_EMAIL}?subject=${subject}&body=${body}`}
        className="claim-btn primary"
        style={{ width: '100%', textAlign: 'center', display: 'inline-block', textDecoration: 'none' }}
      >
        {tierId === 'guest' ? 'Downgrade to Guest' : `Apply as ${labelFor(tierId)}`}
      </a>
    );
  };

  const sponsorshipCTA = (s) => {
    const subject = encodeURIComponent(`AWI Florida — interested in ${s.name}`);
    const body = encodeURIComponent(
      `Hello,\n\nWe'd like to reserve the "${s.name}" sponsorship.\n\n` +
      `Price: $${Number(s.price_usd || 0).toFixed(0)}\n` +
      `Company: ${profile?.business_name || profile?.company_name || ''}\n` +
      `Contact: ${profile?.full_name || ''}\n\nPlease send next steps. Thank you.`
    );
    return (
      <a
        href={`mailto:${TREASURER_EMAIL}?subject=${subject}&body=${body}`}
        className="claim-btn primary"
        style={{ textDecoration: 'none', display: 'inline-block' }}
      >
        Reserve →
      </a>
    );
  };

  return (
    <div style={{ background: '#FAF4E7', minHeight: '70vh' }}>
      {/* Hero */}
      <section className="gh-hero" style={{ background: 'linear-gradient(180deg, #1F4534 0%, #1B3A2E 100%)', color: '#F5EAD6', padding: '3rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5C9A5', marginBottom: 8, fontWeight: 700 }}>
            AWI Florida Chapter · Membership & Sponsorship
          </div>
          <h1 style={{ fontSize: 38, lineHeight: 1.15, margin: '0 0 14px', fontWeight: 400 }}>
            Join the chapter. <em style={{ color: '#D5E5BC' }}>Sponsor a chapter event.</em>
          </h1>
          <p style={{ fontSize: 16, maxWidth: 760, lineHeight: 1.55, color: 'rgba(245,234,214,0.85)', margin: 0 }}>
            Two paid membership tiers — Manufacturer and Supplier — plus a free Guest tier.
            Annual chapter sponsorships and event-level opportunities give suppliers direct
            visibility into Florida's architectural woodwork community.
          </p>
        </div>
      </section>

      {/* ====================== MEMBERSHIP ====================== */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="Membership"
          title="Three ways to be part of the chapter"
          sub="Annual dues, paid directly to the chapter treasurer."
        />

        {loading && <div style={{ textAlign: 'center', padding: 48, color: '#2D5A3D' }}>Loading membership…</div>}
        {err && <div className="claim-error" style={{ margin: '0 0 16px' }}>{err}</div>}

        {!loading && tiers.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {tiers.map((t) => (
              <TierCard
                key={t.id}
                tier={t}
                highlight={t.id === 'manufacturer' || t.id === 'supplier'}
                cta={tierCTA(t.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ====================== SPONSORSHIP ====================== */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="Annual chapter sponsorship"
          title="Put your brand in front of Florida millwork — year-round"
          sub="Annual sponsors get visibility on the chapter website, at every event, and in member communications for one full year."
        />

        {!loading && annualSponsorships.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {annualSponsorships.map((s) => (
              <SponsorCard key={s.id} sponsorship={s} highlight={s.id === 'annual-platinum'} cta={sponsorshipCTA(s)} />
            ))}
          </div>
        )}
      </section>

      {/* ====================== EVENT SPONSORSHIP ====================== */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <SectionHeading
          eyebrow="Event sponsorship"
          title="Sponsor a single chapter event"
          sub="Event-tied sponsorships have limited slots and tend to sell out as the event date approaches. Reserve early."
        />

        {!loading && Object.keys(eventGroups).length > 0 && (
          <div style={{ display: 'grid', gap: 28 }}>
            {Object.entries(eventGroups).map(([eventSlug, items]) => (
              <EventSponsorBlock
                key={eventSlug}
                eventSlug={eventSlug}
                items={items}
                sponsorshipCTA={sponsorshipCTA}
              />
            ))}
          </div>
        )}
      </section>

      {/* FAQ / contact */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <h2 style={{ fontSize: 22, color: '#1B3A2E', margin: '0 0 14px', fontWeight: 600 }}>
          How chapter membership &amp; sponsorship works
        </h2>
        <div style={{ display: 'grid', gap: 14, fontSize: 15, color: '#2D4A3D', lineHeight: 1.65 }}>
          <p>
            <strong>Manufacturer Member</strong> ($575/yr) — for Florida shops that build the work: cabinet
            shops, architectural millwork firms, finishers, installers. Voting rights, directory listing,
            event member-rate pricing.
          </p>
          <p>
            <strong>Supplier Member</strong> ($575/yr) — for hardware, lumber, machinery, finish, and software
            vendors selling into the Florida architectural woodwork industry. Same access plus direct
            visibility into the manufacturer membership at chapter events.
          </p>
          <p>
            <strong>Annual sponsors</strong> get year-round visibility across the website and every chapter
            event. <strong>Event sponsors</strong> back one specific event — typically the annual golf outing
            and tabletop product showcase — and have limited slots.
          </p>
          <p style={{ padding: '14px 16px', background: '#fff', border: '1px solid #DDE5D8', borderRadius: 8 }}>
            Questions, payment, or reservations? Email the chapter treasurer at{' '}
            <a href={`mailto:${TREASURER_EMAIL}`} style={{ color: '#2D6A4F', fontWeight: 600 }}>{TREASURER_EMAIL}</a>.
          </p>
        </div>
      </section>
    </div>
  );
}

/* -------------------------- subcomponents -------------------------- */

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.6, color: '#2D6A4F', textTransform: 'uppercase', marginBottom: 6 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 500, color: '#1B3A2E', margin: '0 0 6px', lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontSize: 14.5, color: '#2D4A3D', margin: 0, lineHeight: 1.55, maxWidth: 760 }}>{sub}</p>}
    </div>
  );
}

function TierCard({ tier, highlight, cta }) {
  const perks = Array.isArray(tier.perks) ? tier.perks : [];
  const dues = tier.annual_dues_usd != null ? Number(tier.annual_dues_usd) : null;
  return (
    <div style={{
      background: '#fff',
      border: highlight ? '2px solid #2D6A4F' : '1px solid #DDE5D8',
      borderRadius: 14, padding: '24px 22px',
      display: 'flex', flexDirection: 'column', gap: 14, position: 'relative',
      boxShadow: highlight ? '0 8px 24px rgba(45, 106, 79, 0.16)' : '0 1px 4px rgba(27, 58, 46, 0.04)',
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#2D6A4F', marginBottom: 6 }}>{tier.id}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#1B3A2E', lineHeight: 1.15 }}>{tier.name}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {dues != null && dues > 0 ? (
          <>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#1B3A2E' }}>${dues.toFixed(0)}</span>
            <span style={{ fontSize: 13, color: '#2D5A3D' }}>/ year</span>
          </>
        ) : (
          <span style={{ fontSize: 28, fontWeight: 700, color: '#2E6F2E' }}>Free</span>
        )}
      </div>
      {tier.blurb && <p style={{ fontSize: 14, color: '#2D4A3D', lineHeight: 1.55, margin: 0 }}>{tier.blurb}</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {perks.map((p, i) => (
          <li key={i} style={{ fontSize: 13.5, color: '#1F4534', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#2E6F2E', fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>{cta}</div>
    </div>
  );
}

function SponsorCard({ sponsorship: s, highlight, cta }) {
  const perks = Array.isArray(s.perks) ? s.perks : [];
  const price = s.price_usd != null ? Number(s.price_usd) : null;
  return (
    <div style={{
      background: '#fff',
      border: highlight ? '2px solid #6B8E5A' : '1px solid #DDE5D8',
      borderRadius: 14, padding: '22px 20px',
      display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
      boxShadow: highlight ? '0 6px 18px rgba(107, 142, 90, 0.18)' : '0 1px 4px rgba(27, 58, 46, 0.04)',
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -12, left: 18,
          background: 'linear-gradient(180deg, #d8a25b, #6B8E5A)', color: '#0F2A1F',
          padding: '4px 12px', borderRadius: 999,
          fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase',
        }}>Top tier</div>
      )}
      <div style={{ fontSize: 20, fontWeight: 600, color: '#1B3A2E', lineHeight: 1.2 }}>{s.name}</div>
      {price != null && price > 0 && (
        <div>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#1B3A2E' }}>${price.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: '#2D5A3D', marginLeft: 4 }}>/ year</span>
        </div>
      )}
      {s.slots_available != null && (
        <div style={{ fontSize: 12, color: '#7C6E22', fontWeight: 600 }}>
          {s.slots_available} {s.slots_available === 1 ? 'slot' : 'slots'} available
        </div>
      )}
      {s.blurb && <p style={{ fontSize: 13.5, color: '#2D4A3D', lineHeight: 1.55, margin: 0 }}>{s.blurb}</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
        {perks.map((p, i) => (
          <li key={i} style={{ fontSize: 13, color: '#1F4534', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: '#6B8E5A', fontWeight: 700, flexShrink: 0 }}>✦</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 'auto', paddingTop: 6 }}>{cta}</div>
    </div>
  );
}

function EventSponsorBlock({ eventSlug, items, sponsorshipCTA }) {
  const eventName = friendlyEventName(eventSlug);
  return (
    <div style={{ background: '#fff', border: '1px solid #DDE5D8', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(180deg, #1F4534, #1B3A2E)',
        color: '#F5EAD6', padding: '14px 18px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: '#B5C9A5', fontWeight: 700 }}>Event sponsorship</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{eventName}</div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(245,234,214,0.7)' }}>
          {items.length} {items.length === 1 ? 'opportunity' : 'opportunities'}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#FFF8EE' }}>
            <th style={th}>Sponsorship</th>
            <th style={{ ...th, width: 110, textAlign: 'right' }}>Price</th>
            <th style={{ ...th, width: 90,  textAlign: 'right' }}>Slots</th>
            <th style={{ ...th, width: 130, textAlign: 'right' }}>Reserve</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} style={{ borderTop: '1px solid #DDE5D8' }}>
              <td style={td}>
                <div style={{ fontWeight: 600, color: '#1B3A2E' }}>{s.name.replace(/^.*?—\s*/, '')}</div>
                {s.blurb && <div style={{ fontSize: 12.5, color: '#2D5A3D', marginTop: 2 }}>{s.blurb}</div>}
                {Array.isArray(s.perks) && s.perks.length > 0 && (
                  <div style={{ fontSize: 12, color: '#2D4A3D', marginTop: 4 }}>{s.perks.join(' · ')}</div>
                )}
              </td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#1B3A2E' }}>
                ${Number(s.price_usd || 0).toLocaleString()}
              </td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: s.slots_available === 1 ? '#9B2222' : '#7C6E22', fontWeight: 600 }}>
                {s.slots_available == null ? 'open' : s.slots_available}
              </td>
              <td style={{ ...td, textAlign: 'right' }}>{sponsorshipCTA(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: '#2D5A3D' };
const td = { padding: '12px 14px', verticalAlign: 'top' };

function labelFor(id) {
  if (id === 'manufacturer') return 'Manufacturer';
  if (id === 'supplier')     return 'Supplier';
  if (id === 'guest')        return 'Guest';
  return id ? id[0].toUpperCase() + id.slice(1) : id;
}

function friendlyEventName(slug) {
  switch (slug) {
    case 'annual-golf-outing': return 'Annual Golf Outing';
    case 'tabletop-showcase':  return 'Tabletop Product Showcase';
    case 'other':              return 'Other events';
    default:
      return (slug || 'Event').split('-').map((s) => s ? s[0].toUpperCase() + s.slice(1) : s).join(' ');
  }
}
