/**
 * marketplaceAdminDb.js - admin/moderator marketplace operations.
 *
 * RLS already lets is_moderator() update/delete any listing, so most
 * admin actions are direct queries with the same pattern as adminDb.js.
 * Pack-limit settings go through SECURITY DEFINER RPCs that re-check
 * is_admin() server-side.
 */

import { supabase } from './supabase.js';

const escapeLike = (s) => (s || '').trim().replace(/[%_]/g, (c) => '\\' + c);
const escapeOr   = (s) => escapeLike(s).replace(/[,()]/g, ' ');


// ============================================================
// Listings - list, edit, delete (mod or admin)
// ============================================================

export async function adminListListings({
  search = '',
  status = 'all',
  sellerId = null,
  limit = 200,
} = {}) {
  let q = supabase
    .from('marketplace_listings')
    .select(
      'id, seller_id, title, slug, category, trade, condition, price, currency, ' +
      'location, images, is_sold, is_approved, created_at, updated_at, ' +
      'seller:seller_id(id, username, full_name, avatar_url, business_name)'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status === 'live') {
    q = q.eq('is_approved', true).eq('is_sold', false);
  } else if (status === 'sold') {
    q = q.eq('is_sold', true);
  } else if (status === 'pending') {
    q = q.eq('is_approved', false);
  }

  if (sellerId) q = q.eq('seller_id', sellerId);

  if (search && search.trim()) {
    const s = escapeOr(search);
    if (s) q = q.or('title.ilike.%' + s + '%,description.ilike.%' + s + '%,location.ilike.%' + s + '%');
  }

  const { data, error } = await q;
  return { data: data || [], error };
}

export async function adminGetListing(id) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*, seller:seller_id(id, username, full_name, avatar_url, business_name, account_type)')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

const ALLOWED_ADMIN_PATCH_KEYS = new Set([
  'title', 'category', 'trade', 'condition', 'price', 'currency',
  'description', 'location', 'images', 'is_sold', 'is_approved',
  'zip_code', 'latitude', 'longitude',
]);

function sanitizeAdminPatch(patch) {
  const out = {};
  Object.keys(patch || {}).forEach((k) => {
    if (ALLOWED_ADMIN_PATCH_KEYS.has(k)) out[k] = patch[k];
  });
  return out;
}

export async function adminUpdateListing(id, patch) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const safe = sanitizeAdminPatch(patch);
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

export async function adminDeleteListing(id) {
  if (!id) return { error: new Error('Missing id') };
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .eq('id', id);
  return { error };
}

export async function adminToggleListingApproval(id, isApproved) {
  return adminUpdateListing(id, { is_approved: !!isApproved });
}


// ============================================================
// Pack limit settings - what each vendor tier can post per month
// ============================================================

export async function listMarketplacePackLimits() {
  const { data, error } = await supabase
    .from('marketplace_pack_limits')
    .select('*')
    .order('sort_order', { ascending: true });
  return { data: data || [], error };
}

export async function adminUpsertMarketplacePackLimit({
  packTierSlug,
  packLabel,
  monthlyLimit,
  sortOrder = 0,
  isActive = true,
}) {
  if (!packTierSlug) {
    return { data: null, error: new Error('Missing pack tier slug') };
  }
  const { data, error } = await supabase.rpc('admin_upsert_marketplace_pack_limit', {
    p_pack_tier_slug: packTierSlug,
    p_pack_label:     packLabel || packTierSlug,
    p_monthly_limit:  monthlyLimit ?? null,
    p_sort_order:     sortOrder,
    p_is_active:      !!isActive,
  });
  return { data, error };
}

export async function adminDeleteMarketplacePackLimit(slug) {
  if (!slug) return { error: new Error('Missing slug') };
  const { error } = await supabase.rpc('admin_delete_marketplace_pack_limit', {
    p_slug: slug,
  });
  return { error };
}
