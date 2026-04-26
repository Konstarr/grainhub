/**
 * communityAdminDb.js — site-admin operations on communities.
 *
 * RLS already lets is_admin() select all communities and their members,
 * so list/get are direct queries. Leadership changes route through the
 * SECURITY DEFINER RPCs that internally re-check is_admin().
 */

import { supabase } from './supabase.js';

const escapeLike = (s) => (s || '').trim().replace(/[%_]/g, (c) => '\\' + c);
const escapeOr   = (s) => escapeLike(s).replace(/[,()]/g, ' ');

export async function adminListCommunities({ search = '', limit = 200 } = {}) {
  let q = supabase
    .from('communities')
    .select('id, slug, name, description, icon_url, banner_url, member_count, created_by, created_at, is_public')
    .order('member_count', { ascending: false })
    .limit(limit);
  if (search && search.trim()) {
    const s = escapeOr(search);
    if (s) q = q.or('name.ilike.%' + s + '%,slug.ilike.%' + s + '%,description.ilike.%' + s + '%');
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function adminGetCommunity(id) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const { data, error } = await supabase
    .from('communities')
    .select('*, owner:created_by(id, username, full_name, avatar_url, business_name)')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function adminListCommunityMembers(communityId) {
  if (!communityId) return { data: [], error: new Error('Missing community id') };
  const { data, error } = await supabase
    .from('community_members')
    .select('community_id, profile_id, role, joined_at, profile:profile_id(id, username, full_name, avatar_url, business_name, trade)')
    .eq('community_id', communityId)
    .order('role', { ascending: true })
    .order('joined_at', { ascending: true });
  return { data: data || [], error };
}

export async function adminSetCommunityOwner(communityId, newOwnerProfileId) {
  if (!communityId || !newOwnerProfileId) {
    return { error: new Error('Missing community id or profile id') };
  }
  const { error } = await supabase.rpc('admin_set_community_owner', {
    community_id_in: communityId,
    new_owner_in:    newOwnerProfileId,
  });
  return { error };
}

export async function adminSetMemberRole(communityId, profileId, role) {
  if (!communityId || !profileId) {
    return { error: new Error('Missing community id or profile id') };
  }
  if (!['member', 'mod'].includes(role)) {
    return { error: new Error('Role must be "member" or "mod"') };
  }
  const { error } = await supabase.rpc('set_community_member_role', {
    community_id_in: communityId,
    member_in:       profileId,
    new_role_in:     role,
  });
  return { error };
}

export async function adminRemoveMember(communityId, profileId) {
  if (!communityId || !profileId) {
    return { error: new Error('Missing community id or profile id') };
  }
  const { error } = await supabase.rpc('admin_remove_community_member', {
    community_id_in: communityId,
    member_in:       profileId,
  });
  return { error };
}

/**
 * Site-admin only: drop any profile straight into a community at
 * member-level, bypassing the apply / invite handshake. No-op if they
 * are already a member at any role.
 */
export async function adminAddMember(communityId, profileId) {
  if (!communityId || !profileId) {
    return { error: new Error('Missing community id or profile id') };
  }
  const { error } = await supabase.rpc('admin_add_community_member', {
    community_id_in: communityId,
    profile_in:      profileId,
  });
  return { error };
}

/**
 * Search profiles for the "promote to owner" picker in the admin UI.
 */
export async function adminSearchProfilesForCommunity(query, { limit = 12 } = {}) {
  const raw = (query || '').trim();
  if (!raw) return { data: [], error: null };
  const q = raw
    .replace(/[%_]/g, (c) => '\\' + c)
    .replace(/[,()]/g, ' ');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, business_name, account_type')
    .or('username.ilike.%' + q + '%,full_name.ilike.%' + q + '%,business_name.ilike.%' + q + '%')
    .limit(limit);
  return { data: data || [], error };
}
