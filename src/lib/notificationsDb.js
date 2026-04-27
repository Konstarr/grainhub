/**
 * In-app notification helpers.
 *
 * Notifications are written by Postgres triggers (forum replies,
 * community posts, connection requests, DMs). Each user only sees
 * their own rows via RLS. We expose a tiny realtime channel so the
 * nav bell can light up without polling.
 */
import { supabase } from './supabase.js';

/** Latest N notifications for the signed-in user. */
export async function fetchMyNotifications(limit = 30) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, kind, title, body, link, payload, is_read, created_at, actor:actor_id(id, username, full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function fetchMyUnreadNotificationCount() {
  const { data, error } = await supabase.rpc('fetch_my_unread_notification_count');
  if (error) return 0;
  return Number(data) || 0;
}

export async function markNotificationRead(notifId) {
  if (!notifId) return { error: new Error('Missing notification id') };
  const { error } = await supabase.rpc('mark_notification_read', { notif_in: notifId });
  return { error };
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.rpc('mark_all_notifications_read');
  return { error };
}

export async function deleteNotification(notifId) {
  if (!notifId) return { error: new Error('Missing notification id') };
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notifId);
  return { error };
}

/**
 * Realtime: invoke onInsert(row) whenever a new notification arrives
 * for the given recipient. Returns the channel so the caller can
 * supabase.removeChannel() when unmounting.
 */
export function subscribeMyNotifications(recipientId, onInsert) {
  if (!recipientId) return null;
  const channel = supabase
    .channel(`notif-${recipientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${recipientId}`,
      },
      (payload) => {
        if (typeof onInsert === 'function') onInsert(payload.new);
      },
    )
    .subscribe();
  return channel;
}
