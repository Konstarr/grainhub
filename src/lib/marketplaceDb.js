/**
 * marketplaceDb.js - user-facing marketplace listing operations.
 *
 * Read-side queries (browse, filter) are still inline in Marketplace.jsx
 * via useSupabaseList - this file is the write/edit/eligibility surface
 * that the new /marketplace/new and /marketplace/edit/:id pages use.
 *
 * All searches escape ILIKE wildcards and PostgREST .or() delimiters
 * to match the security pattern in adminDb.js.
 */

import { supabase } from './supabase.js';

const escapeLike = (s) =>
  (s || '').trim().replace(/[%_]/g, (c) => '\\' + c);

const escapeOr = (s) =>
  escapeLike(s).replace(/[,()]/g, ' ');


// ============================================================
// Eligibility - does this user have a vendor pack with capacity?
// ============================================================

export async function getMarketplaceEligibility() {
  const { data, error } = await supabase.rpc('marketplace_eligibility');
  if (error) {
    return {
      eligible: false,
      reason: 'rpc_error',
      error,
    };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { eligible: false, reason: 'no_response' };
  }
  return {
    eligible: !!row.eligible,
    reason: row.reason || null,
    packTierSlug: row.pack_tier_slug || null,
    packLabel: row.pack_label || null,
    monthlyLimit: row.monthly_limit,
    postedThisMonth: row.posted_this_month ?? 0,
    remaining: row.remaining ?? 0,
  };
}


// ============================================================
// Create - server-side validates eligibility, slugifies, inserts.
// ============================================================

export async function createMyListing(payload) {
  const { data, error } = await supabase.rpc('create_marketplace_listing', {
    p_title:       payload.title || '',
    p_category:    payload.category || '',
    p_condition:   payload.condition || '',
    p_price:       payload.price ?? null,
    p_currency:    payload.currency || 'USD',
    p_description: payload.description || '',
    p_location:    payload.location || '',
    p_trade:       payload.trade || '',
    p_images:      Array.isArray(payload.images) ? payload.images : [],
    p_zip_code:    payload.zip_code || '',
    p_latitude:    payload.latitude ?? null,
    p_longitude:   payload.longitude ?? null,
  });
  if (error) return { data: null, error };
  const row = Array.isArray(data) ? data[0] : data;
  return { data: row, error: null };
}


// ============================================================
// Self-edit / mark sold / delete (RLS gates by seller_id)
// ============================================================

const ALLOWED_PATCH_KEYS = new Set([
  'title', 'category', 'trade', 'condition', 'price', 'currency',
  'description', 'location', 'images', 'is_sold',
  'zip_code', 'latitude', 'longitude',
]);

function sanitizePatch(patch) {
  const out = {};
  Object.keys(patch || {}).forEach((k) => {
    if (ALLOWED_PATCH_KEYS.has(k)) out[k] = patch[k];
  });
  return out;
}

export async function updateMyListing(id, patch) {
  if (!id) return { data: null, error: new Error('Missing listing id') };
  const safe = sanitizePatch(patch);
  if (Object.keys(safe).length === 0) {
    return { data: null, error: new Error('Nothing to update') };
  }
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update(safe)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function markMyListingSold(id, sold = true) {
  return updateMyListing(id, { is_sold: !!sold });
}

export async function deleteMyListing(id) {
  if (!id) return { error: new Error('Missing listing id') };
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .eq('id', id);
  return { error };
}

export async function getMyListings({ includeSold = true } = {}) {
  const uid = (await supabase.auth.getUser()).data?.user?.id;
  if (!uid) return { data: [], error: null };
  let q = supabase
    .from('marketplace_listings')
    .select('id, title, slug, category, condition, price, currency, location, is_sold, is_approved, images, created_at, updated_at')
    .eq('seller_id', uid)
    .order('created_at', { ascending: false });
  if (!includeSold) q = q.eq('is_sold', false);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getListingById(id) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}


// ============================================================
// Public search
// ============================================================

export async function searchListings({
  q = '',
  category = '',
  trade = '',
  condition = '',
  location = '',
  limit = 60,
} = {}) {
  let qb = supabase
    .from('marketplace_listings')
    .select('id, title, slug, category, trade, condition, price, currency, location, images, created_at')
    .eq('is_approved', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (q && q.trim()) {
    const s = escapeOr(q);
    if (s) qb = qb.or('title.ilike.%' + s + '%,description.ilike.%' + s + '%');
  }
  if (category) qb = qb.eq('category', category);
  if (trade)    qb = qb.eq('trade', trade);
  if (condition) qb = qb.eq('condition', condition);
  if (location && location.trim()) {
    const s = escapeLike(location);
    if (s) qb = qb.ilike('location', '%' + s + '%');
  }

  const { data, error } = await qb;
  return { data: data || [], error };
}
