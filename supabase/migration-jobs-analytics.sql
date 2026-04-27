-- ============================================================
-- migration-jobs-analytics.sql
--
-- Adds view + click counters to public.jobs so we can show
-- analytics to (a) the listing's author and (b) admins:
--
--   * view_count   — page views of /jobs/:id
--   * click_count  — clicks on the "Apply" / "Contact" CTA
--
-- Two SECURITY DEFINER RPCs let any authenticated session
-- increment them without write access to the row itself,
-- and self-views (author looking at their own listing)
-- are skipped automatically.
-- ============================================================

alter table public.jobs
  add column if not exists view_count  int not null default 0,
  add column if not exists click_count int not null default 0;

create index if not exists jobs_view_count_idx  on public.jobs(view_count desc);
create index if not exists jobs_click_count_idx on public.jobs(click_count desc);

-- ------------------------------------------------------------
-- record_job_view — bump view_count for a job. Skips self-views
-- so the author's own visits don't pollute the metric.
-- ------------------------------------------------------------
create or replace function public.record_job_view(job_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_owner  uuid;
begin
  if job_id_in is null then return; end if;
  select author_id into v_owner from public.jobs where id = job_id_in;
  if v_owner is not null and v_uid is not null and v_owner = v_uid then
    return; -- self-view, ignore
  end if;
  update public.jobs
     set view_count = view_count + 1
   where id = job_id_in;
end;
$$;

-- ------------------------------------------------------------
-- record_job_click — bump click_count when someone hits Apply
-- (or Contact for For-Hire posts).
-- ------------------------------------------------------------
create or replace function public.record_job_click(job_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_owner uuid;
begin
  if job_id_in is null then return; end if;
  select author_id into v_owner from public.jobs where id = job_id_in;
  if v_owner is not null and v_uid is not null and v_owner = v_uid then
    return; -- self-click, ignore
  end if;
  update public.jobs
     set click_count = click_count + 1
   where id = job_id_in;
end;
$$;

-- Anyone (including anon) can call these so view-counting works
-- for unauthenticated visitors too.
grant execute on function public.record_job_view(uuid)  to anon, authenticated;
grant execute on function public.record_job_click(uuid) to anon, authenticated;
