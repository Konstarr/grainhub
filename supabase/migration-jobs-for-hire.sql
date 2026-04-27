-- ============================================================
-- migration-jobs-for-hire.sql
--
-- Reuses the public.jobs table for two flows:
--   * kind='hiring'  — employer posts a job
--   * kind='seeking' — worker advertises themselves "for hire"
--
-- Adds resume_url, years_experience, hourly_rate, kind. Enforces
-- one active 'seeking' listing per user via a partial unique index.
-- Creates a storage bucket policy so signed-in users can upload
-- a PDF resume into media/resumes/<uid>/...
-- ============================================================

-- Columns
alter table public.jobs
  add column if not exists kind             text   not null default 'hiring'
    check (kind in ('hiring','seeking')),
  add column if not exists resume_url       text,
  add column if not exists years_experience int,
  add column if not exists hourly_rate_min  int,
  add column if not exists hourly_rate_max  int,
  add column if not exists portfolio_urls   text[] not null default '{}';

create index if not exists jobs_kind_idx on public.jobs(kind, is_approved, posted_at desc);

-- One active 'seeking' listing per author. Soft-fill keeps history
-- but only the unfilled one counts as "active".
create unique index if not exists jobs_one_active_seeking
  on public.jobs (author_id)
  where kind = 'seeking' and is_filled = false;

-- ------------------------------------------------------------
-- submit_for_hire — insert OR update the user's active seeking row
-- ------------------------------------------------------------
create or replace function public.submit_for_hire(
  title_in         text,
  description_in   text,
  trade_in         text          default null,
  location_in      text          default null,
  employment_type_in text        default null,
  years_in         int           default null,
  rate_min_in      int           default null,
  rate_max_in      int           default null,
  resume_url_in    text          default null,
  portfolio_in     text[]        default null,
  apply_email_in   text          default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  if title_in is null or length(trim(title_in)) < 4 then
    raise exception 'title_required' using errcode = '22000';
  end if;
  if description_in is null or length(trim(description_in)) < 20 then
    raise exception 'description_required' using errcode = '22000';
  end if;

  -- Upsert: keep the existing active seeking row if there is one.
  select id into v_id
    from public.jobs
   where author_id = v_uid
     and kind      = 'seeking'
     and is_filled = false
   limit 1;

  if v_id is null then
    insert into public.jobs (
      author_id, kind, title, company, location, trade,
      employment_type, description,
      years_experience, hourly_rate_min, hourly_rate_max,
      resume_url, portfolio_urls, apply_email,
      is_approved, posted_at
    ) values (
      v_uid, 'seeking',
      title_in,
      coalesce((select coalesce(full_name, username) from public.profiles where id = v_uid), 'Worker'),
      coalesce(location_in, ''),
      trade_in,
      employment_type_in,
      description_in,
      years_in, rate_min_in, rate_max_in,
      resume_url_in, coalesce(portfolio_in, '{}'::text[]), apply_email_in,
      true, now()
    )
    returning id into v_id;
  else
    update public.jobs
       set title            = title_in,
           location         = coalesce(location_in, location),
           trade            = trade_in,
           employment_type  = employment_type_in,
           description      = description_in,
           years_experience = years_in,
           hourly_rate_min  = rate_min_in,
           hourly_rate_max  = rate_max_in,
           resume_url       = coalesce(resume_url_in, resume_url),
           portfolio_urls   = coalesce(portfolio_in, portfolio_urls),
           apply_email      = apply_email_in,
           posted_at        = now()
     where id = v_id;
  end if;

  return v_id;
end;
$$;

grant execute on function public.submit_for_hire(text, text, text, text, text, int, int, int, text, text[], text) to authenticated;

-- ------------------------------------------------------------
-- close_my_for_hire — soft-fill the user's active listing
-- ------------------------------------------------------------
create or replace function public.close_my_for_hire()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.jobs
     set is_filled = true
   where author_id = auth.uid()
     and kind      = 'seeking'
     and is_filled = false;
$$;

grant execute on function public.close_my_for_hire() to authenticated;

-- ------------------------------------------------------------
-- Storage RLS for resumes/<uid>/... in the existing media bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('media','media', true)
  on conflict (id) do update set public = true;

drop policy if exists "media_resumes_public_read" on storage.objects;
create policy "media_resumes_public_read"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'resumes'
  );

drop policy if exists "media_resumes_authed_insert" on storage.objects;
create policy "media_resumes_authed_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'resumes'
  );

drop policy if exists "media_resumes_owner_update" on storage.objects;
create policy "media_resumes_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'resumes'
    and owner = auth.uid()
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'resumes'
  );

drop policy if exists "media_resumes_owner_delete" on storage.objects;
create policy "media_resumes_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'resumes'
    and (owner = auth.uid() or public.is_admin())
  );
