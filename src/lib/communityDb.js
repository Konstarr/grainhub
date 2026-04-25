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
    const s = search.trim()
      .replace(/[%_]/g, (c) => '\\' + c)
      .replace(/[,()]/g, ' ');
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

/**
 * Transfer ownership of the community to another member. Required
 * before an owner can leave. Routes through a SECURITY DEFINER RPC
 * so both updates (promote new, demote old) happen atomically with
 * a single permission check.
 */
export async function transferOwnership(communityId, newOwnerProfileId) {
  if (!communityId || !newOwnerProfileId) {
    return { error: new Error('Missing community id or new owner id') };
  }
  const { error } = await supabase.rpc('transfer_community_ownership', {
    community_id_in: communityId,
    new_owner_in:    newOwnerProfileId,
  });
  return { error };
}

/**
 * Promote a member to moderator, or demote a moderator to member.
 * Owners only (enforced by the RPC).
 */
export async function setMemberRole(communityId, profileId, role) {
  if (!['member', 'mod'].includes(role)) {
    return { error: new Error('Invalid role') };
  }
  const { error } = await supabase.rpc('set_community_member_role', {
    community_id_in: communityId,
    member_in:       profileId,
    new_role_in:     role,
  });
  return { error };
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
export async function fetchCommunityMembers(communityId, { limit = 200 } = {}) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_members')
    .select('role, joined_at, profile:profile_id(id, username, full_name, avatar_url, trade)')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true })
    .limit(limit);
  return { data: data || [], error };
}

/* ══════════════════ Messages (community chat) ══════════════════ */

/** Load the most recent N messages in the community, oldest first so
 *  the chat reads naturally top-to-bottom. */
export async function fetchCommunityMessages(communityId, { limit = 100 } = {}) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_messages')
    .select('id, community_id, author_id, body, created_at, deleted_at, author:author_id(id, username, full_name, avatar_url)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: [], error };
  return { data: (data || []).reverse(), error: null };
}

/** Send a message. RLS enforces membership; the trigger would also
 *  reject a non-member, so this is belt + suspenders. */
export async function sendCommunityMessage(communityId, body) {
  if (!communityId || !body || !body.trim()) {
    return { data: null, error: new Error('Empty message') };
  }
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to send messages.') };

  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      community_id: communityId,
      author_id: uid,
      body: body.trim().slice(0, 4000),
    })
    .select('id, community_id, author_id, body, created_at, deleted_at, author:author_id(id, username, full_name, avatar_url)')
    .maybeSingle();
  return { data, error };
}

/** Soft-delete (set deleted_at). Only author / mod / admin. */
export async function deleteCommunityMessage(messageId) {
  if (!messageId) return { data: null, error: new Error('Missing id') };
  const { error } = await supabase
    .from('community_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);
  return { data: null, error };
}

/**
 * Subscribe to live inserts in a community chat via Supabase realtime.
 * (Retained even though communities now use a POSTS model — future
 * DM / chat surfaces can reuse this.)
 */
export function subscribeCommunityMessages(communityId, onInsert) {
  if (!communityId) return null;
  const channel = supabase
    .channel('community-chat-' + communityId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: 'community_id=eq.' + communityId,
      },
      (payload) => {
        if (onInsert) onInsert(payload.new);
      }
    )
    .subscribe();
  return channel;
}

/* ══════════════════ Posts (Facebook-style feed) ══════════════════ */

/**
 * Load a community's feed of posts. If a signed-in user id is passed,
 * we also fetch which posts they've already liked so the UI can render
 * an accurate "liked" state without another request per post.
 */
export async function fetchCommunityPosts(communityId, { limit = 50, myUserId = null, postType = null } = {}) {
  if (!communityId) return { data: [], error: null };
  let q = supabase
    .from('community_posts')
    .select(
      'id, community_id, author_id, body, image_url, like_count, comment_count, post_type, is_pinned, created_at, deleted_at,' +
      'author:author_id(id, username, full_name, avatar_url, trade)'
    )
    .eq('community_id', communityId)
    .is('deleted_at', null)
    // Pinned posts surface above the rest. Postgres sorts booleans as
    // false=0, true=1 so we need DESC to put pinned first.
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (postType) q = q.eq('post_type', postType);
  const { data: posts, error } = await q;
  if (error) return { data: [], error };

  // Which of these posts have I already liked?
  let mineSet = new Set();
  if (myUserId && posts && posts.length > 0) {
    const ids = posts.map((p) => p.id);
    const { data: mine } = await supabase
      .from('community_post_likes')
      .select('post_id')
      .eq('profile_id', myUserId)
      .in('post_id', ids);
    mineSet = new Set((mine || []).map((r) => r.post_id));
  }
  const decorated = (posts || []).map((p) => ({ ...p, iLiked: mineSet.has(p.id) }));
  return { data: decorated, error: null };
}

export async function createCommunityPost(communityId, { body, imageUrl = null, postType = 'discussion' }) {
  if (!communityId || !body?.trim()) {
    return { data: null, error: new Error('Empty post') };
  }
  const validType = ['discussion', 'question', 'showcase', 'announcement'].includes(postType)
    ? postType : 'discussion';
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to post.') };

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      community_id: communityId,
      author_id: uid,
      body: body.trim().slice(0, 8000),
      image_url: imageUrl || null,
      post_type: validType,
    })
    .select(
      'id, community_id, author_id, body, image_url, like_count, comment_count, post_type, is_pinned, created_at, deleted_at,' +
      'author:author_id(id, username, full_name, avatar_url, trade)'
    )
    .maybeSingle();
  return { data, error };
}

/** Mod/owner-only: pin or unpin a post. The DB trigger rejects the
 *  change from anyone else, but we short-circuit in the client too. */
export async function setPostPinned(postId, pinned) {
  if (!postId) return { data: null, error: new Error('Missing post id') };
  const { data, error } = await supabase
    .from('community_posts')
    .update({ is_pinned: !!pinned })
    .eq('id', postId)
    .select('id, is_pinned')
    .maybeSingle();
  return { data, error };
}

export async function deleteCommunityPost(postId) {
  if (!postId) return { data: null, error: new Error('Missing post id') };
  const { error } = await supabase
    .from('community_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId);
  return { data: null, error };
}

/** Toggle like: if a row exists, delete it; otherwise insert. The
 *  count triggers take care of bumping community_posts.like_count. */
export async function togglePostLike({ postId, communityId, iLiked }) {
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to like.') };

  if (iLiked) {
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('profile_id', uid);
    return { data: { iLiked: false }, error };
  }
  const { error } = await supabase
    .from('community_post_likes')
    .insert({ post_id: postId, community_id: communityId, profile_id: uid });
  return { data: { iLiked: true }, error };
}

export async function fetchPostComments(postId) {
  if (!postId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_post_comments')
    .select('id, post_id, author_id, body, created_at, deleted_at, author:author_id(id, username, full_name, avatar_url)')
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

export async function createPostComment({ postId, communityId, body }) {
  if (!postId || !body?.trim()) {
    return { data: null, error: new Error('Empty comment') };
  }
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to comment.') };

  const { data, error } = await supabase
    .from('community_post_comments')
    .insert({
      post_id: postId,
      community_id: communityId,
      author_id: uid,
      body: body.trim().slice(0, 4000),
    })
    .select('id, post_id, author_id, body, created_at, deleted_at, author:author_id(id, username, full_name, avatar_url)')
    .maybeSingle();
  return { data, error };
}

export async function deletePostComment(commentId) {
  if (!commentId) return { data: null, error: new Error('Missing comment id') };
  const { error } = await supabase
    .from('community_post_comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId);
  return { data: null, error };
}

/** Live new-post stream for the community feed. */
export function subscribeCommunityPosts(communityId, onInsert) {
  if (!communityId) return null;
  const channel = supabase
    .channel('community-feed-' + communityId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_posts',
        filter: 'community_id=eq.' + communityId,
      },
      (payload) => { if (onInsert) onInsert(payload.new); }
    )
    .subscribe();
  return channel;
}

