/**
 * "For Hire" listing helpers — reuses the public.jobs table
 * with kind='seeking'. One active listing per user, enforced
 * by a partial unique index in the DB.
 */
import { supabase } from './supabase.js';

export async function fetchForHireListings({ limit = 50, trade = null } = {}) {
  let q = supabase
    .from('jobs')
    .select('id, title, company, location, trade, employment_type, description, years_experience, hourly_rate_min, hourly_rate_max, resume_url, portfolio_urls, apply_email, posted_at, author_id, author:author_id(id, username, full_name, avatar_url)')
    .eq('kind', 'seeking')
    .eq('is_approved', true)
    .eq('is_filled', false)
    .order('posted_at', { ascending: false })
    .limit(limit);
  if (trade) q = q.eq('trade', trade);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function fetchMyForHireListing() {
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: null };
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, location, trade, employment_type, description, years_experience, hourly_rate_min, hourly_rate_max, resume_url, portfolio_urls, apply_email, posted_at, is_filled')
    .eq('author_id', uid)
    .eq('kind', 'seeking')
    .eq('is_filled', false)
    .order('posted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

export async function submitForHire(payload = {}) {
  const { error, data } = await supabase.rpc('submit_for_hire', {
    title_in:           payload.title?.trim() || '',
    description_in:     payload.description?.trim() || '',
    trade_in:           payload.trade || null,
    location_in:        payload.location || null,
    employment_type_in: payload.employmentType || null,
    years_in:           payload.years ?? null,
    rate_min_in:        payload.rateMin ?? null,
    rate_max_in:        payload.rateMax ?? null,
    resume_url_in:      payload.resumeUrl || null,
    portfolio_in:       payload.portfolio || null,
    apply_email_in:     payload.contactEmail || null,
  });
  return { data, error };
}

export async function closeMyForHire() {
  const { error } = await supabase.rpc('close_my_for_hire');
  return { error };
}

/** Bump view counter for a job/listing. Self-views are filtered server-side. */
export async function recordJobView(jobId) {
  if (!jobId) return;
  await supabase.rpc('record_job_view', { job_id_in: jobId });
}

/** Bump click counter when someone hits Apply/Contact. */
export async function recordJobClick(jobId) {
  if (!jobId) return;
  await supabase.rpc('record_job_click', { job_id_in: jobId });
}

/** Upload a PDF resume to media/resumes/<uid>/<uuid>.pdf and return public URL. */
export async function uploadResume(file) {
  if (!file) return { data: null, error: new Error('No file selected') };
  if (file.type !== 'application/pdf') {
    return { data: null, error: new Error('Resume must be a PDF.') };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { data: null, error: new Error('Resume must be 8 MB or smaller.') };
  }
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return { data: null, error: new Error('Sign in to upload a resume.') };

  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `resumes/${uid}/${id}.pdf`;

  const uploadP = supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'application/pdf',
  });
  const timeoutP = new Promise((resolve) =>
    setTimeout(() => resolve({ error: new Error('Upload timed out after 20 seconds.') }), 20000)
  );
  const result = await Promise.race([uploadP, timeoutP]);
  if (result?.error) {
    return { data: null, error: new Error(result.error.message || 'Upload failed.') };
  }
  const { data: pub } = supabase.storage.from('media').getPublicUrl(path);
  return { data: { url: pub?.publicUrl || null, path }, error: null };
}
