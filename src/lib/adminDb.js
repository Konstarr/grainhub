/**
 * Admin-only DB helpers. RLS on news_articles allows inserts / updates /
 * deletes only when public.is_admin() returns true, so these calls will
 * fail with an informative error for non-staff users.
 */
import { supabase } from './supabase.js';

function slugify(title) {
  const base = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'article';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

// ------------------------------------------------------------
// News
// ------------------------------------------------------------

export async function listNewsArticles({ search = '', limit = 200 } = {}) {
  let q = supabase
    .from('news_articles')
    .select('id, title, slug, category, trade, excerpt, cover_image_url, is_published, published_at, created_at, author_id')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (search && search.trim()) {
    q = q.ilike('title', '%' + search.trim() + '%');
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getNewsArticle(id) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function createNewsArticle({
  authorId,
  title,
  slug,
  category,
  trade,
  excerpt,
  body,
  coverImageUrl,
  sourceUrl,
  isPublished,
}) {
  if (!title || !body) {
    return { data: null, error: new Error('Title and body are required') };
  }
  const row = {
    author_id: authorId || null,
    title: title.trim(),
    slug: (slug && slug.trim()) || slugify(title),
    category: category || null,
    trade: trade || null,
    excerpt: excerpt || null,
    body: body,
    cover_image_url: coverImageUrl || null,
    source_url: sourceUrl || null,
    is_published: !!isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase
    .from('news_articles')
    .insert(row)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function updateNewsArticle(id, patch) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const p = { ...patch };

  // Automatic published_at stamping: if flipping to published and no
  // timestamp is set, mark it now. If flipping off, wipe it.
  if (typeof p.is_published === 'boolean') {
    if (p.is_published && !p.published_at) p.published_at = new Date().toISOString();
    if (!p.is_published) p.published_at = null;
  }

  const { data, error } = await supabase
    .from('news_articles')
    .update(p)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function deleteNewsArticle(id) {
  if (!id) return { error: new Error('Missing id') };
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('id', id);
  return { error };
}

// ------------------------------------------------------------
// Events
// ------------------------------------------------------------

export async function listEvents({ search = '', limit = 200 } = {}) {
  let q = supabase
    .from('events')
    .select('id, title, slug, event_type, start_date, end_date, location, venue_name, is_online, is_approved, cover_image_url, created_at, author_id, registration_url, trade')
    .order('start_date', { ascending: true })
    .limit(limit);
  if (search && search.trim()) {
    q = q.ilike('title', '%' + search.trim() + '%');
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getEvent(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function createEvent({
  authorId,
  title,
  slug,
  description,
  eventType,
  startDate,
  endDate,
  location,
  venueName,
  isOnline,
  registrationUrl,
  coverImageUrl,
  trade,
  isApproved,
}) {
  if (!title || !description || !startDate) {
    return { data: null, error: new Error('Title, description, and start date are required') };
  }
  const row = {
    author_id: authorId || null,
    title: title.trim(),
    slug: (slug && slug.trim()) || slugify(title),
    description,
    event_type: eventType || null,
    start_date: new Date(startDate).toISOString(),
    end_date: endDate ? new Date(endDate).toISOString() : null,
    location: location || null,
    venue_name: venueName || null,
    is_online: !!isOnline,
    registration_url: registrationUrl || null,
    cover_image_url: coverImageUrl || null,
    trade: trade || null,
    is_approved: !!isApproved,
  };
  const { data, error } = await supabase
    .from('events')
    .insert(row)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function updateEvent(id, patch) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const p = { ...patch };
  if (p.start_date) p.start_date = new Date(p.start_date).toISOString();
  if (p.end_date) p.end_date = new Date(p.end_date).toISOString();
  const { data, error } = await supabase
    .from('events')
    .update(p)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function deleteEvent(id) {
  if (!id) return { error: new Error('Missing id') };
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  return { error };
}
