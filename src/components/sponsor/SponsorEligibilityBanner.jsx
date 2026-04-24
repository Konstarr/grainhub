import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Renders above the Sponsor page pricing. Shows one of three states:
 *   1. Not signed in     — "Sign up as a business to apply"
 *   2. Individual signed in — "Business accounts only"
 *   3. Business signed in   — "Apply for sponsorship" CTA
 *
 * Pricing itself is always visible below so top-of-funnel visitors can
 * see tier value before they commit to creating an account.
 */
export default function SponsorEligibilityBanner() {
  const { isAuthed, profile } = useAuth();
  const accountType = profile?.account_type;

  let state, title, body, cta;

  if (!isAuthed) {
    state = 'signed-out';
    title = 'Sponsorship is available to business accounts';
    body  = 'Create a business account in ~60 seconds — individuals can explore pricing, but only businesses can apply for a tier or run ads.';
    cta   = (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/signup" className="sp-banner-primary">Create a business account</Link>
        <Link to="/login" className="sp-banner-secondary">Log in</Link>
      </div>
    );
  } else if (accountType !== 'business') {
    state = 'individual';
    title = 'Business accounts only';
    body  = "Your account is set up as an individual, so you can browse tiers but can't apply. Business-account conversion isn't supported — create a separate business account to sponsor.";
    cta   = (
      <Link to="/signup" className="sp-banner-primary">Create a business account</Link>
    );
  } else {
    state = 'business';
    title = profile?.sponsor_tier
      ? 'You\u2019re an active ' + cap(profile.sponsor_tier) + ' sponsor'
      : 'Ready to sponsor?';
    body  = profile?.sponsor_tier
      ? 'Your tier unlocks ad placements automatically. Manage your media from your profile, or contact us to change tiers.'
      : 'Pick the tier that fits, then hit Apply below — we\u2019ll review within 1\u20132 business days and flip on your ad slots.';
    cta   = profile?.sponsor_tier
      ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to={'/profile/' + (profile.username || '')} className="sp-banner-primary">Manage media</Link>
          <a href="mailto:sponsor@grainhub.io" className="sp-banner-secondary">Contact us</a>
        </div>
      )
      : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="#packages" className="sp-banner-primary">See packages</a>
          <a href="mailto:sponsor@grainhub.io" className="sp-banner-secondary">Contact us</a>
        </div>
      );
  }

  const tone = state === 'individual'
    ? { border: '#f0d99f', bg: '#fff7e4', accent: '#7a5118' }
    : state === 'business'
      ? { border: '#c7ddb5', bg: '#eaf5e1', accent: '#3b6e28' }
      : { border: 'var(--border)', bg: 'var(--wood-cream, #FBF6EC)', accent: 'var(--wood-warm)' };

  return (
    <>
      <style>{`
        .sp-banner-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.55rem 1.15rem;
          background: linear-gradient(135deg, #8A5030, #6B3D20);
          color: #fff; text-decoration: none; border-radius: 999px;
          font-weight: 600; font-size: 13.5px;
          box-shadow: 0 2px 4px rgba(90,66,38,0.2);
          transition: filter 120ms, transform 100ms;
          border: none; cursor: pointer; font-family: inherit;
        }
        .sp-banner-primary:hover { filter: brightness(1.08); }
        .sp-banner-primary:active { transform: translateY(1px); }
        .sp-banner-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.55rem 1.15rem;
          background: var(--white); color: var(--text-primary);
          text-decoration: none; border-radius: 999px;
          font-weight: 600; font-size: 13.5px;
          border: 1px solid var(--border);
          transition: background 120ms, border-color 120ms;
          cursor: pointer; font-family: inherit;
        }
        .sp-banner-secondary:hover { background: var(--wood-cream, #FBF6EC); border-color: var(--wood-warm); }
      `}</style>
      <section
        style={{
          maxWidth: 1040,
          margin: '1.25rem auto',
          padding: '1.1rem 1.4rem',
          background: tone.bg,
          border: '1px solid ' + tone.border,
          borderRadius: 14,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ minWidth: 260, flex: '1 1 360px' }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: tone.accent,
            marginBottom: 4,
          }}>
            {state === 'business' ? 'Business account' : state === 'individual' ? 'Individual account' : 'Not signed in'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: 640 }}>
            {body}
          </div>
        </div>
        <div>{cta}</div>
      </section>
    </>
  );
}

function cap(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1); }
