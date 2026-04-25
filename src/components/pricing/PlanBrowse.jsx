import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
 * PlanBrowse — the "shop" portion of the subscription hub. Renders
 * the four pricing axes (memberships, role packs, sponsorships, à la
 * carte) with CTAs that stage changes into the user's pending-changes
 * list. Used inside /account/subscription so there's no separate
 * pricing page anymore.
 */
export default function PlanBrowse({ persona = 'individual', onPersonaChange }) {
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
          Yes. Downgrade or cancel in one click; changes take effect at the
          end of your billing period.
        </FaqItem>
        <FaqItem q="Do you take a cut of marketplace sales?">
          No. Transactions happen directly between buyer and seller. We only charge
          for listing visibility.
        </FaqItem>
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
      <section className="pricing-section">
        <div className="section-heading">
          <div className="axis-eyebrow">Axis 1 · Baseline</div>
          <h2>Business memberships</h2>
          <p>Start here. Company profile, team seats, and analytics.</p>
        </div>
        <MembershipStrip tiers={BUSINESS_TIERS} />
      </section>

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

      <section className="pricing-section">
        <div className="section-heading">
          <div className="axis-eyebrow">Axis 3 · Brand</div>
          <h2>Sponsorships</h2>
          <p>
            Pure brand exposure. Independent from memberships and packs — stack
            with any combination or buy alone.
          </p>
        </div>
        <div className="sponsor-grid">
          {SPONSOR_TIERS.map((t) => (
            <SponsorMedallion key={t.id} tier={t} />
          ))}
        </div>
      </section>

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
 * Reusable CTA pill across every card. Three states:
 * ready-to-stage, staged, contact-sales.
 */
function PlanCta({ staged, onStage, contactSales = false, label = 'Add to plan' }) {
  if (contactSales) {
    return <a href="mailto:sales@grainhub.io" className="tier-cta">Contact sales</a>;
  }
  if (staged) {
    return (
      <button type="button" className="tier-cta tier-cta-added" disabled>
        Selected ✓
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
function TierCard({ tier }) {
  const plan = usePlanChanges();
  const staged = plan.has((i) => i.type === 'membership' && i.id === tier.id);
  const handleStage = () => plan.addChange({ type: 'membership', id: tier.id });

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

/** Compact horizontal strip for the four business-membership levels. */
function MembershipStrip({ tiers }) {
  const plan = usePlanChanges();

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
              <button type="button" className="mb-cta mb-cta-added" disabled>
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

  const handleStage = () => plan.addChange({ type: 'pack', id: pack.id, tierId });

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
          staged={staged}
          onStage={handleStage}
          label={(otherStaged ? 'Switch to ' : 'Become ') + label}
        />
      </div>
    </div>
  );
}

function ALaCarteTile({ item }) {
  const plan = usePlanChanges();
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
        <button type="button" className="alacarte-cta" disabled>
          Selected ✓
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
