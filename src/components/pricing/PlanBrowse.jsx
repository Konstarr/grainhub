import { useState } from 'react';
import {
  INDIVIDUAL_TIERS,
  BUSINESS_TIERS,
  ROLE_PACKS,
  SPONSOR_TIERS,
  A_LA_CARTE,
  formatPrice,
} from '../../lib/pricing.js';
import { usePlanChanges } from '../../context/PlanContext.jsx';
import '../../styles/pricing.css';

/**
 * PlanBrowse — the "browse and pick" portion of the subscription hub.
 *
 * Account-type gating (signed-in users):
 *   • Membership tiers — must match account_type
 *   • Role packs        — open to both
 *   • Sponsorships      — business-only
 *   • À la carte        — business-only
 *   Anonymous visitors aren't gated; the signup flow reconciles.
 *
 * Selection rules (matched in PlanContext.addChange):
 *   • One membership at a time
 *   • Many role packs allowed; one tier per pack-id
 *   • One sponsor tier at a time
 *   • Many à la carte items allowed (deduped by id)
 *
 * Three CTA states (priority order):
 *   1. CURRENT — matches what's on the user's profile right now.
 *      "Your current plan" disabled, with a small badge in the corner.
 *   2. LOCKED  — the user's account_type doesn't allow this option.
 *      Card visible but muted; CTA disabled with explanation.
 *   3. STAGED  — staged in pendingChanges. Clickable to unstage,
 *      hover swaps label to red "Remove ×".
 */
export default function PlanBrowse({
  persona = 'individual',
  onPersonaChange,
  accountType,             // 'individual' | 'business' | undefined (anon)
  currentMembershipId,     // user's current membership_tier
  currentPacks = {},       // { recruiter: 'growth', ... }
  currentSponsorId,        // user's current sponsor_tier
}) {
  const businessMembershipsLocked   = accountType === 'individual';
  const individualMembershipsLocked = accountType === 'business';
  // Sponsorships and à la carte require a business account
  const businessOnlyLocked          = accountType === 'individual';

  return (
    <>
      <div className="persona-toggle">
        <button
          type="button"
          className={'persona-btn ' + (persona === 'individual' ? 'active' : '')}
          onClick={() => onPersonaChange?.('individual')}
        >
          Individual
        </button>
        <button
          type="button"
          className={'persona-btn ' + (persona === 'business' ? 'active' : '')}
          onClick={() => onPersonaChange?.('business')}
        >
          Business
        </button>
        <span
          className="persona-thumb"
          style={{ transform: persona === 'individual' ? 'translateX(0%)' : 'translateX(100%)' }}
          aria-hidden="true"
        />
      </div>

      {persona === 'individual' ? (
        <IndividualMemberships
          locked={individualMembershipsLocked}
          currentMembershipId={currentMembershipId}
          accountType={accountType}
        />
      ) : (
        <BusinessMemberships
          locked={businessMembershipsLocked}
          currentMembershipId={currentMembershipId}
          accountType={accountType}
        />
      )}

      {/* Role packs — open to all */}
      <RolePacksSection currentPacks={currentPacks} />

      {/* Sponsorships — business only */}
      <SponsorshipsSection
        locked={businessOnlyLocked}
        currentSponsorId={currentSponsorId}
      />

      {/* À la carte — business only */}
      <ALaCarteSection locked={businessOnlyLocked} />

      <div className="pricing-faq">
        <h2>Common questions</h2>
        <FaqItem q="Can I mix and match?">
          Yes. Pick one membership, stack as many role packs as you need, choose
          a sponsorship tier if you want extra brand visibility, and add à la
          carte one-offs whenever you have something to promote.
        </FaqItem>
        <FaqItem q="Can I switch between an individual and business account?">
          Yes — email <a href="mailto:support@millwork.io.io">support@millwork.io.io</a>{' '}
          and we'll convert your account within one business day.
        </FaqItem>
        <FaqItem q="What happens when I hit a cap?">
          Nothing hard-blocks at the cap. We give you a 2-week grace with a banner
          suggesting an upgrade. Only at 2× the cap does posting actually lock.
        </FaqItem>
        <FaqItem q="Annual billing?">
          Annual plans get 2 months free (10× monthly). Available at checkout.
        </FaqItem>
        <FaqItem q="Cancel anytime?">
          Yes. Downgrade or cancel in one click; changes take effect at the end
          of your billing period.
        </FaqItem>
      </div>
    </>
  );
}

/* ── Locked-section banner ─────────────────────────────── */
function LockedBanner({ requires, what }) {
  return (
    <div className="locked-banner">
      <span className="locked-banner-icon" aria-hidden="true">🔒</span>
      <div>
        <strong>
          {what || 'These plans'} require {requires === 'business' ? 'a business' : 'an individual'} account.
        </strong>{' '}
        You can see what's available, but you'll need to switch your account
        type to subscribe.{' '}
        <a href="mailto:support@millwork.io.io?subject=Switch%20account%20type">
          Email us to switch →
        </a>
      </div>
    </div>
  );
}

/* ── Membership sections ──────────────────────────────── */
function IndividualMemberships({ locked, currentMembershipId, accountType }) {
  return (
    <section className="pricing-section">
      <div className="section-heading">
        <h2>Individual memberships</h2>
        <p>For cabinetmakers, installers, designers, and anyone working in the trade.</p>
      </div>
      {locked && <LockedBanner requires="individual" />}
      <div className="pricing-grid">
        {INDIVIDUAL_TIERS.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            locked={locked}
            isCurrent={accountType === 'individual' && currentMembershipId === t.id}
          />
        ))}
      </div>
    </section>
  );
}

function BusinessMemberships({ locked, currentMembershipId, accountType }) {
  return (
    <section className="pricing-section">
      <div className="section-heading">
        <div className="axis-eyebrow">Axis 1 · Baseline</div>
        <h2>Business memberships</h2>
        <p>Start here. Company profile, team seats, and analytics.</p>
      </div>
      {locked && <LockedBanner requires="business" />}
      <MembershipStrip
        tiers={BUSINESS_TIERS}
        locked={locked}
        currentMembershipId={accountType === 'business' ? currentMembershipId : null}
      />
    </section>
  );
}

/* ── Role packs (shared) ──────────────────────────────── */
function RolePacksSection({ currentPacks }) {
  return (
    <section className="pricing-section">
      <div className="section-heading">
        <div className="axis-eyebrow">Add-on · Scale</div>
        <h2>Role packs</h2>
        <p>
          Stack any number of these onto your membership. Available to both
          individual and business accounts.
        </p>
      </div>
      <div className="pack-grid">
        {ROLE_PACKS.map((p) => (
          <PackCard key={p.id} pack={p} currentTierId={currentPacks?.[p.id]} />
        ))}
      </div>
    </section>
  );
}

/* ── Sponsorships (business-only) ─────────────────────── */
function SponsorshipsSection({ locked, currentSponsorId }) {
  return (
    <section className="pricing-section">
      <div className="section-heading">
        <div className="axis-eyebrow">Add-on · Brand</div>
        <h2>Sponsorships</h2>
        <p>
          Pure brand exposure. Pick one tier — stack with any membership and
          any combination of packs.
        </p>
      </div>
      {locked && <LockedBanner requires="business" what="Sponsorships" />}
      <div className="sponsor-grid">
        {SPONSOR_TIERS.map((t) => (
          <SponsorMedallion
            key={t.id}
            tier={t}
            locked={locked}
            isCurrent={!locked && currentSponsorId === t.id}
          />
        ))}
      </div>
    </section>
  );
}

/* ── À la carte (business-only) ──────────────────────── */
function ALaCarteSection({ locked }) {
  return (
    <section className="pricing-section">
      <div className="section-heading">
        <div className="axis-eyebrow">One-offs</div>
        <h2>À la carte</h2>
        <p>
          Add as many one-time promotions as you'd like — perfect for product
          launches, announcements, or seasonal pushes.
        </p>
      </div>
      {locked && <LockedBanner requires="business" what="À la carte promotions" />}
      <div className="alacarte-grid">
        {A_LA_CARTE.map((item) => (
          <ALaCarteTile key={item.id} item={item} locked={locked} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════ Sub-components ══════════════════════ */

/**
 * Reusable CTA. Priority of states: current > locked > staged > default.
 */
function PlanCta({
  isCurrent,
  locked = false,
  lockedLabel = 'Not available on your account',
  staged,
  onStage,
  onUnstage,
  contactSales = false,
  label = 'Add to plan',
}) {
  if (isCurrent) {
    return (
      <button type="button" className="tier-cta tier-cta-current" disabled>
        Your current plan
      </button>
    );
  }
  if (locked) {
    return (
      <button type="button" className="tier-cta tier-cta-locked" disabled>
        {lockedLabel}
      </button>
    );
  }
  if (contactSales) {
    return <a href="mailto:sales@millwork.io.io" className="tier-cta">Contact sales</a>;
  }
  if (staged) {
    return (
      <button
        type="button"
        className="tier-cta tier-cta-added"
        onClick={onUnstage}
        title="Click to remove from pending changes"
      >
        <span className="cta-default">Selected ✓</span>
        <span className="cta-hover">Remove ×</span>
      </button>
    );
  }
  return (
    <button type="button" className="tier-cta" onClick={onStage}>
      {label}
    </button>
  );
}

/** Generic tier card — used by individual memberships. */
function TierCard({ tier, locked = false, isCurrent = false }) {
  const plan = usePlanChanges();
  const staged = !locked && !isCurrent && plan.has((i) => i.type === 'membership' && i.id === tier.id);
  const handleStage   = () => plan.addChange({ type: 'membership', id: tier.id });
  const handleUnstage = () => plan.removeChange((i) => i.type === 'membership');

  const cls = ['tier-card'];
  if (tier.highlight) cls.push('tier-highlight');
  if (isCurrent)      cls.push('tier-current');
  if (staged)         cls.push('tier-selected');
  if (locked)         cls.push('tier-locked');

  return (
    <div className={cls.join(' ')}>
      {isCurrent && <div className="card-current-pill">Current</div>}
      {tier.highlight && !isCurrent && <div className="tier-ribbon">Most popular</div>}
      <div className="tier-name">{tier.name}</div>
      <div className="tier-price">
        {formatPrice(tier.priceMonthly)}
        {tier.priceMonthly > 0 && <span className="tier-price-sub">/mo</span>}
      </div>
      {tier.tagline && <div className="tier-tagline">{tier.tagline}</div>}
      <ul className="tier-features">
        {tier.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <PlanCta
        isCurrent={isCurrent}
        locked={locked}
        lockedLabel="Individual account required"
        staged={staged}
        onStage={handleStage}
        onUnstage={handleUnstage}
        label={tier.priceMonthly === 0 ? 'Switch to Free' : 'Switch to ' + tier.name}
      />
    </div>
  );
}

/** Compact horizontal strip for the four business-membership levels. */
function MembershipStrip({ tiers, locked = false, currentMembershipId }) {
  const plan = usePlanChanges();

  return (
    <div className="mb-strip">
      {tiers.map((t, idx) => {
        const isCurrent = currentMembershipId === t.id;
        const staged = !locked && !isCurrent && plan.has((i) => i.type === 'membership' && i.id === t.id);
        const handleStage   = () => plan.addChange({ type: 'membership', id: t.id });
        const handleUnstage = () => plan.removeChange((i) => i.type === 'membership');

        const cls = ['mb-strip-col'];
        if (t.highlight) cls.push('mb-highlight');
        if (isCurrent)   cls.push('mb-current');
        if (staged)      cls.push('mb-selected');
        if (locked)      cls.push('mb-locked');

        return (
          <div key={t.id} className={cls.join(' ')}>
            {isCurrent && <span className="card-current-pill">Current</span>}
            {t.highlight && !isCurrent && <span className="mb-badge">Most popular</span>}
            <div className="mb-step">Step {idx + 1}</div>
            <div className="mb-name">{t.name}</div>
            <div className="mb-price">
              {formatPrice(t.priceMonthly)}
              {t.priceMonthly > 0 && <span className="tier-price-sub">/mo</span>}
            </div>
            <div className="mb-tagline">{t.tagline}</div>
            <ul className="mb-feats">
              {t.features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
              {t.features.length > 4 && (
                <li className="mb-more">+ {t.features.length - 4} more</li>
              )}
            </ul>
            {isCurrent ? (
              <button type="button" className="mb-cta mb-cta-current" disabled>
                Your current plan
              </button>
            ) : locked ? (
              <button type="button" className="mb-cta mb-cta-locked" disabled>
                Business account required
              </button>
            ) : t.priceMonthly === null ? (
              <a href="mailto:sales@millwork.io.io" className="mb-cta">Contact sales</a>
            ) : staged ? (
              <button
                type="button"
                className="mb-cta mb-cta-added"
                onClick={handleUnstage}
                title="Click to remove from pending changes"
              >
                <span className="cta-default">Selected ✓</span>
                <span className="cta-hover">Remove ×</span>
              </button>
            ) : (
              <button type="button" className="mb-cta" onClick={handleStage}>
                {t.priceMonthly === 0 ? 'Switch to Free' : 'Switch to ' + t.name}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const PACK_VISUALS = {
  recruiter: { icon: '👥', gradient: 'linear-gradient(135deg, #1B4332 0%, #5A8F3A 100%)' },
  vendor:    { icon: '🛒', gradient: 'linear-gradient(135deg, #1F4534 0%, #B5A04A 100%)' },
  supplier:  { icon: '🏭', gradient: 'linear-gradient(135deg, #1C4A6E 0%, #3B83B8 100%)' },
};

function PackCard({ pack, currentTierId }) {
  const plan = usePlanChanges();
  const [tierId, setTierId] = useState(
    currentTierId || pack.tiers.find((t) => t.highlight)?.id || pack.tiers[0].id,
  );
  const active = pack.tiers.find((t) => t.id === tierId) || pack.tiers[0];
  const visual = PACK_VISUALS[pack.id] || { icon: '✨', gradient: 'linear-gradient(135deg, #3A1A08, #6B3820)' };

  const capLabel =
    active.cap === Infinity
      ? 'Unlimited ' + pack.unitPlural
      : active.cap + ' ' + (active.cap === 1 ? pack.unit : pack.unitPlural);

  const isCurrentTier = currentTierId === tierId;
  const stagedAtThisTier  = !isCurrentTier && plan.has((i) => i.type === 'pack' && i.id === pack.id && i.tierId === tierId);
  const stagedAtOtherTier = plan.has((i) => i.type === 'pack' && i.id === pack.id && i.tierId !== tierId);
  const cardHasState      = !!currentTierId || stagedAtThisTier || stagedAtOtherTier;

  const handleStage   = () => plan.addChange({ type: 'pack', id: pack.id, tierId });
  const handleUnstage = () => plan.removeChange((i) => i.type === 'pack' && i.id === pack.id);

  const cls = ['pack-hero'];
  if (cardHasState && (stagedAtThisTier || stagedAtOtherTier)) cls.push('pack-selected');

  return (
    <div className={cls.join(' ')}>
      {currentTierId && <div className="card-current-pill card-current-pill-overlay">Current</div>}
      <div className="pack-hero-head" style={{ background: visual.gradient }}>
        <div className="pack-hero-icon">{visual.icon}</div>
        <div>
          <div className="pack-hero-name">{pack.name}</div>
          <div className="pack-hero-for">{pack.forPersona}</div>
        </div>
      </div>

      <div className="pack-hero-body">
        <div className="pack-tier-pills" role="tablist" aria-label="Tier">
          {pack.tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tierId}
              className={'pack-tier-pill ' + (t.id === tierId ? 'active' : '') + (t.id === currentTierId ? ' pack-tier-pill-current' : '')}
              onClick={() => setTierId(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="pack-hero-price">
          {formatPrice(active.priceMonthly)}
          {active.priceMonthly > 0 && <span className="tier-price-sub">/mo</span>}
        </div>
        <div className="pack-hero-cap">{capLabel}</div>

        <ul className="tier-features">
          {pack.sharedFeatures.map((f, i) => <li key={'s' + i}>{f}</li>)}
          {(active.extras || []).map((f, i) => <li key={'e' + i}>{f}</li>)}
        </ul>

        <PlanCta
          isCurrent={isCurrentTier}
          staged={stagedAtThisTier}
          onStage={handleStage}
          onUnstage={handleUnstage}
          contactSales={active.priceMonthly === null}
          label={(stagedAtOtherTier ? 'Switch to ' : 'Add ') + active.name + ' tier'}
        />
      </div>
    </div>
  );
}

const SPONSOR_VISUALS = {
  silver:   { gradient: 'linear-gradient(135deg, #9CA0A6 0%, #D4D7DC 50%, #9CA0A6 100%)', ring: '#B8BCC2' },
  gold:     { gradient: 'linear-gradient(135deg, #C49540 0%, #F3D67E 50%, #C49540 100%)', ring: '#D4A848' },
  platinum: { gradient: 'linear-gradient(135deg, #4A4E57 0%, #95999F 45%, #E0E2E5 65%, #95999F 100%)', ring: '#6B7078' },
};

function SponsorMedallion({ tier, locked = false, isCurrent = false }) {
  const plan = usePlanChanges();
  const v = SPONSOR_VISUALS[tier.id] || SPONSOR_VISUALS.silver;
  const stagedAtThisTier  = !locked && !isCurrent && plan.has((i) => i.type === 'sponsor' && i.id === tier.id);
  const stagedAtOtherTier = !locked && plan.has((i) => i.type === 'sponsor' && i.id !== tier.id);
  const handleStage   = () => plan.addChange({ type: 'sponsor', id: tier.id });
  const handleUnstage = () => plan.removeChange((i) => i.type === 'sponsor');
  const label = tier.name.replace(' Sponsor', '');

  const cls = ['sponsor-card-new'];
  if (tier.highlight)      cls.push('sponsor-highlight');
  if (isCurrent)           cls.push('sponsor-current');
  if (stagedAtThisTier)    cls.push('sponsor-selected');
  if (locked)              cls.push('sponsor-locked');

  return (
    <div className={cls.join(' ')}>
      {isCurrent && <div className="card-current-pill">Current</div>}
      <div
        className="sponsor-medal"
        style={{
          background: v.gradient,
          boxShadow: '0 4px 14px ' + v.ring + '55, inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        <span className="sponsor-medal-label">{label}</span>
      </div>
      <div className="sponsor-card-body">
        <div className="sponsor-price">
          {formatPrice(tier.priceMonthly)}
          {tier.priceMonthly > 0 && <span className="tier-price-sub">/mo</span>}
        </div>
        <div className="sponsor-tagline">{tier.tagline}</div>
        <ul className="tier-features">
          {tier.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
        <PlanCta
          isCurrent={isCurrent}
          locked={locked}
          lockedLabel="Business account required"
          staged={stagedAtThisTier}
          onStage={handleStage}
          onUnstage={handleUnstage}
          label={(stagedAtOtherTier ? 'Switch to ' : 'Become ') + label}
        />
      </div>
    </div>
  );
}

function ALaCarteTile({ item, locked = false }) {
  const plan = usePlanChanges();
  const staged = !locked && plan.has((i) => i.type === 'alacarte' && i.id === item.id);
  const handleStage   = () => plan.addChange({ type: 'alacarte', id: item.id });
  const handleUnstage = () => plan.removeChange((i) => i.type === 'alacarte' && i.id === item.id);

  const cls = ['alacarte-tile'];
  if (staged)  cls.push('alacarte-selected');
  if (locked)  cls.push('alacarte-locked');

  return (
    <div className={cls.join(' ')}>
      <div className="alacarte-icon">{item.icon}</div>
      <div className="alacarte-name">{item.name}</div>
      <div className="alacarte-price">
        ${item.price.toLocaleString()}
        <span className="alacarte-unit"> · {item.unit}</span>
      </div>
      <div className="alacarte-tagline">{item.tagline}</div>
      <div className="alacarte-desc">{item.description}</div>
      {locked ? (
        <button type="button" className="alacarte-cta alacarte-cta-locked" disabled>
          Business account required
        </button>
      ) : staged ? (
        <button
          type="button"
          className="alacarte-cta alacarte-cta-added"
          onClick={handleUnstage}
          title="Click to remove from pending changes"
        >
          <span className="cta-default">Selected ✓</span>
          <span className="cta-hover">Remove ×</span>
        </button>
      ) : (
        <button type="button" className="alacarte-cta" onClick={handleStage}>
          Add to plan →
        </button>
      )}
    </div>
  );
}

function FaqItem({ q, children }) {
  return (
    <div className="faq-item">
      <div className="faq-q">{q}</div>
      <div className="faq-a">{children}</div>
    </div>
  );
}
