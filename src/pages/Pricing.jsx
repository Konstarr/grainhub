import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/pricing.css';
import {
  INDIVIDUAL_TIERS,
  BUSINESS_TIERS,
  ROLE_PACKS,
  SPONSOR_TIERS,
  formatPrice,
} from '../lib/pricing.js';

/**
 * /pricing — public pricing page with a persona toggle.
 *
 *   Individual → shows the three individual membership tiers.
 *   Business   → shows business memberships + role packs + sponsorships.
 *
 * Reads everything from lib/pricing.js so this page stays in sync with
 * gating logic and admin editors.
 */
export default function Pricing() {
  const [searchParams] = useSearchParams();
  // URL can force a persona on arrival (signup flow sends business users
  // straight to /pricing?persona=business).
  const initial = searchParams.get('persona') === 'business' ? 'business' : 'individual';
  const [persona, setPersona] = useState(initial);

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
          </div>
        </div>
      </div>

      <div className="pricing-wrap">
        {/* Persona toggle */}
        <div className="persona-toggle">
          <button
            type="button"
            className={'persona-btn ' + (persona === 'individual' ? 'active' : '')}
            onClick={() => setPersona('individual')}
          >
            Individual
          </button>
          <button
            type="button"
            className={'persona-btn ' + (persona === 'business' ? 'active' : '')}
            onClick={() => setPersona('business')}
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
          <IndividualSection />
        ) : (
          <BusinessSection />
        )}

        <div className="pricing-faq">
          <h2>Common questions</h2>
          <FaqItem q="Can I mix and match?">
            Yes. Businesses can combine a membership tier, any role packs they
            need, and a sponsorship — billed on a single invoice. Individuals
            just pick one membership tier.
          </FaqItem>
          <FaqItem q="What happens when I hit a cap?">
            Nothing hard-blocks at the cap. We give you a 2-week grace with a
            banner suggesting an upgrade. Only at 2× the cap does posting
            actually lock.
          </FaqItem>
          <FaqItem q="Annual billing?">
            Annual plans get 2 months free (10× monthly). Available at checkout.
          </FaqItem>
          <FaqItem q="Cancel anytime?">
            Yes. Downgrade or cancel in one click from your account; changes
            take effect at the end of your billing period.
          </FaqItem>
          <FaqItem q="Do you take a cut of marketplace sales?">
            No. Transactions happen directly between buyer and seller. We only
            charge for listing visibility.
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
          <TierCard key={t.id} tier={t} ctaLabel={t.priceMonthly === 0 ? 'Sign up free' : 'Choose ' + t.name} ctaTo="/signup" />
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
          <h2>Business memberships</h2>
          <p>Base features for your company — claimable listing, team seats, and analytics.</p>
        </div>
        <div className="pricing-grid pricing-grid-4">
          {BUSINESS_TIERS.map((t) => (
            <TierCard
              key={t.id}
              tier={t}
              ctaLabel={t.priceMonthly === null ? 'Contact sales' : t.priceMonthly === 0 ? 'Sign up free' : 'Choose ' + t.name}
              ctaTo={t.priceMonthly === null ? 'mailto:sales@grainhub.example' : '/signup?persona=business'}
            />
          ))}
        </div>
      </section>

      <section className="pricing-section">
        <div className="section-heading">
          <h2>Role packs</h2>
          <p>
            Stack these onto any business membership. Pick the volume that matches
            how you actually use the platform — a small shop pays small, a national
            distributor pays for scale.
          </p>
        </div>
        <div className="pricing-grid pricing-grid-3">
          {ROLE_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} />
          ))}
        </div>
      </section>

      <section className="pricing-section">
        <div className="section-heading">
          <h2>Sponsorships</h2>
          <p>
            Pure brand exposure. Independent from memberships and packs — you can
            stack a sponsorship with any combination, or buy one alone.
          </p>
        </div>
        <div className="pricing-grid">
          {SPONSOR_TIERS.map((t) => (
            <TierCard
              key={t.id}
              tier={t}
              ctaLabel={'Become ' + t.name}
              ctaTo="/sponsor"
            />
          ))}
        </div>
      </section>
    </>
  );
}

/* ══════════════════ Reusable cards ══════════════════════ */

function TierCard({ tier, ctaLabel, ctaTo }) {
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
        {tier.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      {ctaTo?.startsWith('mailto:') ? (
        <a href={ctaTo} className="tier-cta">{ctaLabel}</a>
      ) : (
        <Link to={ctaTo || '/signup'} className="tier-cta">{ctaLabel}</Link>
      )}
    </div>
  );
}

function PackCard({ pack }) {
  const [tierId, setTierId] = useState(
    pack.tiers.find((t) => t.highlight)?.id || pack.tiers[0].id
  );
  const active = pack.tiers.find((t) => t.id === tierId) || pack.tiers[0];

  const capLabel =
    active.cap === Infinity
      ? 'Unlimited ' + pack.unitPlural
      : active.cap + ' ' + (active.cap === 1 ? pack.unit : pack.unitPlural);

  return (
    <div className={'pack-card ' + (active.highlight ? 'pack-highlight' : '')}>
      <div className="pack-name">{pack.name}</div>
      <div className="pack-for">{pack.forPersona}</div>

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

      <div className="pack-price">
        {formatPrice(active.priceMonthly)}
        {active.priceMonthly > 0 && <span className="tier-price-sub">/mo</span>}
      </div>
      <div className="pack-cap">{capLabel}</div>

      <ul className="tier-features">
        {pack.sharedFeatures.map((f, i) => <li key={'s' + i}>{f}</li>)}
        {(active.extras || []).map((f, i) => <li key={'e' + i}>{f}</li>)}
      </ul>

      <Link to="/signup?persona=business" className="tier-cta">
        {active.priceMonthly === null ? 'Contact sales' : 'Add ' + pack.name + ' · ' + active.name}
      </Link>
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
