import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlanChanges } from '../context/PlanContext.jsx';
import { supabase } from '../lib/supabase.js';
import { loadPlan } from '../lib/permissions.js';
import {
  findIndividualTier,
  findBusinessTier,
  findPack,
  findPackTier,
  findSponsorTier,
  A_LA_CARTE,
  formatPrice,
} from '../lib/pricing.js';
import '../styles/cart.css';

/**
 * /account/subscription — single hub for everything plan-related.
 *
 * Top section: pending changes (only when count > 0). Diff-style
 * read of "current → new" for each change, with Discard / Apply.
 *
 * Below that: the user's CURRENT plan, broken into Membership /
 * Role packs / Sponsorship sections. Each section has CTAs that
 * route over to /pricing where the user stages additional changes.
 *
 * Apply calls apply_my_subscription RPC for the recurring items.
 * À la carte one-offs are flagged for follow-up (until Stripe is
 * live, our team handles them manually). When Stripe wires in,
 * Apply will create a Checkout Session from the same payload —
 * no UX changes needed.
 */
export default function AccountSubscription() {
  const { user, profile, isAuthed, refreshProfile } = useAuth();
  const plan = usePlanChanges();
  const [current, setCurrent] = useState({ packs: {}, profile: null });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [err, setErr] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const data = await loadPlan(supabase, user.id);
      if (!cancelled) {
        setCurrent(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!isAuthed) {
    return (
      <div className="acct-wrap">
        <div className="cart-empty">
          <h1>Sign in to manage your subscription</h1>
          <p>You need to be signed in to view and update your plan.</p>
          <Link to="/login" className="cart-btn primary">Log in</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="acct-wrap">
        <div className="acct-empty">Loading your plan…</div>
      </div>
    );
  }

  const accountType  = current.profile?.account_type  || profile?.account_type  || 'individual';
  const membershipId = current.profile?.membership_tier || profile?.membership_tier || 'free';
  const sponsorId    = current.profile?.sponsor_tier    || profile?.sponsor_tier    || null;

  const membership = accountType === 'business'
    ? findBusinessTier(membershipId)
    : findIndividualTier(membershipId);

  const sponsor = sponsorId ? findSponsorTier(sponsorId) : null;

  const packEntries = Object.entries(current.packs || {})
    .map(([packId, tierId]) => {
      const pack = findPack(packId);
      const tier = findPackTier(packId, tierId);
      if (!pack) return null;
      return { pack, tier };
    })
    .filter(Boolean);

  const currentMrr =
    (membership?.priceMonthly || 0) +
    (sponsor?.priceMonthly || 0) +
    packEntries.reduce((s, p) => s + (p.tier?.priceMonthly || 0), 0);

  const handleApply = async () => {
    setErr(null); setOkMsg(null);
    setApplying(true);

    const membershipChange = plan.pendingChanges.find((c) => c.type === 'membership');
    const sponsorChange    = plan.pendingChanges.find((c) => c.type === 'sponsor');
    const packChanges      = plan.pendingChanges.filter((c) => c.type === 'pack');
    const aLaCarteChanges  = plan.pendingChanges.filter((c) => c.type === 'alacarte');

    // Build the merged packs map. Start from current packs, overlay
    // any pending pack additions/changes. RPC fully replaces packs,
    // so we always send the FULL set.
    const mergedPacks = { ...(current.packs || {}) };
    packChanges.forEach((p) => { mergedPacks[p.id] = p.tierId; });

    const { error } = await supabase.rpc('apply_my_subscription', {
      membership_tier_in: membershipChange ? membershipChange.id : (membershipId || null),
      sponsor_tier_in:    sponsorChange ? sponsorChange.id : (sponsorId || null),
      packs_in:           mergedPacks,
    });

    if (error) {
      setApplying(false);
      setErr(error.message || 'Could not apply your changes. Try again.');
      return;
    }

    await refreshProfile();
    // Refresh the current plan view too so the page reflects new state
    if (user?.id) {
      const fresh = await loadPlan(supabase, user.id);
      setCurrent(fresh);
    }
    setApplying(false);
    if (aLaCarteChanges.length > 0) {
      setOkMsg(
        'Plan updated. We\'ll email you within one business day to schedule the one-off promotions.',
      );
    } else {
      setOkMsg('Plan updated. Your new tier is active immediately.');
    }
    plan.discard();
  };

  return (
    <div className="acct-wrap">
      <div className="acct-head">
        <div className="acct-eyebrow">Account</div>
        <h1 className="acct-title">Manage subscription</h1>
      </div>

      {/* ── Pending changes (only when count > 0) ── */}
      {plan.count > 0 && (
        <PendingChangesPanel
          plan={plan}
          accountType={accountType}
          currentMembership={membership}
          currentSponsor={sponsor}
          currentPacks={current.packs || {}}
          onApply={handleApply}
          applying={applying}
          err={err}
        />
      )}

      {okMsg && <div className="cart-ok" style={{ marginBottom: '1rem' }}>{okMsg}</div>}

      {/* ── Membership ── */}
      <section className="acct-section">
        <div className="acct-section-title">
          <span>Membership</span>
          <Link
            to={accountType === 'business' ? '/pricing?persona=business' : '/pricing'}
            className="cart-btn ghost"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            Change plan
          </Link>
        </div>
        <div className="acct-row">
          <div>
            <div className="acct-row-name">{membership?.name || membershipId}</div>
            {membership?.tagline && <div className="acct-row-sub">{membership.tagline}</div>}
            <div className="acct-row-sub" style={{ fontStyle: 'italic', marginTop: 4 }}>
              {accountType === 'business' ? 'Business account' : 'Individual account'}
            </div>
          </div>
          <div className="acct-row-price">
            {formatPrice(membership?.priceMonthly || 0)}
            {(membership?.priceMonthly || 0) > 0 && '/mo'}
          </div>
        </div>
      </section>

      {/* ── Role packs (business only) ── */}
      {accountType === 'business' && (
        <section className="acct-section">
          <div className="acct-section-title">
            <span>Role packs</span>
            <Link
              to="/pricing?persona=business"
              className="cart-btn ghost"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              Add or change packs
            </Link>
          </div>
          {packEntries.length === 0 ? (
            <div className="acct-empty">
              No role packs active. Recruiter / vendor / supplier packs unlock
              additional placement, volume, and tools.
            </div>
          ) : (
            packEntries.map(({ pack, tier }) => (
              <div className="acct-row" key={pack.id}>
                <div>
                  <div className="acct-row-name">{pack.name}</div>
                  <div className="acct-row-sub">
                    {tier?.name || 'Active'}
                    {tier?.cap !== undefined && tier.cap !== Infinity && (
                      <> · up to {tier.cap} {tier.cap === 1 ? pack.unit : pack.unitPlural}</>
                    )}
                  </div>
                </div>
                <div className="acct-row-price">
                  {formatPrice(tier?.priceMonthly || 0)}
                  {(tier?.priceMonthly || 0) > 0 && '/mo'}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* ── Sponsorship ── */}
      <section className="acct-section">
        <div className="acct-section-title">
          <span>Sponsorship</span>
          <Link to="/sponsor" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
            {sponsor ? 'Change tier' : 'Become a sponsor'}
          </Link>
        </div>
        {sponsor ? (
          <div className="acct-row">
            <div>
              <div className="acct-row-name">{sponsor.name}</div>
              {sponsor.tagline && <div className="acct-row-sub">{sponsor.tagline}</div>}
            </div>
            <div className="acct-row-price">{formatPrice(sponsor.priceMonthly)}/mo</div>
          </div>
        ) : (
          <div className="acct-empty">
            Not currently sponsoring. Sponsor tiers offer site-wide brand visibility.
          </div>
        )}
      </section>

      {/* ── Monthly total ── */}
      <section className="acct-section" style={{ background: '#FDFBF5' }}>
        <div className="acct-section-title">Your monthly total</div>
        <div className="acct-row">
          <div>
            <div className="acct-row-name">Recurring (per month)</div>
            <div className="acct-row-sub">
              Excludes one-off promotions and "Contact sales" tiers.
            </div>
          </div>
          <div className="acct-row-price" style={{ fontSize: 22 }}>
            ${currentMrr.toLocaleString()}
          </div>
        </div>
      </section>

      <div style={{
        marginTop: '1.25rem',
        padding: '1rem 1.25rem',
        background: 'var(--white)',
        border: '1px dashed var(--border)',
        borderRadius: 10,
        fontSize: 12.5,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        Need to cancel or downgrade?{' '}
        <a href="mailto:support@grainhub.io" style={{ color: 'var(--wood-warm)' }}>
          Email us
        </a>{' '}
        and we'll handle it within one business day.
      </div>
    </div>
  );
}

function PendingChangesPanel({
  plan,
  accountType,
  currentMembership,
  currentSponsor,
  currentPacks,
  onApply,
  applying,
  err,
}) {
  const rows = useMemo(() => {
    const out = [];
    plan.pendingChanges.forEach((c) => {
      if (c.type === 'membership') {
        const newTier = accountType === 'business'
          ? findBusinessTier(c.id)
          : findIndividualTier(c.id);
        out.push({
          key: 'm-' + c.id,
          icon: '\u21BB',
          title: 'Membership',
          detail: (currentMembership?.name || 'Free') + ' \u2192 ' + (newTier?.name || c.id),
          monthly: (newTier?.priceMonthly || 0) - (currentMembership?.priceMonthly || 0),
          remove: () => plan.removeChange((i) => i.type === 'membership'),
        });
      } else if (c.type === 'pack') {
        const pack = findPack(c.id);
        const newTier = findPackTier(c.id, c.tierId);
        const currentTierId = currentPacks?.[c.id];
        const currentTier = currentTierId ? findPackTier(c.id, currentTierId) : null;
        out.push({
          key: 'p-' + c.id,
          icon: currentTier ? '\u21BB' : '+',
          title: pack?.name || c.id,
          detail: currentTier
            ? currentTier.name + ' \u2192 ' + (newTier?.name || c.tierId)
            : 'Add at ' + (newTier?.name || c.tierId) + ' tier',
          monthly: (newTier?.priceMonthly || 0) - (currentTier?.priceMonthly || 0),
          remove: () => plan.removeChange((i) => i.type === 'pack' && i.id === c.id),
        });
      } else if (c.type === 'sponsor') {
        const newTier = findSponsorTier(c.id);
        out.push({
          key: 's-' + c.id,
          icon: currentSponsor ? '\u21BB' : '+',
          title: 'Sponsorship',
          detail: currentSponsor
            ? currentSponsor.name + ' \u2192 ' + (newTier?.name || c.id)
            : 'Become ' + (newTier?.name || c.id),
          monthly: (newTier?.priceMonthly || 0) - (currentSponsor?.priceMonthly || 0),
          remove: () => plan.removeChange((i) => i.type === 'sponsor'),
        });
      } else if (c.type === 'alacarte') {
        const ac = A_LA_CARTE.find((a) => a.id === c.id);
        out.push({
          key: 'a-' + c.id,
          icon: '+',
          title: 'One-off \u00B7 ' + (ac?.name || c.id),
          detail: ac?.tagline || 'Promotional package',
          oneTime: ac?.price || 0,
          remove: () => plan.removeChange((i) => i.type === 'alacarte' && i.id === c.id),
        });
      }
    });
    return out;
  }, [plan.pendingChanges, accountType, currentMembership, currentSponsor, currentPacks]);

  const totals = rows.reduce(
    (acc, r) => ({
      mrrDelta: acc.mrrDelta + (r.monthly || 0),
      oneTime:  acc.oneTime  + (r.oneTime || 0),
    }),
    { mrrDelta: 0, oneTime: 0 },
  );

  return (
    <section className="acct-section pending-panel">
      <div className="acct-section-title">
        <span>Pending changes ({plan.count})</span>
        <button
          type="button"
          className="cart-btn ghost"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={plan.discard}
          disabled={applying}
        >
          Discard all
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => (
          <div key={r.key} className="acct-row" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22, height: 22,
                borderRadius: 999,
                background: 'var(--wood-warm)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 2,
              }}>{r.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div className="acct-row-name">{r.title}</div>
                <div className="acct-row-sub">{r.detail}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="acct-row-price">
                {r.oneTime !== undefined
                  ? '$' + r.oneTime.toLocaleString()
                  : (r.monthly > 0 ? '+' : '') + '$' + Math.abs(r.monthly).toLocaleString() + '/mo'}
              </div>
              <button
                type="button"
                className="cart-line-x"
                onClick={r.remove}
                aria-label="Remove change"
                disabled={applying}
              >
                {String.fromCharCode(215)}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary-divider" style={{ margin: '0.85rem 0 0.5rem' }} />

      {totals.mrrDelta !== 0 && (
        <div className="cart-summary-row">
          <span>Recurring change</span>
          <strong>
            {totals.mrrDelta > 0 ? '+' : '\u2212'}$
            {Math.abs(totals.mrrDelta).toLocaleString()}/mo
          </strong>
        </div>
      )}
      {totals.oneTime > 0 && (
        <div className="cart-summary-row">
          <span>One-time charges</span>
          <strong>${totals.oneTime.toLocaleString()}</strong>
        </div>
      )}

      {err && <div className="cart-err">{err}</div>}

      <button
        type="button"
        className="cart-btn primary cart-confirm"
        onClick={onApply}
        disabled={applying}
      >
        {applying ? 'Applying\u2026' : 'Apply changes'}
      </button>

      <div className="cart-summary-foot">
        Recurring changes activate immediately. À la carte one-offs route to
        our team for scheduling — we'll email you within one business day.
      </div>
    </section>
  );
}
