/**
 * Centralized gating predicates. Every feature that should respect a
 * user's plan routes through this module. Frontend uses these directly;
 * SQL RLS policies enforce the same rules server-side for security.
 *
 * The caller passes:
 *   profile  — the row from profiles (or get_my_profile)
 *   packs    — the map { pack_slug: tier_slug } from profile_plan.packs
 *              (omit for predicates that don't need packs)
 *
 * Each predicate returns:
 *   { allowed: boolean, reason?: string, upgradeTo?: {tier | pack + tier} }
 * so callers can render rich upgrade prompts, not just a boolean.
 */

import {
  findIndividualTier,
  findBusinessTier,
  findPackTier,
} from './pricing.js';

// Infinity is not JSON-safe, so the pricing config stores Infinity
// directly; this just unwraps the cap cleanly.
function capFor(obj, key) {
  const cap = obj?.caps?.[key];
  return cap === undefined ? 0 : cap;
}

/**
 * Forum posting quota. Free individuals cap at 3/day, Basic+ unlimited.
 * Businesses inherit unlimited by default (their employees post from
 * their Pro individual seats anyway).
 *
 * todayCount — pass the number of posts the user has made in the last
 * 24 hours (caller is expected to compute this from forum_posts).
 */
export function canPostForum({ profile, todayCount = 0 }) {
  if (!profile) return { allowed: false, reason: 'Sign in to post.' };
  const tier =
    profile.account_type === 'business'
      ? findBusinessTier(profile.membership_tier)
      : findIndividualTier(profile.membership_tier);
  const cap = capFor(tier, 'forumPostsPerDay');
  if (cap === Infinity || cap >= 999999) return { allowed: true };
  if (todayCount < cap) {
    return { allowed: true, remaining: cap - todayCount };
  }
  return {
    allowed: false,
    reason:
      'Daily forum post limit reached on the ' + tier.name + ' plan.',
    upgradeTo: { axis: 'membership', tier: 'basic' },
  };
}

/**
 * Marketplace listing quota. Individuals get 1/3/∞ on free/basic/pro.
 * Businesses inherit from their Vendor Pack tier if present; otherwise
 * they fall back to the (low) business default.
 *
 * activeCount — how many of the user's listings are currently live
 * (is_sold = false, not expired).
 */
export function canListMarketplace({ profile, packs = {}, activeCount = 0 }) {
  if (!profile) return { allowed: false, reason: 'Sign in to list.' };

  let cap;
  if (profile.account_type === 'business') {
    const vendorTierId = packs.vendor;
    if (vendorTierId) {
      cap = findPackTier('vendor', vendorTierId)?.cap ?? 0;
    } else {
      // Business without Vendor Pack: small baseline so they can still
      // post an occasional listing.
      cap = 2;
    }
  } else {
    const tier = findIndividualTier(profile.membership_tier);
    cap = capFor(tier, 'marketplaceListings');
  }

  if (cap === Infinity || cap >= 999999) return { allowed: true };
  if (activeCount < cap) return { allowed: true, remaining: cap - activeCount };
  return {
    allowed: false,
    reason: 'Marketplace listing cap reached.',
    upgradeTo:
      profile.account_type === 'business'
        ? { axis: 'pack', pack: 'vendor', tier: nextTier('vendor', packs.vendor) }
        : { axis: 'membership', tier: profile.membership_tier === 'free' ? 'basic' : 'pro' },
  };
}

/**
 * Job posting quota. Businesses only. Recruiter Pack stacks on top of
 * the baseline from the business membership tier (whichever cap is
 * higher wins — a Pro Business with Recruiter Growth can post up to
 * its Recruiter Growth cap, not summed, which keeps the model simple).
 *
 * activeCount — jobs currently open for this employer.
 */
export function canPostJob({ profile, packs = {}, activeCount = 0 }) {
  if (!profile) return { allowed: false, reason: 'Sign in to post a job.' };
  if (profile.account_type !== 'business') {
    return {
      allowed: false,
      reason: 'Only business accounts can post jobs.',
      upgradeTo: { axis: 'convert-to-business' },
    };
  }

  const bizTier = findBusinessTier(profile.membership_tier);
  const bizCap = capFor(bizTier, 'jobPostings');
  const recruiterCap = packs.recruiter
    ? findPackTier('recruiter', packs.recruiter)?.cap ?? 0
    : 0;
  const cap = Math.max(bizCap, recruiterCap);

  if (cap === Infinity || cap >= 999999) return { allowed: true };
  if (activeCount < cap) return { allowed: true, remaining: cap - activeCount };
  return {
    allowed: false,
    reason: 'Job posting cap reached.',
    upgradeTo: { axis: 'pack', pack: 'recruiter', tier: nextTier('recruiter', packs.recruiter) },
  };
}

/**
 * Can the user post in the "From our sponsors" / "Vendor announcements"
 * promotional subcategory of the forums? Gated to active Supplier Pack
 * with per-month quota.
 *
 * monthCount — how many promo threads this profile has created this
 * calendar month.
 */
export function canPostSupplierPromo({ profile, packs = {}, monthCount = 0 }) {
  if (!profile || profile.account_type !== 'business') {
    return { allowed: false, reason: 'Business accounts with a Supplier Pack only.' };
  }
  const supplierTier = packs.supplier;
  if (!supplierTier) {
    return {
      allowed: false,
      reason: 'Supplier Pack required.',
      upgradeTo: { axis: 'pack', pack: 'supplier', tier: 'starter' },
    };
  }
  const cap = findPackTier('supplier', supplierTier)?.cap ?? 0;
  if (cap === Infinity || monthCount < cap) {
    return { allowed: true, remaining: cap === Infinity ? Infinity : cap - monthCount };
  }
  return {
    allowed: false,
    reason: 'Monthly promo-thread cap reached on Supplier ' + supplierTier + '.',
    upgradeTo: { axis: 'pack', pack: 'supplier', tier: nextTier('supplier', supplierTier) },
  };
}

/**
 * Eligibility to BUY a sponsorship tier. Business-only.
 */
export function canBuySponsorship({ profile }) {
  if (!profile) return { allowed: false, reason: 'Sign in.' };
  if (profile.account_type !== 'business') {
    return {
      allowed: false,
      reason: 'Sponsorships are for business accounts only.',
      upgradeTo: { axis: 'convert-to-business' },
    };
  }
  return { allowed: true };
}

/**
 * Ad-free browsing — a membership perk, not a pack perk.
 */
export function isAdFree(profile) {
  if (!profile) return false;
  if (profile.account_type === 'individual') {
    return ['basic', 'pro', 'enterprise'].includes(profile.membership_tier);
  }
  // Business accounts: Basic Business and up are ad-free.
  return ['basic', 'pro', 'enterprise'].includes(profile.membership_tier);
}

// ── Internal helpers ──────────────────────────────────────
const PACK_TIER_ORDER = ['starter', 'growth', 'scale', 'enterprise'];
function nextTier(packSlug, currentTier) {
  if (!currentTier) return 'starter';
  const idx = PACK_TIER_ORDER.indexOf(currentTier);
  if (idx < 0 || idx === PACK_TIER_ORDER.length - 1) return 'enterprise';
  return PACK_TIER_ORDER[idx + 1];
}

/**
 * Convenience loader. Given a profile, fetches the packs map from the
 * profile_plan view and returns { profile, packs } for passing around.
 * Callers that already have packs can skip this.
 */
export async function loadPlan(supabase, profileId) {
  if (!profileId) return { profile: null, packs: {} };
  const { data, error } = await supabase
    .from('profile_plan')
    .select('id, account_type, membership_tier, sponsor_tier, packs')
    .eq('id', profileId)
    .maybeSingle();
  if (error || !data) return { profile: null, packs: {} };
  return {
    profile: {
      id: data.id,
      account_type: data.account_type,
      membership_tier: data.membership_tier,
      sponsor_tier: data.sponsor_tier,
    },
    packs: data.packs || {},
  };
}
