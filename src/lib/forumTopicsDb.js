import { supabase } from './supabase.js';

export async function listTopicsForCategory(categoryId) {
  if (!categoryId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('forum_topics')
    .select('id, category_id, name, slug, description, icon, owner_id, is_official, sponsor_tier_min, is_active')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('is_official', { ascending: false })
    .order('name', { ascending: true });
  return { data: data || [], error };
}

export async function listAllTopics() {
  const { data, error } = await supabase
    .from('forum_topics')
    .select('id, category_id, name, slug, description, icon, owner_id, is_official, sponsor_tier_min, is_active')
    .order('category_id', { ascending: true })
    .order('name', { ascending: true });
  return { data: data || [], error };
}

export async function fetchTopicBySlug(categoryId, slug) {
  if (!categoryId || !slug) return { data: null, error: null };
  const { data, error } = await supabase
    .from('forum_topics')
    .select('*, owner:owner_id (id, username, full_name, avatar_url, business_name, sponsor_company)')
    .eq('category_id', categoryId)
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

export async function fetchThreadsForTopic(topicId, { limit = 200 } = {}) {
  if (!topicId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('topic_id', topicId)
    .order('is_pinned', { ascending: false })
    .order('last_reply_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function setThreadTopic(threadId, topicId) {
  if (!threadId) return { error: new Error('Missing threadId') };
  const { error } = await supabase.rpc('set_thread_topic', {
    p_thread_id: threadId,
    p_topic_id: topicId || null,
  });
  return { error };
}

export async function adminUpsertTopic(t) {
  const { data, error } = await supabase.rpc('admin_upsert_topic', {
    p_id:               t.id || null,
    p_category_id:      t.category_id,
    p_name:             (t.name || '').trim(),
    p_slug:             (t.slug || '').trim().toLowerCase(),
    p_description:      t.description || '',
    p_icon:             t.icon || null,
    p_owner_id:         t.owner_id || null,
    p_is_official:      !!t.is_official,
    p_sponsor_tier_min: t.sponsor_tier_min || null,
    p_is_active:        t.is_active !== false,
  });
  return { data, error };
}

export async function adminDeleteTopic(id) {
  if (!id) return { error: new Error('Missing id') };
  const { error } = await supabase.rpc('admin_delete_topic', { p_id: id });
  return { error };
}
