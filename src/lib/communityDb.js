/**
 * Community system DB helpers.
 *
 * A community is a user-owned space (icon, banner, name, description,
 * members). Members can be owner / mod / plain member. Threads may
 * belong to a community via forum_threads.community_id.
 *
 * Every mutation returns { data, error } for a consistent UI surface.
 */
import { supabase } from './supabase.js';

/** Browse communities. search matches name or slug. */
export async function fetchCommunities({ search = '', limit = 100 } = {}) {
  let q = supabase
    .from('communities')
    .select('id, slug, name, description, icon_url, banner_url, member_count, thread_count, created_at, is_public')
    .eq('is_public', true)
    .order('member_count', { ascending: false })
    .limit(limit);
  if (search && search.trim()) {
    const s = search.trim();
    q = q.or(`name.ilike.%${s}%,slug.ilike.%${s}%`);
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function fetchCommunityBySlug(slug) {
  if (!slug) return { data: null, error: new Error('Missing slug') };
  const { data, error } = await supabase
    .from('communities')
    .select('id, slug, name, description, icon_url, banner_url, member_count, thread_count, created_at, created_by, is_public')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

/** Slug = lowercase dashed name + random 4-char suffix to dedupe. */
function slugify(name) {
  const base = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'community';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Create a community. The caller is auto-added as the owner by a
 * database trigger, so the frontend doesn't need to follow up with
 * a second insert.
 */
export async function createCommunity({ name, description, iconUrl, bannerUrl, isPublic = true }) {
  if (!name || name.trim().length < 3) {
    return { data: null, error: new Error('Community name must be at least 3 characters.') };
  }
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to create a community.') };

  // Retry on slug collision (the suffix gives us astronomical odds,
  // but the table also enforces uniqueness).
  let row = null;
  let err = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = slugify(name);
    const { data, error } = await supabase
      .from('communities')
      .insert({
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        icon_url: iconUrl || null,
        banner_url: bannerUrl || null,
        is_public: !!isPublic,
        created_by: uid,
      })
      .select()
      .maybeSingle();
    if (!error && data) { row = data; err = null; break; }
    err = error;
    if (!error || (error.code !== '23505' && !/slug/i.test(error.message || ''))) break;
  }
  return { data: row, error: err };
}

/** Join (the trigger maintains member_count for us). */
export async function joinCommunity(communityId) {
  if (!communityId) return { data: null, error: new Error('Missing community id') };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to join.') };
  const { data, error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, profile_id: uid, role: 'member' })
    .select()
    .maybeSingle();
  return { data, error };
}

export async function leaveCommunity(communityId) {
  if (!communityId) return { data: null, error: new Error('Missing community id') };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to leave.') };
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('profile_id', uid);
  return { data: null, error };
}

/** Is the current user a member + what's their role? */
export async function fetchMyMembership(communityId) {
  if (!communityId) return { data: null, error: null };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: null };
  const { data, error } = await supabase
    .from('community_members')
    .select('role, joined_at')
    .eq('community_id', communityId)
    .eq('profile_id', uid)
    .maybeSingle();
  return { data, error };
}

/** My joined communities — uses the SECURITY DEFINER RPC for speed. */
export async function fetchMyCommunities() {
  const { data, error } = await supabase.rpc('my_communities');
  return { data: data || [], error };
}

/** Mutual communities between me and another user (for profile page). */
export async function fetchMutualCommunities(otherProfileId) {
  if (!otherProfileId) return { data: [], error: null };
  const { data, error } = await supabase.rpc('mutual_communities', { other: otherProfileId });
  return { data: data || [], error };
}

/** Threads inside a community, ordered by last activity. */
export async function fetchCommunityThreads(communityId, { limit = 50 } = {}) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*, last_author:last_reply_by(id, username, full_name, avatar_url)')
    .eq('community_id', communityId)
    .order('last_reply_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

/** Who are the members (for the community members tab / roster). */
export async function fetchCommunityMembers(communityId, { limit = 50 } = {}) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_members')
    .select('role, joined_at, profile:profile_id(id, username, full_name, avatar_url, trade)')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true })
    .limit(limit);
  return { data: data || [], error };
}
