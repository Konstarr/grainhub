/**
 * Supplier "claim your business" helpers.
 *
 * Submission auto-approves when the email domain matches the
 * supplier's website domain. Otherwise it lands in the admin
 * queue at /admin/supplier-claims for review.
 */
import { supabase } from './supabase.js';

export async function fetchSupplierBySlug(slug) {
  if (!slug) return { data: null, error: new Error('Missing slug') };
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, slug, name, category, trade, logo_initials, logo_url, description, website, phone, email, address, rating, review_count, badges, is_verified, claimed_by, created_at')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

export async function submitSupplierClaim({ supplierId, email, evidence }) {
  if (!supplierId || !email) {
    return { data: null, error: new Error('Supplier and email are required.') };
  }
  const { data, error } = await supabase.rpc('submit_supplier_claim', {
    supplier_id_in: supplierId,
    claim_email_in: email.trim(),
    evidence_in:    evidence?.trim() || null,
  });
  if (error) return { data: null, error };
  // Function returns table(claim_id, status); supabase-js gives [{...}].
  const row = Array.isArray(data) ? data[0] : data;
  return { data: row || null, error: null };
}

export async function fetchMyClaimForSupplier(supplierId) {
  if (!supplierId) return { data: null, error: null };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: null };
  const { data, error } = await supabase
    .from('supplier_claims')
    .select('id, supplier_id, claim_email, status, created_at, reject_reason')
    .eq('supplier_id', supplierId)
    .eq('claimant_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

export async function fetchPendingSupplierClaims({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('supplier_claims')
    .select('id, claim_email, evidence, status, created_at, supplier:supplier_id(id, slug, name, website, claimed_by, is_verified), claimant:claimant_id(id, username, full_name, avatar_url, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function approveSupplierClaim(claimId) {
  if (!claimId) return { error: new Error('Missing claim id') };
  const { error } = await supabase.rpc('approve_supplier_claim', { claim_id_in: claimId });
  return { error };
}

export async function rejectSupplierClaim(claimId, reason) {
  if (!claimId) return { error: new Error('Missing claim id') };
  const { error } = await supabase.rpc('reject_supplier_claim', {
    claim_id_in: claimId,
    reason_in:   reason?.trim() || null,
  });
  return { error };
}

export async function updateMySupplier(supplierId, patch = {}) {
  if (!supplierId) return { error: new Error('Missing supplier id') };
  const { error } = await supabase.rpc('update_my_supplier', {
    supplier_id_in: supplierId,
    logo_url_in:    patch.logo_url    ?? null,
    description_in: patch.description ?? null,
    website_in:     patch.website     ?? null,
    phone_in:       patch.phone       ?? null,
    email_in:       patch.email       ?? null,
    address_in:     patch.address     ?? null,
  });
  return { error };
}
