/**
 * Community system DB helpers.
 *
 * Communities are application + invite gated: anyone browsing /communities
 * can request to join, and a mod or owner has to approve the request before
 * the requester appears in community_members. Owners cannot leave a
 * community — they must transfer ownership first.
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

export async function createCommunity({ name, description, iconUrl, bannerUrl, isPublic = true }) {
  if (!name || name.trim().length < 3) {
    return { data: null, error: new Error('Community name must be at least 3 characters.') };
  }
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to create a community.') };

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

/* ══════════════════ Apply / cancel join request ══════════════════ */

export async function requestToJoinCommunity(communityId, message = '') {
  if (!communityId) return { data: null, error: new Error('Missing community id') };
  const { data, error } = await supabase.rpc('request_to_join_community', {
    community_id_in: communityId,
    message_in:      message ? String(message).slice(0, 500) : null,
  });
  return { data, error };
}

export async function cancelJoinRequest(requestId) {
  if (!requestId) return { error: new Error('Missing request id') };
  const { error } = await supabase.rpc('cancel_join_request', { request_id_in: requestId });
  return { error };
}

export async function approveJoinRequest(requestId) {
  if (!requestId) return { error: new Error('Missing request id') };
  const { error } = await supabase.rpc('approve_join_request', { request_id_in: requestId });
  return { error };
}

export async function rejectJoinRequest(requestId) {
  if (!requestId) return { error: new Error('Missing request id') };
  const { error } = await supabase.rpc('reject_join_request', { request_id_in: requestId });
  return { error };
}

export async function fetchPendingJoinRequests(communityId) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_join_requests')
    .select('id, community_id, profile_id, message, created_at, status, profile:profile_id(id, username, full_name, avatar_url, trade)')
    .eq('community_id', communityId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

export async function fetchMyJoinRequest(communityId) {
  if (!communityId) return { data: null, error: null };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: null };
  const { data, error } = await supabase
    .from('community_join_requests')
    .select('id, status, message, created_at')
    .eq('community_id', communityId)
    .eq('profile_id', uid)
    .eq('status', 'pending')
    .maybeSingle();
  return { data, error };
}

/* ══════════════════ Invitations ══════════════════ */

export async function inviteToCommunity(communityId, inviteeProfileId) {
  if (!communityId || !inviteeProfileId) {
    return { data: null, error: new Error('Missing community or invitee') };
  }
  const { data, error } = await supabase.rpc('invite_to_community', {
    community_id_in: communityId,
    invitee_in:      inviteeProfileId,
  });
  return { data, error };
}

export async function acceptCommunityInvitation(invitationId) {
  if (!invitationId) return { error: new Error('Missing invitation id') };
  const { error } = await supabase.rpc('accept_community_invitation', { invitation_id_in: invitationId });
  return { error };
}

export async function declineCommunityInvitation(invitationId) {
  if (!invitationId) return { error: new Error('Missing invitation id') };
  const { error } = await supabase.rpc('decline_community_invitation', { invitation_id_in: invitationId });
  return { error };
}

export async function cancelCommunityInvitation(invitationId) {
  if (!invitationId) return { error: new Error('Missing invitation id') };
  const { error } = await supabase.rpc('cancel_community_invitation', { invitation_id_in: invitationId });
  return { error };
}

export async function fetchMyInvitation(communityId) {
  if (!communityId) return { data: null, error: null };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: null };
  const { data, error } = await supabase
    .from('community_invitations')
    .select('id, community_id, status, created_at, inviter:inviter_id(id, username, full_name)')
    .eq('community_id', communityId)
    .eq('invitee_id', uid)
    .eq('status', 'pending')
    .maybeSingle();
  return { data, error };
}

export async function fetchPendingInvitations(communityId) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_invitations')
    .select('id, status, created_at, invitee:invitee_id(id, username, full_name, avatar_url, trade), inviter:inviter_id(id, username, full_name)')
    .eq('community_id', communityId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function searchProfilesToInvite(query) {
  const q = (query || '').trim();
  if (q.length < 2) return { data: [], error: null };
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  const safe = q.replace(/[%_]/g, (c) => '\\' + c);
  let req = supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, trade')
    .or(`username.ilike.%${safe}%,full_name.ilike.%${safe}%`)
    .limit(8);
  if (uid) req = req.neq('id', uid);
  const { data, error } = await req;
  return { data: data || [], error };
}

/* ══════════════════ Kick / Ban / Unban ══════════════════ */

/** Mod / owner / admin: kick a member. They can re-apply later. */
export async function kickCommunityMember(communityId, profileId) {
  if (!communityId || !profileId) return { error: new Error('Missing args') };
  const { error } = await supabase.rpc('community_kick_member', {
    community_id_in: communityId,
    profile_in:      profileId,
  });
  return { error };
}

/** Mod / owner / admin: ban a member (kick + record ban so they
 *  can't apply or be invited again until unbanned). */
export async function banCommunityMember(communityId, profileId, reason = '') {
  if (!communityId || !profileId) return { error: new Error('Missing args') };
  const { error } = await supabase.rpc('community_ban_member', {
    community_id_in: communityId,
    profile_in:      profileId,
    reason_in:       reason ? String(reason).slice(0, 500) : null,
  });
  return { error };
}

/** Mod / owner / admin: lift a ban. */
export async function unbanCommunityMember(communityId, profileId) {
  if (!communityId || !profileId) return { error: new Error('Missing args') };
  const { error } = await supabase.rpc('community_unban_member', {
    community_id_in: communityId,
    profile_in:      profileId,
  });
  return { error };
}

/** List the active bans for a community (mod / owner / admin only via RLS). */
export async function fetchCommunityBans(communityId) {
  if (!communityId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('community_bans')
    .select('id, community_id, profile_id, banned_by, reason, created_at, profile:profile_id(id, username, full_name, avatar_url, trade), banner:banned_by(id, username, full_name)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

/**
 * Leave the community. Routes through a SECURITY DEFINER RPC that
 * refuses if the caller is the owner — owners must transfer ownership
 * first via transferOwnership().
 */
export async function leaveCommunity(communityId) {
  if (!communityId) return { data: null, error: new Error('Missing community id') };
  const { error } = await supabase.rpc('leave_community', { community_id_in: communityId });
  return { data: null, error };
}

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

export async function fetchMyCommunities() {
  const { data, error } = await supabase.rpc('my_communities');
  return { data: data || [], error };
}

export async function fetchMutualCommunities(otherProfileId) {
  if (!otherProfileId) return { data: [], error: null };
  const { data, error } = await supabase.rpc('mutual_communities', { other: otherProfileId });
  return { data: data || [], error };
}

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

/* ══════════════════ Messages (legacy chat) ══════════════════ */

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

export async function sendCommunityMessage(communityId, body) {
  if (!communityId || !body || !body.trim()) {
    return { data: null, error: new Error('Empty message') };
  }
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to send messages.') };
  const { data, error } = await supabase
    .from('community_messages')
    .insert({ community_id: communityId, author_id: uid, body: body.trim().slice(0, 4000) })
    .select('id, community_id, author_id, body, created_at, deleted_at, author:author_id(id, username, full_name, avatar_url)')
    .maybeSingle();
  return { data, error };
}

export async function deleteCommunityMessage(messageId) {
  if (!messageId) return { data: null, error: new Error('Missing id') };
  const { error } = await supabase
    .from('community_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);
  return { data: null, error };
}

export function subscribeCommunityMessages(communityId, onInsert) {
  if (!communityId) return null;
  const channel = supabase
    .channel('community-chat-' + communityId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages', filter: 'community_id=eq.' + communityId },
        (payload) => { if (onInsert) onInsert(payload.new); })
    .subscribe();
  return channel;
}

/* ══════════════════ Posts (feed) ══════════════════ */

export async function fetchCommunityPosts(communityId, { limit = 50, myUserId = null, postType = null } = {}) {
  if (!communityId) return { data: [], error: null };
  let q = supabase
    .from('community_posts')
    .select('id, community_id, author_id, body, image_url, like_count, comment_count, post_type, is_pinned, created_at, deleted_at,author:author_id(id, username, full_name, avatar_url, trade)')
    .eq('community_id', communityId)
    .is('deleted_at', null)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (postType) q = q.eq('post_type', postType);
  const { data: posts, error } = await q;
  if (error) return { data: [], error };

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
  const validType = ['discussion', 'question', 'showcase', 'announcement'].includes(postType) ? postType : 'discussion';
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
    .select('id, community_id, author_id, body, image_url, like_count, comment_count, post_type, is_pinned, created_at, deleted_at,author:author_id(id, username, full_name, avatar_url, trade)')
    .maybeSingle();
  return { data, error };
}

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
    .insert({ post_id: postId, community_id: communityId, author_id: uid, body: body.trim().slice(0, 4000) })
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

export function subscribeCommunityPosts(communityId, onInsert) {
  if (!communityId) return null;
  const channel = supabase
    .channel('community-feed-' + communityId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: 'community_id=eq.' + communityId },
        (payload) => { if (onInsert) onInsert(payload.new); })
    .subscribe();
  return channel;
}
