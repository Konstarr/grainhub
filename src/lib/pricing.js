/**
 * Single source of truth for every price, tier, pack, and feature
 * flag on the platform. The pricing page, signup flow, admin panel,
 * gating predicates, and /permissions all read from this file.
 *
 * Three orthogonal axes:
 *   1) Individual membership  — free / basic / pro
 *   2) Business membership    — free / basic / pro / enterprise
 *   3) Role packs (business)  — recruiter / vendor / supplier
 *                               each with starter/growth/scale/enterprise
 *      Sponsorship tiers     — silver / gold / platinum  (existing)
 *
 * All prices are monthly USD. Annual discount is 2 months free
 * (i.e. annual = monthly * 10) and applied at checkout, not stored
 * here.
 */

// ── 1) Individual memberships ──────────────────────────────
export const INDIVIDUAL_TIERS = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    tagline: 'Read, learn, and dip a toe in the community.',
    features: [
      'Read forums, wiki, and news',
      '3 forum posts per day',
      '1 active marketplace listing',
      'Apply to jobs',
      'Basic profile',
    ],
    caps: { forumPostsPerDay: 3, marketplaceListings: 1 },
  },
  {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 9,
    tagline: 'For active community members.',
    features: [
      'Everything in Free',
      'Unlimited forum posts',
      '3 active marketplace listings',
      'Bookmarks & saved articles',
      'Thread subscriptions + weekly digest',
      'Ad-free browsing',
      'Basic member badge',
    ],
    caps: { forumPostsPerDay: Infinity, marketplaceListings: 3 },
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29,
    tagline: 'For serious woodworkers building a reputation.',
    highlight: true,
    features: [
      'Everything in Basic',
      'Unlimited marketplace listings',
      'See who viewed your profile',
      'Private Pro forum (mentorship, advanced topics)',
      'Monthly industry report PDF',
      'Download wiki as offline PDFs',
      'Pro badge (gold outline)',
    ],
    caps: { forumPostsPerDay: Infinity, marketplaceListings: Infinity },
  },
];

// ── 2) Business memberships ───────────────────────────────
export const BUSINESS_TIERS = [
  {
    id: 'free',
    name: 'Free Business',
    priceMonthly: 0,
    tagline: 'Get listed and explore.',
    features: [
      'Claim your company page',
      'Listed in supplier directory (basic)',
      '1 job posting per month',
      '1 employee seat (Pro individual)',
      'Basic analytics',
    ],
    caps: { jobPostings: 1, employeeSeats: 1 },
  },
  {
    id: 'basic',
    name: 'Basic Business',
    priceMonthly: 99,
    tagline: 'For small shops running day to day.',
    features: [
      'Everything in Free',
      '5 job postings per month',
      'Verified business badge',
      '3 employee seats (Pro individual)',
      'Basic listing analytics',
    ],
    caps: { jobPostings: 5, employeeSeats: 3 },
  },
  {
    id: 'pro',
    name: 'Pro Business',
    priceMonthly: 499,
    tagline: 'For growing operations and multi-shop companies.',
    highlight: true,
    features: [
      'Everything in Basic',
      'Unlimited job postings',
      'Featured supplier placement',
      '10 employee seats (Pro individual)',
      'Lead capture forms on listings',
      'Full analytics dashboard',
      'Eligible for sponsorship tiers',
      '1 sponsored article per quarter',
    ],
    caps: { jobPostings: Infinity, employeeSeats: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: null, // contact sales
    tagline: 'For large distributors, manufacturers, and multi-brand operations.',
    features: [
      'Everything in Pro',
      'Unlimited employee seats',
      'Custom bundled role packs',
      'Dedicated account manager',
      'API access',
      'SSO / SCIM',
      'Custom sponsorship arrangements',
    ],
    caps: { jobPostings: Infinity, employeeSeats: Infinity },
  },
];

// ── 3) Role packs (business add-ons) ──────────────────────
// Each pack has four tiers: starter / growth / scale / enterprise.
// Buyers pick their level per pack.
export const ROLE_PACKS = [
  {
    id: 'recruiter',
    name: 'Recruiter Pack',
    forPersona: 'Staffing agencies and companies hiring at scale',
    unit: 'active job posting',
    unitPlural: 'active job postings',
    sharedFeatures: [
      'Applicant tracking',
      'Resume search',
      'Company careers page',
      'Featured placement in Jobs search',
    ],
    tiers: [
      { id: 'starter',    name: 'Starter',    priceMonthly: 199,  cap: 10 },
      { id: 'growth',     name: 'Growth',     priceMonthly: 399,  cap: 25, highlight: true },
      { id: 'scale',      name: 'Scale',      priceMonthly: 699,  cap: 50 },
      { id: 'enterprise', name: 'Enterprise', priceMonthly: null, cap: Infinity },
    ],
  },
  {
    id: 'vendor',
    name: 'Vendor Pack',
    forPersona: 'Marketplace sellers (lumber brokers, machine dealers, resellers)',
    unit: 'active marketplace listing',
    unitPlural: 'active marketplace listings',
    sharedFeatures: [
      'Priority placement in marketplace search',
      'Seller analytics',
      'Verified-seller badge',
      'Bulk listing upload',
    ],
    tiers: [
      { id: 'starter',    name: 'Starter',    priceMonthly: 99,   cap: 15 },
      { id: 'growth',     name: 'Growth',     priceMonthly: 249,  cap: 50, highlight: true },
      { id: 'scale',      name: 'Scale',      priceMonthly: 599,  cap: 150 },
      { id: 'enterprise', name: 'Enterprise', priceMonthly: null, cap: Infinity },
    ],
  },
  {
    id: 'supplier',
    name: 'Supplier Pack',
    forPersona: 'Hardware, finish, software, and material manufacturers',
    // Supplier pack is about promotional horsepower, not volume.
    unit: 'promotional forum post per month',
    unitPlural: 'promotional forum posts per month',
    sharedFeatures: [
      'Verified-supplier badge',
      'Directory placement',
      'Monthly traffic report',
    ],
    tiers: [
      {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 299,
        cap: 1,
        extras: ['Standard directory placement'],
      },
      {
        id: 'growth',
        name: 'Growth',
        priceMonthly: 599,
        cap: 2,
        highlight: true,
        extras: [
          'Featured placement (top of category)',
          'Lead capture form on listing',
          'Outbound lead CSV export',
        ],
      },
      {
        id: 'scale',
        name: 'Scale',
        priceMonthly: 999,
        cap: 4,
        extras: [
          'Featured + hero rotation on Suppliers page',
          'Lead capture + full lead dashboard',
          '1 sponsored newsletter mention per quarter',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        priceMonthly: null,
        cap: Infinity,
        extras: ['Custom arrangement'],
      },
    ],
  },
];

// ── 4) À la carte — one-off, no subscription ──────────────
// For buyers who don't want to commit to a monthly plan. Priced to
// make subscriptions look like a better deal when used often, but
// stand-alone useful for launches, product announcements, or seasonal
// pushes.
export const A_LA_CARTE = [
  {
    id: 'email-blast',
    name: 'Dedicated email blast',
    icon: '📧',
    price: 799,
    unit: 'one-time',
    tagline: 'Your message, your design, to the full subscriber list.',
    description:
      'One dedicated send to our full Millwork.io newsletter audience — your copy, your CTA, your branding. 24-hour turnaround on proofs.',
  },
  {
    id: 'newsletter-sponsor',
    name: 'Newsletter sponsorship',
    icon: '📰',
    price: 399,
    unit: 'per week',
    tagline: 'Sponsor one issue of The Weekly Grain.',
    description:
      'Your logo, 2-line copy, and CTA at the top of that week\'s edition. Reaches every subscribed user on Tuesday morning.',
  },
  {
    id: 'event-sponsor',
    name: 'Event sponsor',
    icon: '🎪',
    price: 1499,
    unit: 'per event',
    tagline: 'Put your brand on a Millwork.io-hosted webinar or summit.',
    description:
      'Logo on event page + slides, 30-second intro during the live session, post-event attendee list (with opt-in).',
  },
  {
    id: 'featured-article',
    name: 'Featured sponsored article',
    icon: '📝',
    price: 599,
    unit: 'one-time',
    tagline: 'Written by your team, distributed through our News channel.',
    description:
      'Clearly labeled as sponsored. Lives permanently in the News archive and gets pushed to the homepage feed for 7 days.',
  },
  {
    id: 'forum-ama',
    name: 'Sponsored forum AMA',
    icon: '🎤',
    price: 799,
    unit: 'one-time',
    tagline: 'Host a verified AMA in the community forum.',
    description:
      'Pinned for 48 hours. We moderate. Includes a pre-promo post, live window, and permanent archive link.',
  },
  {
    id: 'homepage-takeover',
    name: 'Homepage banner takeover',
    icon: '🎯',
    price: 1200,
    unit: 'per week',
    tagline: 'Full-width homepage hero for 7 days.',
    description:
      'Rotates with zero other banners during your week. Max 3 takeovers per quarter (site-wide) so exposure stays valuable.',
  },
  {
    id: 'industry-report',
    name: 'Industry report co-sponsor',
    icon: '📊',
    price: 2500,
    unit: 'quarterly',
    tagline: 'Co-sponsor our quarterly millwork industry report.',
    description:
      'Logo on the cover + dedicated page. Lead list from report downloads (with opt-in). Typically 1,500+ engaged readers per report.',
  },
  {
    id: 'directory-boost',
    name: 'Supplier directory boost',
    icon: '📦',
    price: 299,
    unit: '30 days',
    tagline: 'Jump to the top of your category for a month.',
    description:
      'One-off boost without committing to a monthly Supplier Pack. Great for product-launch windows.',
  },
];

// ── 5) Sponsorship tiers (existing) ───────────────────────
export const SPONSOR_TIERS = [
  {
    id: 'silver',
    name: 'Silver Sponsor',
    priceMonthly: 500,
    tagline: 'Logo rotation on every page.',
    features: ['Marquee ad rotation', 'Standard listing in Sponsor directory'],
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    priceMonthly: 1200,
    tagline: 'Marquee + sidebar placements.',
    highlight: true,
    features: [
      'Everything in Silver',
      'Sidebar ad slots across Forums / News / Wiki / Jobs',
      'Enhanced Sponsor directory listing',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    priceMonthly: 2000,
    tagline: 'Top-of-site brand dominance.',
    features: [
      'Everything in Gold',
      'Leaderboard placement',
      'Homepage hero feature rotation',
      'Priority Sponsor directory ranking',
    ],
  },
];

// ── 6) Lookups ────────────────────────────────────────────
export function findIndividualTier(id) {
  return INDIVIDUAL_TIERS.find((t) => t.id === id) || INDIVIDUAL_TIERS[0];
}
export function findBusinessTier(id) {
  return BUSINESS_TIERS.find((t) => t.id === id) || BUSINESS_TIERS[0];
}
export function findPack(id) {
  return ROLE_PACKS.find((p) => p.id === id) || null;
}
export function findPackTier(packId, tierId) {
  const pack = findPack(packId);
  return pack ? pack.tiers.find((t) => t.id === tierId) || null : null;
}
export function findSponsorTier(id) {
  return SPONSOR_TIERS.find((t) => t.id === id) || null;
}

// ── 7) Helpers ────────────────────────────────────────────
export function formatPrice(monthly) {
  if (monthly === null || monthly === undefined) return 'Contact sales';
  if (monthly === 0) return 'Free';
  return '$' + monthly.toLocaleString();
}

export function annualFromMonthly(monthly) {
  // 2 months free
  return monthly === null ? null : monthly * 10;
}
