import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * /membership — AWI Florida Chapter membership tiers.
 *
 * Reads tier rows from public.chapter_tiers (seeded by
 * migration-awi-florida-rebrand.sql) so chapter staff can edit dues,
 * names, and perks without a code deploy. Renders the three tiers
 * side-by-side with a "Your current tier" badge for signed-in users and
 * a primary CTA that adapts: signed-out users go to /signup, signed-in
 * users on a lower tier see "Request upgrade" which opens a mailto:
 * link to the chapter treasurer (placeholder address — swap to the real
 * one in the constant below).
 */
const TREASURER_EMAIL = 'treasurer@awiflorida.org';

export default function Membership() {
  const { isAuthed, profile } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('chapter_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (cancelled) return;
      if (error) setErr(error.message || 'Could not load membership tiers.');
      setTiers(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const currentTier = profile?.membership_tier || 'guest';

  const ctaFor = (tierId) => {
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
    // Upgrade / change tier — for now this is a mailto: to the treasurer.
    // Phase 4b can swap this for a real apply-for-upgrade flow.
    const subject = encodeURIComponent(`AWI Florida — request ${tierId} membership`);
    const body = encodeURIComponent(
      `Hello,\n\nI'd like to apply for the ${tierId} tier for the AWI Florida Chapter.\n\n` +
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
        {tierId === 'guest' ? 'Downgrade to Guest' : 'Request ' + capitalize(tierId)}
      </a>
    );
  };

  return (
    <div style={{ background: '#FAF4E7', minHeight: '70vh' }}>
      {/* Hero band */}
      <section className="gh-hero" style={{ background: 'linear-gradient(180deg, #3A2410 0%, #2c1a0e 100%)', color: '#F5EAD6', padding: '3rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c0a070', marginBottom: 8, fontWeight: 700 }}>
            AWI Florida Chapter · Membership
          </div>
          <h1 style={{ fontSize: 38, lineHeight: 1.15, margin: '0 0 14px', fontWeight: 400 }}>
            Join the chapter. Connect with Florida's <em style={{ color: '#FFD7AC' }}>architectural woodwork</em> professionals.
          </h1>
          <p style={{ fontSize: 16, maxWidth: 760, lineHeight: 1.55, color: 'rgba(245,234,214,0.85)', margin: 0 }}>
            Three tiers, annual dues, paid directly to the chapter. Members get directory listings,
            discounted event pricing, voting rights, and access to member-only resources.
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        {loading && <div style={{ textAlign: 'center', padding: 48, color: '#6b3f1f' }}>Loading membership tiers…</div>}
        {err && <div className="claim-error" style={{ margin: '0 0 16px' }}>{err}</div>}

        {!loading && tiers.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {tiers.map((t) => (
              <TierCard key={t.id} tier={t} highlight={t.id === 'member'} cta={ctaFor(t.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Detail / FAQ band */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
        <h2 style={{ fontSize: 22, color: '#2c1a0e', margin: '0 0 14px', fontWeight: 600 }}>
          How chapter membership works
        </h2>
        <div style={{ display: 'grid', gap: 14, fontSize: 15, color: '#4d3a26', lineHeight: 1.65 }}>
          <p>
            <strong>Annual dues</strong> are billed once per calendar year. Your <code>dues_paid_through</code>
            date on your profile is set when payment is recorded by the chapter treasurer.
          </p>
          <p>
            <strong>Member directory</strong> listings are visible to all signed-in members and to the
            general public at <Link to="/suppliers">/suppliers</Link>. Only Chapter Member tier accounts
            appear in the public directory by default.
          </p>
          <p>
            <strong>Voting rights and board eligibility</strong> are reserved for Chapter Member tier
            accounts in good standing (dues paid through current year).
          </p>
          <p>
            <strong>Associate tier</strong> is designed for employees of member firms and for academic
            affiliates. Associates get full read access to member resources and can attend events at the
            non-member or invited rate set by the chapter for each event.
          </p>
          <p style={{ padding: '14px 16px', background: '#fff', border: '1px solid #EDD9B0', borderRadius: 8 }}>
            Questions? Email the chapter treasurer at{' '}
            <a href={`mailto:${TREASURER_EMAIL}`} style={{ color: '#8a5030', fontWeight: 600 }}>{TREASURER_EMAIL}</a>.
          </p>
        </div>
      </section>
    </div>
  );
}

function TierCard({ tier, highlight, cta }) {
  const perks = Array.isArray(tier.perks) ? tier.perks : [];
  const dues = tier.annual_dues_usd != null ? Number(tier.annual_dues_usd) : null;

  return (
    <div style={{
      background: '#fff',
      border: highlight ? '2px solid #8a5030' : '1px solid #EDD9B0',
      borderRadius: 14,
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      boxShadow: highlight ? '0 8px 24px rgba(138, 80, 48, 0.18)' : '0 1px 4px rgba(44, 26, 14, 0.04)',
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -12, left: 22,
          background: '#8a5030', color: '#F5EAD6',
          padding: '4px 12px', borderRadius: 999,
          fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase',
        }}>
          Most popular
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8a5030', marginBottom: 6 }}>
          {tier.id}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#2c1a0e', lineHeight: 1.15 }}>
          {tier.name}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {dues != null && dues > 0 ? (
          <>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#2c1a0e' }}>${dues.toFixed(0)}</span>
            <span style={{ fontSize: 13, color: '#6b3f1f' }}>/ year</span>
          </>
        ) : (
          <span style={{ fontSize: 28, fontWeight: 700, color: '#2E6F2E' }}>Free</span>
        )}
      </div>

      {tier.blurb && (
        <p style={{ fontSize: 14, color: '#4d3a26', lineHeight: 1.55, margin: 0 }}>{tier.blurb}</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {perks.map((p, i) => (
          <li key={i} style={{ fontSize: 13.5, color: '#3a2410', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#2E6F2E', fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        {cta}
      </div>
    </div>
  );
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
