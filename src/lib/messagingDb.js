/**
 * Messaging DB helpers — connections, conversations, and messages.
 * Every mutation returns { data, error } uniformly so the UI can
 * handle failures without knowing Supabase's shape.
 */
import { supabase } from './supabase.js';

// ------------------------------------------------------------
// Connections
// ------------------------------------------------------------

/** Fetch the edge between me and `otherId` in either direction. */
export async function getConnection(otherId, myId) {
  if (!otherId || !myId) return { data: null, error: null };
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(
      `and(requester_id.eq.${myId},addressee_id.eq.${otherId}),` +
      `and(requester_id.eq.${otherId},addressee_id.eq.${myId})`
    )
    .maybeSingle();
  return { data, error };
}

/** Inbound pending requests — people waiting for me to respond. */
export async function fetchIncomingRequests(myId) {
  if (!myId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('connections')
    .select('*, requester:requester_id(id, username, full_name, avatar_url, business_name, account_type)')
    .eq('addressee_id', myId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

/** Outbound pending requests I sent. */
export async function fetchOutgoingRequests(myId) {
  if (!myId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('connections')
    .select('*, addressee:addressee_id(id, username, full_name, avatar_url, business_name, account_type)')
    .eq('requester_id', myId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

/** Send a connection request via the security-definer function — it
 * enforces the 30-day cooldown and outstanding-request rate-limit. */
export async function requestConnection(otherId) {
  const { data, error } = await supabase.rpc('request_connection', { other: otherId });
  return { data, error };
}

export async function acceptConnection(connectionId) {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', connectionId)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function declineConnection(connectionId) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'declined', responded_at: now, declined_at: now })
    .eq('id', connectionId)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Soft-cancel our own outgoing request. */
export async function cancelConnection(connectionId) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('connections')
    .update({ status: 'declined', declined_at: now, responded_at: now })
    .eq('id', connectionId);
  return { error };
}

// ------------------------------------------------------------
// Conversations
// ------------------------------------------------------------

/** Open (or fetch) a conversation with `otherId`. Server-side function
 * enforces the connection gate. */
export async function startConversation(otherId) {
  const { data, error } = await supabase.rpc('start_conversation', { other: otherId });
  return { data, error };
}

export async function fetchConversations(myId) {
  if (!myId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, user_a, user_b, last_message_at, last_sender_id, created_at,
      a:user_a ( id, username, full_name, avatar_url, business_name, account_type ),
      b:user_b ( id, username, full_name, avatar_url, business_name, account_type )
    `)
    .or('user_a.eq.' + myId + ',user_b.eq.' + myId)
    .order('last_message_at', { ascending: false, nullsLast: true });
  if (error) return { data: [], error };
  // Flatten so each row has `other` (the participant that isn't me)
  const flat = (data || []).map((c) => ({
    ...c,
    other: c.user_a === myId ? c.b : c.a,
  }));
  return { data: flat, error: null };
}

export async function getConversation(id, myId) {
  if (!id) return { data: null, error: null };
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, user_a, user_b, last_message_at, last_sender_id, created_at,
      a:user_a ( id, username, full_name, avatar_url, business_name, account_type ),
      b:user_b ( id, username, full_name, avatar_url, business_name, account_type )
    `)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return { data: null, error };
  data.other = data.user_a === myId ? data.b : data.a;
  return { data, error: null };
}

// ------------------------------------------------------------
// Messages
// ------------------------------------------------------------

export async function fetchMessages(conversationId, { limit = 200 } = {}) {
  if (!conversationId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return { data: data || [], error };
}

export async function sendMessage({ conversationId, senderId, body }) {
  if (!conversationId || !senderId || !body) {
    return { data: null, error: new Error('Missing conversationId, senderId, or body') };
  }
  const trimmed = String(body).slice(0, 4000);
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body: trimmed })
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function markConversationRead(conversationId, myId) {
  if (!conversationId || !myId) return { error: null };
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('messages')
    .update({ read_at: now })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myId)
    .is('read_at', null);
  return { error };
}

// ------------------------------------------------------------
// Unread counter (for nav badge)
// ------------------------------------------------------------

export async function fetchUnreadCount(myId) {
  if (!myId) return 0;
  // Find conversations I'm in, then count messages in them not sent by me
  // that are still unread.
  const { data: convs } = await supabase
    .from('conversations')
    .select('id')
    .or('user_a.eq.' + myId + ',user_b.eq.' + myId);
  const ids = (convs || []).map((c) => c.id);
  if (ids.length === 0) return 0;
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', ids)
    .neq('sender_id', myId)
    .is('read_at', null);
  return count || 0;
}
