import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import MarketplaceListingForm from '../components/marketplace/MarketplaceListingForm.jsx';
import {
  getMarketplaceEligibility,
  createMyListing,
} from '../lib/marketplaceDb.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * /marketplace/new — eligibility-gated listing composer.
 *
 * Shows a status banner with X of Y posts used this month, derived from
 * the marketplace_eligibility() RPC (server-authoritative). The form is
 * mounted only when eligible.
 */

export default function MarketplaceNew() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [eligibility, setElig]    = useState(null);
  const [busy, setBusy]           = useState(false);
  const [submitErr, setSubmitErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const e = await getMarketplaceEligibility();
      if (!cancelled) {
        setElig(e);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (payload) => {
    setBusy(true);
    setSubmitErr(null);
    const { data, error } = await createMyListing(payload);
    setBusy(false);
    if (error) {
      const msg = error.message || String(error);
      if (/not_eligible/.test(msg)) {
        setSubmitErr(
          'Your vendor pack does not currently allow more posts this month. Refresh to see updated counts.'
        );
        // Re-pull eligibility so banner updates.
        getMarketplaceEligibility().then(setElig).catch(() => null);
      } else {
        setSubmitErr(msg);
      }
      return;
    }
    if (data?.slug) {
      navigate('/marketplace/listing/' + data.slug);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <>
      <PageBack
        backTo="/marketplace"
        backLabel="Back to Marketplace"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Marketplace', to: '/marketplace' },
          { label: 'New listing' },
        ]}
      />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '1rem 1.25rem 4rem' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wood-warm)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Sell on Millwork.io
          </div>
          <h1 style={{ margin: '0.3rem 0', fontSize: 28 }}>Post a marketplace listing</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 640 }}>
            Vendor-pack members can list machinery, lumber, sheet goods, hardware,
            and tooling. Listings go live immediately and stay listed until you
            mark them sold or remove them.
          </p>
        </header>

        {!isAuthed && (
          <div className="rs-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Sign in to post</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You need a Millwork.io account with an active Vendor pack to post listings.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="act-btn primary">Sign in</Link>
              <Link to="/signup" className="act-btn">Create an account</Link>
            </div>
          </div>
        )}

        {isAuthed && loading && (
          <div className="rs-card" style={{ padding: '1.5rem' }}>
            Checking your vendor pack…
          </div>
        )}

        {isAuthed && !loading && eligibility && (
          <EligibilityBanner eligibility={eligibility} />
        )}

        {isAuthed && !loading && eligibility?.eligible && (
          <div className="rs-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <MarketplaceListingForm
              busy={busy}
              submitLabel="Publish listing"
              onSubmit={handleSubmit}
              onCancel={() => navigate('/marketplace')}
            />
            {submitErr && (
              <div style={{
                marginTop: '1rem',
                padding: '0.6rem 0.8rem',
                background: '#fff4f4',
                color: '#9c1f1f',
                border: '1px solid #f3c9c9',
                borderRadius: 8,
                fontSize: 13,
              }}>
                {submitErr}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}


function EligibilityBanner({ eligibility }) {
  const { eligible, reason, packLabel, monthlyLimit, postedThisMonth, remaining } = eligibility;

  const bg = eligible ? '#eef7ee' : '#fff4f4';
  const fg = eligible ? '#1f5d1f' : '#9c1f1f';
  const bd = eligible ? '#cfe6cf' : '#f3c9c9';

  let body = null;

  if (eligible) {
    body = (
      <>
        <strong>{packLabel}</strong>{' '}
        — {monthlyLimit == null
          ? `Unlimited posts this month (${postedThisMonth} so far).`
          : `${postedThisMonth} of ${monthlyLimit} posts used this month — ${remaining} remaining.`
        }
      </>
    );
  } else if (reason === 'not_signed_in') {
    body = 'Sign in to post a listing.';
  } else if (reason === 'no_vendor_pack') {
    body = (
      <>
        Posting requires an active <strong>Vendor</strong> pack.{' '}
        <Link to="/account/subscription" style={{ color: 'inherit', textDecoration: 'underline' }}>
          View vendor pack pricing →
        </Link>
      </>
    );
  } else if (reason === 'pack_not_configured') {
    body = (
      <>
        Your vendor pack tier isn&apos;t configured for marketplace yet. Contact support and
        we&apos;ll have you posting within the day.
      </>
    );
  } else if (reason === 'monthly_limit_reached') {
    body = (
      <>
        <strong>{packLabel}</strong> caps you at <strong>{monthlyLimit}</strong> posts per month
        and you&apos;ve used all of them ({postedThisMonth}). New posts unlock at the start of
        next month, or upgrade your pack for a higher limit.
      </>
    );
  } else {
    body = 'Could not verify posting eligibility — please refresh.';
  }

  return (
    <div style={{
      padding: '0.85rem 1rem',
      background: bg,
      color: fg,
      border: '1px solid ' + bd,
      borderRadius: 10,
      fontSize: 14,
      marginBottom: '0.5rem',
    }}>
      {body}
    </div>
  );
}
