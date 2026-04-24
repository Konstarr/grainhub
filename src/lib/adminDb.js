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

// ------------------------------------------------------------
// Users / profiles
// ------------------------------------------------------------

export async function listProfiles({ search = '', limit = 200 } = {}) {
  let q = supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, sponsor_tier, is_suspended, is_verified, trade, location, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (search && search.trim()) {
    const s = search.trim();
    q = q.or(`username.ilike.%${s}%,full_name.ilike.%${s}%`);
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function updateProfileAdmin(id, patch) {
  if (!id) return { data: null, error: new Error('Missing id') };
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

// ------------------------------------------------------------
// Sponsor media
// ------------------------------------------------------------

export async function listSponsorMedia({ slot = null, search = '', limit = 200 } = {}) {
  let q = supabase
    .from('sponsor_media')
    .select('*')
    .order('slot', { ascending: true })
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (slot) q = q.eq('slot', slot);
  if (search && search.trim()) q = q.ilike('name', '%' + search.trim() + '%');
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getSponsorMedia(id) {
  const { data, error } = await supabase
    .from('sponsor_media')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function createSponsorMedia(row) {
  const payload = {
    owner_id: row.owner_id || null,
    name: row.name,
    tier: row.tier || null,
    slot: row.slot,
    image_url: row.image_url,
    image_width: row.image_width || null,
    image_height: row.image_height || null,
    click_url: row.click_url || null,
    alt_text: row.alt_text || null,
    is_approved: !!row.is_approved,
    is_active: row.is_active !== false,
    sort_order: row.sort_order || 0,
    starts_at: row.starts_at || null,
    ends_at: row.ends_at || null,
  };
  const { data, error } = await supabase
    .from('sponsor_media')
    .insert(payload)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function updateSponsorMedia(id, patch) {
  const { data, error } = await supabase
    .from('sponsor_media')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function deleteSponsorMedia(id) {
  const { error } = await supabase
    .from('sponsor_media')
    .delete()
    .eq('id', id);
  return { error };
}

// ------------------------------------------------------------
// Public: fetch approved, active sponsor media by slot
// ------------------------------------------------------------

export async function fetchPublicSponsorMedia(slot) {
  if (!slot) return { data: [], error: null };
  const { data, error } = await supabase
    .from('sponsor_media')
    .select('id, name, tier, image_url, image_width, image_height, click_url, alt_text, sort_order')
    .eq('slot', slot)
    .order('sort_order', { ascending: true });
  return { data: data || [], error };
}
