import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { supabase } from '../lib/supabase.js';
import { loadPlan } from '../lib/permissions.js';
import {
  findIndividualTier,
  findBusinessTier,
  findPack,
  findPackTier,
  findSponsorTier,
  formatPrice,
} from '../lib/pricing.js';
import '../styles/cart.css';

/**
 * /account/subscription — read-only view of the user's current plan.
 *
 *   - Membership tier (individual or business depending on account_type)
 *   - Active role packs (recruiter / vendor / supplier) with tier
 *   - Sponsorship tier, if any
 *
 * "Change plan" links over to /pricing where the user can drop new
 * items in the cart and confirm. Cancellation is intentionally NOT
 * exposed here — it routes through support so we can ask the obvious
 * questions before tearing down a paid plan.
 */
export default function AccountSubscription() {
  const { user, profile, isAuthed } = useAuth();
  const { count, clear } = useCart();
  const [plan, setPlan] = useState({ packs: {}, profile: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const data = await loadPlan(supabase, user.id);
      if (!cancelled) {
        setPlan(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!isAuthed) {
    return (
      <div className="acct-wrap">
        <div className="cart-empty">
          <h1>Sign in to view your subscription</h1>
          <p>You need to be signed in to manage your plan.</p>
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

  const accountType = plan.profile?.account_type || profile?.account_type || 'individual';
  const membershipId = plan.profile?.membership_tier || profile?.membership_tier || 'free';
  const sponsorId    = plan.profile?.sponsor_tier    || profile?.sponsor_tier    || null;

  const membership = accountType === 'business'
    ? findBusinessTier(membershipId)
    : findIndividualTier(membershipId);

  const sponsor = sponsorId ? findSponsorTier(sponsorId) : null;

  const packEntries = Object.entries(plan.packs || {})
    .map(([packId, tierId]) => {
      const pack = findPack(packId);
      const tier = findPackTier(packId, tierId);
      if (!pack) return null;
      return { pack, tier };
    })
    .filter(Boolean);

  // Rough current-MRR estimate for the user — handy at-a-glance number.
  // Excludes "Contact sales" tiers (priceMonthly === null).
  const currentMrr =
    (membership?.priceMonthly || 0) +
    (sponsor?.priceMonthly || 0) +
    packEntries.reduce((s, p) => s + (p.tier?.priceMonthly || 0), 0);

  return (
    <div className="acct-wrap">
      <div className="acct-head">
        <div className="acct-eyebrow">Account</div>
        <h1 className="acct-title">My subscription</h1>
      </div>

      {count > 0 && (
        <div className="acct-section" style={{ background: '#FDF6E8', borderColor: '#E5C77A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                You have {count} item{count === 1 ? '' : 's'} in your cart
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>
                Finish checkout to apply changes to your plan.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="cart-btn ghost" onClick={clear}>Discard</button>
              <Link to="/cart" className="cart-btn primary">Review cart →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Membership */}
      <section className="acct-section">
        <div className="acct-section-title">
          <span>Membership</span>
          <Link to="/pricing" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
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
          <div className="acct-row-price">{formatPrice(membership?.priceMonthly || 0)}{(membership?.priceMonthly || 0) > 0 && '/mo'}</div>
        </div>
      </section>

      {/* Role packs (business only) */}
      {accountType === 'business' && (
        <section className="acct-section">
          <div className="acct-section-title">
            <span>Role packs</span>
            <Link to="/pricing?persona=business" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
              Add a pack
            </Link>
          </div>
          {packEntries.length === 0 ? (
            <div className="acct-empty">
              No role packs active. Recruiter / vendor / supplier packs unlock additional placement and tools.
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
                <div className="acct-row-price">{formatPrice(tier?.priceMonthly || 0)}{(tier?.priceMonthly || 0) > 0 && '/mo'}</div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Sponsor tier */}
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
          <div className="acct-empty">Not currently sponsoring. Sponsor tiers offer site-wide placement and brand visibility.</div>
        )}
      </section>

      {/* Summary */}
      <section className="acct-section" style={{ background: '#FDFBF5' }}>
        <div className="acct-section-title">Your monthly total</div>
        <div className="acct-row">
          <div>
            <div className="acct-row-name">Recurring (per month)</div>
            <div className="acct-row-sub">Excludes one-off promotions and "Contact sales" tiers.</div>
          </div>
          <div className="acct-row-price" style={{ fontSize: 22 }}>${currentMrr.toLocaleString()}</div>
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
        Need to cancel or downgrade? <a href="mailto:support@grainhub.io" style={{ color: 'var(--wood-warm)' }}>Email us</a> and we'll handle it within one business day.
      </div>
    </div>
  );
}
