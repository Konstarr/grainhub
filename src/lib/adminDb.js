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
  // Pull enough metadata to power the admin list + stats:
  //   view_count, updated_at (requires migration-news-updated-at.sql),
  //   plus the author profile via FK embed. Falls back gracefully if
  //   updated_at / view_count columns don't exist yet.
  const fullSelect =
    'id, title, slug, category, trade, excerpt, cover_image_url, is_published, ' +
    'published_at, created_at, updated_at, view_count, author_id, ' +
    'author:author_id(id, username, full_name, avatar_url)';

  const escapedSearch = (search || '').trim().replace(/[%_]/g, (c) => '\\' + c);
  let q = supabase
    .from('news_articles')
    .select(fullSelect)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (escapedSearch) {
    q = q.ilike('title', '%' + escapedSearch + '%');
  }
  let { data, error } = await q;

  // Fallback if the DB doesn't have the newer columns yet.
  if (error) {
    let fb = supabase
      .from('news_articles')
      .select(
        'id, title, slug, category, trade, excerpt, cover_image_url, ' +
        'is_published, published_at, created_at, author_id'
      )
      .order('created_at', { ascending: false })
      .limit(limit);
    if (escapedSearch) fb = fb.ilike('title', '%' + escapedSearch + '%');
    const res = await fb;
    data = res.data || [];
    error = res.error || null;
  }

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
  const escapedSearch = (search || '').trim().replace(/[%_]/g, (c) => '\\' + c);
  let q = supabase
    .from('events')
    .select('id, title, slug, event_type, start_date, end_date, location, venue_name, is_online, is_approved, cover_image_url, created_at, author_id, registration_url, trade')
    .order('start_date', { ascending: true })
    .limit(limit);
  if (escapedSearch) {
    q = q.ilike('title', '%' + escapedSearch + '%');
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
// Jobs
// ------------------------------------------------------------

export async function listJobs({ search = '', limit = 200 } = {}) {
  let q = supabase
    .from('jobs')
    .select('id, title, company, location, employment_type, salary_min, salary_max, salary_period, trade, is_approved, is_filled, posted_at, expires_at, author_id, kind, view_count, click_count')
    .order('posted_at', { ascending: false })
    .limit(limit);
  if (search && search.trim()) {
    const s = search.trim()
      .replace(/[%_]/g, (c) => '\\' + c)
      .replace(/[,()]/g, ' ');
    q = q.or(`title.ilike.%${s}%,company.ilike.%${s}%,location.ilike.%${s}%`);
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getJob(id) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function createJob(row) {
  const payload = {
    author_id:       row.author_id || null,
    title:           row.title,
    company:         row.company,
    location:        row.location,
    trade:           row.trade || null,
    employment_type: row.employment_type || null,
    salary_min:      row.salary_min == null || row.salary_min === '' ? null : Number(row.salary_min),
    salary_max:      row.salary_max == null || row.salary_max === '' ? null : Number(row.salary_max),
    salary_period:   row.salary_period || 'year',
    description:     row.description,
    requirements:    row.requirements || null,
    benefits:        row.benefits || null,
    apply_url:       row.apply_url || null,
    apply_email:     row.apply_email || null,
    is_approved:     !!row.is_approved,
    is_filled:       !!row.is_filled,
    expires_at:      row.expires_at || null,
  };
  const { data, error } = await supabase
    .from('jobs')
    .insert(payload)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function updateJob(id, patch) {
  const p = { ...patch };
  if (p.salary_min === '' || p.salary_min == null) p.salary_min = null;
  else p.salary_min = Number(p.salary_min);
  if (p.salary_max === '' || p.salary_max == null) p.salary_max = null;
  else p.salary_max = Number(p.salary_max);
  const { data, error } = await supabase
    .from('jobs')
    .update(p)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function deleteJob(id) {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  return { error };
}

// ------------------------------------------------------------
// Users / profiles
// ------------------------------------------------------------

export async function listProfiles({ search = '', accountType = null, limit = 200 } = {}) {
  let q = supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, account_type, business_name, sponsor_tier, is_suspended, is_verified, trade, location, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (accountType === 'individual' || accountType === 'business') {
    q = q.eq('account_type', accountType);
  }
  if (search && search.trim()) {
    // Escape ILIKE wildcards (% and _) AND PostgREST .or() delimiters
    // (commas, parens) so user input can't break out of the filter.
    const s = search.trim()
      .replace(/[%_]/g, (c) => '\\' + c)
      .replace(/[,()]/g, ' ');
    q = q.or(`username.ilike.%${s}%,full_name.ilike.%${s}%,business_name.ilike.%${s}%`);
  }
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getProfile(id) {
  // admin_get_profile is a SECURITY DEFINER function (see
  // migration-hardening.sql) that returns the full profile row —
  // including columns outside the public-safe grant. Required for
  // AdminUserEdit which shows preferences, business fields, sponsor
  // notes, etc. Falls back to the safe public SELECT so the page
  // still renders something if the function hasn't been migrated yet.
  const { data, error } = await supabase.rpc('admin_get_profile', { target: id });
  if (!error && Array.isArray(data) && data.length > 0) {
    return { data: data[0], error: null };
  }
  const fb = await supabase
    .from('profiles')
    .select(
      'id, username, full_name, bio, avatar_url, trade, location, website,' +
      'role, reputation, thread_count, post_count, joined_at, created_at,' +
      'is_verified, is_suspended,' +
      'account_type, business_name, business_website, business_verified,' +
      'sponsor_tier, sponsor_company,' +
      'profile_public, show_on_leaderboard, email_visible'
    )
    .eq('id', id)
    .maybeSingle();
  return { data: fb.data, error: fb.error || error };
}

// ------------------------------------------------------------
// Connections (admin)
// ------------------------------------------------------------

export async function listConnectionsAdmin({ search = '', status = '', limit = 300 } = {}) {
  let q = supabase
    .from('connections')
    .select(`
      id, status, created_at, responded_at, declined_at,
      requester:requester_id ( id, username, full_name, avatar_url, business_name, account_type ),
      addressee:addressee_id ( id, username, full_name, avatar_url, business_name, account_type )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status === 'pending' || status === 'accepted' || status === 'declined') {
    q = q.eq('status', status);
  }
  const { data, error } = await q;
  let rows = data || [];
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    rows = rows.filter((r) => {
      const bag = [
        r.requester?.username, r.requester?.full_name, r.requester?.business_name,
        r.addressee?.username, r.addressee?.full_name, r.addressee?.business_name,
      ].filter(Boolean).map((v) => v.toLowerCase()).join(' ');
      return bag.includes(s);
    });
  }
  return { data: rows, error };
}

/**
 * Admin override — force an edge into any state. Creates the edge if it
 * doesn't exist yet. Uses the server-side SECURITY DEFINER function so
 * the DB does the is_admin() check.
 */
export async function adminForceConnect(a, b, status = 'accepted') {
  const { data, error } = await supabase.rpc('admin_force_connect', {
    a, b, new_status: status,
  });
  return { data, error };
}

export async function adminUpdateConnection(id, patch) {
  const { data, error } = await supabase
    .from('connections')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export async function adminDeleteConnection(id) {
  const { error } = await supabase.from('connections').delete().eq('id', id);
  return { error };
}

/** Search profiles by name / username — for the admin "create connection" picker. */
export async function searchProfiles(query, { limit = 12 } = {}) {
  const raw = (query || '').trim();
  if (!raw) return { data: [], error: null };
  // Escape ILIKE wildcards (% and _) AND PostgREST .or() delimiters
  // (commas, parens) so user input can't break out of the filter.
  const q = raw
    .replace(/[%_]/g, (c) => '\\' + c)
    .replace(/[,()]/g, ' ');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, business_name, account_type')
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%,business_name.ilike.%${q}%`)
    .limit(limit);
  return { data: data || [], error };
}

export async function updateProfileAdmin(id, patch) {
  if (!id) return { data: null, error: new Error('Missing id') };
  // Route through the SECURITY DEFINER RPC so admin profile edits
  // bypass the column-grant layer that was rejecting direct UPDATE.
  // See supabase/migration-admin-profile-update.sql.
  const { data, error } = await supabase.rpc('admin_update_profile', {
    target_id: id,
    patch,
  });
  if (error) return { data: null, error };
  const row = Array.isArray(data) ? data[0] : data;
  return { data: row || null, error: null };
}

// Communities owned + last-N threads + last-N posts for the
// "Activity" panel on /admin/users/:id.
export async function fetchUserAdminActivity(profileId, { limit = 10 } = {}) {
  if (!profileId) return { communities: [], threads: [], posts: [] };
  const [comm, threads, posts] = await Promise.all([
    supabase
      .from('communities')
      .select('id, slug, name, member_count, created_at')
      .eq('owner_id', profileId)
      .order('created_at', { ascending: false }),
    supabase
      .from('forum_threads')
      .select('id, slug, title, created_at, reply_count, view_count, is_solved, is_locked')
      .eq('author_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('forum_posts')
      .select('id, body, created_at, is_deleted, thread:thread_id(id, slug, title)')
      .eq('author_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);
  return {
    communities: comm.data || [],
    threads:     threads.data || [],
    posts:       posts.data || [],
  };
}

// ── Subscription packs (admin) ────────────────────────────
// Role packs (recruiter / vendor / supplier) live in their own table;
// each row is (profile_id, pack_slug) → tier_slug. These helpers let
// AdminUserEdit load and mutate that map.

export async function fetchSubscriptionPacks(profileId) {
  if (!profileId) return { data: {}, error: null };
  const { data, error } = await supabase
    .from('subscription_packs')
    .select('pack_slug, tier_slug')
    .eq('profile_id', profileId);
  if (error) return { data: {}, error };
  const map = {};
  (data || []).forEach((r) => { map[r.pack_slug] = r.tier_slug; });
  return { data: map, error: null };
}

export async function setSubscriptionPack(profileId, packSlug, tierSlug) {
  if (!profileId || !packSlug) {
    return { data: null, error: new Error('Missing id or pack') };
  }
  // Upsert: one row per (profile, pack_slug)
  const { data, error } = await supabase
    .from('subscription_packs')
    .upsert(
      { profile_id: profileId, pack_slug: packSlug, tier_slug: tierSlug },
      { onConflict: 'profile_id,pack_slug' }
    )
    .select()
    .maybeSingle();
  return { data, error };
}

export async function removeSubscriptionPack(profileId, packSlug) {
  if (!profileId || !packSlug) {
    return { data: null, error: new Error('Missing id or pack') };
  }
  const { error } = await supabase
    .from('subscription_packs')
    .delete()
    .eq('profile_id', profileId)
    .eq('pack_slug', packSlug);
  return { data: null, error };
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
  if (search && search.trim()) {
    const s = search.trim().replace(/[%_]/g, (c) => '\\' + c);
    q = q.ilike('name', '%' + s + '%');
  }
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

export async function listSponsorMediaByOwner(ownerId) {
  if (!ownerId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('sponsor_media')
    .select('*')
    .eq('owner_id', ownerId)
    .order('slot', { ascending: true })
    .order('sort_order', { ascending: true });
  return { data: data || [], error };
}

/**
 * Tier → slot access map. A sponsor can upload assets only to slots
 * their tier unlocks. Platinum gets everything; lower tiers get
 * progressively fewer slots.
 */
export const TIER_SLOT_ACCESS = {
  silver:   ['marquee'],
  gold:     ['marquee', 'sidebar'],
  platinum: ['marquee', 'sidebar', 'leaderboard', 'hero'],
};

export function slotsForTier(tier) {
  return TIER_SLOT_ACCESS[tier] || [];
}

/**
 * Full catalog of sponsors grouped by tier — for the admin overview.
 * Returns a map { platinum: [...], gold: [...], silver: [...] } where
 * each entry is a profile row augmented with its media count + a small
 * thumbnail list.
 */
export async function fetchSponsorDashboard() {
  // Only pull columns inside the public-safe grant from
  // migration-hardening.sql. sponsor_notes is intentionally private
  // (sits outside the grant) and isn't rendered on the dashboard —
  // it's edited inside AdminUserEdit which uses admin_get_profile().
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, sponsor_tier, sponsor_company')
    .not('sponsor_tier', 'is', null)
    .order('sponsor_tier', { ascending: false })
    .order('full_name',    { ascending: true });
  if (error) return { data: { platinum: [], gold: [], silver: [] }, error };

  // Fetch all media for these sponsors in one shot
  const ids = (profiles || []).map((p) => p.id);
  let mediaByOwner = new Map();
  if (ids.length > 0) {
    const { data: media } = await supabase
      .from('sponsor_media')
      .select('id, owner_id, slot, image_url, is_approved, is_active')
      .in('owner_id', ids);
    (media || []).forEach((m) => {
      const arr = mediaByOwner.get(m.owner_id) || [];
      arr.push(m);
      mediaByOwner.set(m.owner_id, arr);
    });
  }

  const grouped = { platinum: [], gold: [], silver: [] };
  (profiles || []).forEach((p) => {
    const media = mediaByOwner.get(p.id) || [];
    const entry = { ...p, media, mediaCount: media.length };
    if (grouped[p.sponsor_tier]) grouped[p.sponsor_tier].push(entry);
  });

  return { data: grouped, error: null };
}
