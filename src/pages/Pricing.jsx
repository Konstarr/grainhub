import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/pricing.css';
import {
  INDIVIDUAL_TIERS,
  BUSINESS_TIERS,
  ROLE_PACKS,
  SPONSOR_TIERS,
  A_LA_CARTE,
  formatPrice,
} from '../lib/pricing.js';
import { usePlanChanges } from '../context/PlanContext.jsx';

/**
 * /pricing — public pricing page.
 *
 * Design principle: each of the four business "axes" gets its OWN
 * visual treatment so the page doesn't feel like wall-to-wall cards.
 *
 *   Memberships   → a tight compact 4-up table row ("baseline")
 *   Role packs    → big hero cards with icons + pill tier selector
 *   À la carte    → grid of icon tiles with one price each
 *   Sponsorships  → metallic medallion-style cards (silver/gold/platinum)
 *
 * CTAs stage subscription changes (not cart items). The user
 * reviews them at /account/subscription and applies in one click.
 * When Stripe is wired in, Apply will create a Checkout Session
 * from the same staged-changes payload — no UX shifts needed.
 */
export default function Pricing() {
  const [searchParams] = useSearchParams();
  const initial = searchParams.get('persona') === 'business' ? 'business' : 'individual';
  const [persona, setPersona] = useState(initial);
  const plan = usePlanChanges();

  return (
    <>
      <div className="page-header gh-hero">
        <div className="header-inner">
          <div className="header-top">
            <div className="header-left">
              <div className="page-eyebrow">Pricing</div>
              <h1 className="page-title">Pick the plan that fits your shop.</h1>
              <p className="page-subtitle">
                Flat monthly pricing. No per-listing fees, no per-application charges.
              </p>
            </div>
            {plan.count > 0 && (
              <div className="header-right">
                <Link to="/account/subscription" className="pricing-cart-btn">
                  {plan.count} pending change{plan.count === 1 ? '' : 's'} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pricing-wrap">
        <div className="persona-toggle">
          <button type="button" className={'persona-btn ' + (persona === 'individual' ? 'active' : '')} onClick={() => setPersona('individual')}>
            Individual
          </button>
          <button type="button" className={'persona-btn ' + (persona === 'business' ? 'active' : '')} onClick={() => setPersona('business')}>
            Business
          </button>
          <span className="persona-thumb" style={{ transform: persona === 'individual' ? 'translateX(0%)' : 'translateX(100%)' }} aria-hidden="true" />
        </div>

        {persona === 'individual' ? <IndividualSection /> : <BusinessSection />}

        <div className="pricing-faq">
          <h2>Common questions</h2>
          <FaqItem q="Can I mix and match?">
            Yes. Businesses can combine a membership tier, any role packs they need,
            sponsorships, and one-off à la carte promotions — billed on a single invoice.
            Individuals just pick one membership tier.
          </FaqItem>
          <FaqItem q="What happens when I hit a cap?">
            Nothing hard-blocks at the cap. We give you a 2-week grace with a banner
            suggesting an upgrade. Only at 2× the cap does posting actually lock.
          </FaqItem>
          <FaqItem q="Annual billing?">
            Annual plans get 2 months free (10× monthly). Available at checkout.
          </FaqItem>
          <FaqItem q="Cancel anytime?">
            Yes. Downgrade or cancel in one click from your account; changes take
            effect at the end of your billing period.
          </FaqItem>
          <FaqItem q="Do you take a cut of marketplace sales?">
            No. Transactions happen directly between buyer and seller. We only charge
            for listing visibility.
          </FaqItem>
        </div>
      </div>
    </>
  );
}

/* ══════════════════ Individual section ══════════════════ */
function IndividualSection() {
  return (
    <section className="pricing-section">
      <div className="section-heading">
        <h2>Individual memberships</h2>
        <p>For cabinetmakers, installers, designers, and anyone working in the trade.</p>
      </div>
      <div className="pricing-grid">
        {INDIVIDUAL_TIERS.map((t) => (
          <TierCard key={t.id} tier={t} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════ Business section ═════════════════════ */
function BusinessSection() {
  return (
    <>
      {/* ── MEMBERSHIPS — compact compare strip ── */}
      <section className="pricing-section">
        <div className="section-heading">
          <div className="axis-eyebrow">Axis 1 · Baseline</div>
          <h2>Business memberships</h2>
          <p>Start here. Company profile, team seats, and analytics.</p>
        </div>
        <MembershipStrip tiers={BUSINESS_TIERS} />
      </section>

      {/* ── ROLE PACKS — big hero cards with icons ── */}
      <section className="pricing-section">
        <div className="section-heading">
          <div className="axis-eyebrow">Axis 2 · Scale</div>
          <h2>Role packs</h2>
          <p>
            Stack these onto any membership. Pick the volume that matches how you
            actually use the platform.
          </p>
        </div>
        <div className="pack-grid">
          {ROLE_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} />
          ))}
        </div>
      </section>

      {/* ── SPONSORSHIPS — metallic medallion cards ── */}
      <section className="pricing-section">
        <div className="section-heading">
          <div className="axis-eyebrow">Axis 3 · Brand</div>
          <h2>Sponsorships</h2>
          <p>
            Pure brand exposure. Independent from memberships and packs — stack with
            any combination or buy alone.
          </p>
        </div>
        <div className="sponsor-grid">
          {SPONSOR_TIERS.map((t) => (
            <SponsorMedallion key={t.id} tier={t} />
          ))}
        </div>
      </section>

      {/* ── À LA CARTE — one-off icon tiles ── */}
      <section className="pricing-section">
        <div className="section-heading">
          <div className="axis-eyebrow">One-offs</div>
          <h2>À la carte</h2>
          <p>
            Not ready for a monthly commitment? Buy exactly what you need for a launch,
            an announcement, or a seasonal push.
          </p>
        </div>
        <div className="alacarte-grid">
          {A_LA_CARTE.map((item) => (
            <ALaCarteTile key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ══════════════════ Sub-components ══════════════════════ */

/**
 * Reusable CTA pill used across every card on the pricing page.
 * Flips between three states: ready-to-stage, staged, and contact-sales.
 * Routing target on review is always /account/subscription (the
 * single management hub) — never a cart.
 */
function PlanCta({ staged, onStage, contactSales = false, label = 'Add to plan' }) {
  const navigate = useNavigate();
  if (contactSales) {
    return <a href="mailto:sales@grainhub.io" className="tier-cta">Contact sales</a>;
  }
  if (staged) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button type="button" className="tier-cta tier-cta-added" disabled>
          Selected ✓
        </button>
        <button
          type="button"
          className="tier-cta-secondary"
          onClick={() => navigate('/account/subscription')}
        >
          Review in subscription →
        </button>
      </div>
    );
  }
  return (
    <button type="button" className="tier-cta" onClick={onStage}>
      {label}
    </button>
  );
}

/** Generic tier card — used by individuals only now. */
function TierCard({ tier }) {
  const plan = usePlanChanges();
  const staged = plan.has((i) => i.type === 'membership' && i.id === tier.id);

  const handleStage = () => {
    plan.addChange({ type: 'membership', id: tier.id });
  };

  return (
    <div className={'tier-card ' + (tier.highlight ? 'tier-highlight' : '')}>
      {tier.highlight && <div className="tier-ribbon">Most popular</div>}
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
        staged={staged}
        onStage={handleStage}
        label={tier.priceMonthly === 0 ? 'Switch to Free' : 'Switch to ' + tier.name}
      />
    </div>
  );
}

/** Compact horizontal strip for the four business-membership levels.
 *  Much tighter than big cards — reads as a choose-your-baseline row. */
function MembershipStrip({ tiers }) {
  const plan = usePlanChanges();
  const navigate = useNavigate();

  return (
    <div className="mb-strip">
      {tiers.map((t, idx) => {
        const staged = plan.has((i) => i.type === 'membership' && i.id === t.id);
        const handleStage = () => plan.addChange({ type: 'membership', id: t.id });
        return (
          <div
            key={t.id}
            className={'mb-strip-col ' + (t.highlight ? 'mb-highlight' : '')}
          >
            {t.highlight && <span className="mb-badge">Most popular</span>}
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
            {t.priceMonthly === null ? (
              <a href="mailto:sales@grainhub.io" className="mb-cta">Contact sales</a>
            ) : staged ? (
              <button
                type="button"
                className="mb-cta mb-cta-added"
                onClick={() => navigate('/account/subscription')}
              >
                Selected ✓
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

/** Big hero-style pack card with icon + tier pill selector. */
const PACK_VISUALS = {
  recruiter: { icon: '👥', gradient: 'linear-gradient(135deg, #2D5016 0%, #5A8F3A 100%)' },
  vendor:    { icon: '🛒', gradient: 'linear-gradient(135deg, #8B4316 0%, #C07A3C 100%)' },
  supplier:  { icon: '🏭', gradient: 'linear-gradient(135deg, #1C4A6E 0%, #3B83B8 100%)' },
};

function PackCard({ pack }) {
  const plan = usePlanChanges();
  const [tierId, setTierId] = useState(pack.tiers.find((t) => t.highlight)?.id || pack.tiers[0].id);
  const active = pack.tiers.find((t) => t.id === tierId) || pack.tiers[0];
  const visual = PACK_VISUALS[pack.id] || { icon: '✨', gradient: 'linear-gradient(135deg, #3A1A08, #6B3820)' };

  const capLabel =
    active.cap === Infinity
      ? 'Unlimited ' + pack.unitPlural
      : active.cap + ' ' + (active.cap === 1 ? pack.unit : pack.unitPlural);

  const staged = plan.has(
    (i) => i.type === 'pack' && i.id === pack.id && i.tierId === tierId,
  );
  const otherTierStaged = plan.has(
    (i) => i.type === 'pack' && i.id === pack.id && i.tierId !== tierId,
  );

  const handleStage = () => {
    plan.addChange({ type: 'pack', id: pack.id, tierId });
  };

  return (
    <div className="pack-hero">
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
              className={'pack-tier-pill ' + (t.id === tierId ? 'active' : '')}
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
          staged={staged}
          onStage={handleStage}
          contactSales={active.priceMonthly === null}
          label={(otherTierStaged ? 'Switch to ' : 'Add ') + active.name + ' tier'}
        />
      </div>
    </div>
  );
}

/** Metallic medallion card for Silver / Gold / Platinum. */
const SPONSOR_VISUALS = {
  silver:   { gradient: 'linear-gradient(135deg, #9CA0A6 0%, #D4D7DC 50%, #9CA0A6 100%)', ring: '#B8BCC2' },
  gold:     { gradient: 'linear-gradient(135deg, #C49540 0%, #F3D67E 50%, #C49540 100%)', ring: '#D4A848' },
  platinum: { gradient: 'linear-gradient(135deg, #4A4E57 0%, #95999F 45%, #E0E2E5 65%, #95999F 100%)', ring: '#6B7078' },
};

function SponsorMedallion({ tier }) {
  const plan = usePlanChanges();
  const v = SPONSOR_VISUALS[tier.id] || SPONSOR_VISUALS.silver;
  const staged = plan.has((i) => i.type === 'sponsor' && i.id === tier.id);
  const otherStaged = plan.has((i) => i.type === 'sponsor' && i.id !== tier.id);
  const handleStage = () => plan.addChange({ type: 'sponsor', id: tier.id });
  const label = tier.name.replace(' Sponsor', '');

  return (
    <div className={'sponsor-card-new ' + (tier.highlight ? 'sponsor-highlight' : '')}>
      <div className="sponsor-medal" style={{ background: v.gradient, boxShadow: `0 4px 14px ${v.ring}55, inset 0 1px 0 rgba(255,255,255,0.4)` }}>
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
          staged={staged}
          onStage={handleStage}
          label={(otherStaged ? 'Switch to ' : 'Become ') + label}
        />
      </div>
    </div>
  );
}

/** Icon tile for à la carte items. */
function ALaCarteTile({ item }) {
  const plan = usePlanChanges();
  const navigate = useNavigate();
  const staged = plan.has((i) => i.type === 'alacarte' && i.id === item.id);
  const handleStage = () => plan.addChange({ type: 'alacarte', id: item.id });

  return (
    <div className="alacarte-tile">
      <div className="alacarte-icon">{item.icon}</div>
      <div className="alacarte-name">{item.name}</div>
      <div className="alacarte-price">
        ${item.price.toLocaleString()}
        <span className="alacarte-unit"> · {item.unit}</span>
      </div>
      <div className="alacarte-tagline">{item.tagline}</div>
      <div className="alacarte-desc">{item.description}</div>
      {staged ? (
        <button
          type="button"
          className="alacarte-cta"
          onClick={() => navigate('/account/subscription')}
        >
          Selected ✓ · Review →
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
