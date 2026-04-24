-- ============================================================
-- migration-admin-roles.sql
--
-- Expands the role hierarchy to: member / moderator / admin / owner
-- Updates is_admin() and is_moderator() so 'owner' outranks 'admin'.
-- Adds is_staff() and is_owner() helpers.
-- Grants editorial access (news) to admin+owner.
-- Seeds apkrichie@gmail.com as the owner.
--
-- Safe to re-run (all statements are idempotent).
-- ============================================================

-- 1) Extend the role CHECK constraint to allow 'owner'
do $$
declare
  cons_name text;
begin
  select conname into cons_name
    from pg_constraint
   where conrelid = 'public.profiles'::regclass
     and contype  = 'c'
     and pg_get_constraintdef(oid) ilike '%role%';
  if cons_name is not null then
    execute format('alter table public.profiles drop constraint %I', cons_name);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('member','moderator','admin','owner'));

-- 2) Refresh the role-check helper functions
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('moderator','admin','owner')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin','owner')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'owner'
  );
$$;

-- Convenience alias for "is any kind of staff"
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_moderator();
$$;

alter function public.is_moderator() owner to postgres;
alter function public.is_admin()     owner to postgres;
alter function public.is_owner()     owner to postgres;
alter function public.is_staff()     owner to postgres;

-- 3) News article policies — admins (and owner) can CRUD; public can read published
drop policy if exists news_select        on public.news_articles;
drop policy if exists news_admin_write   on public.news_articles;
drop policy if exists news_staff_select  on public.news_articles;

create policy news_staff_select on public.news_articles
  for select using (is_published = true or public.is_admin());

create policy news_admin_write on public.news_articles
  for all using (public.is_admin()) with check (public.is_admin());

-- 4) Promote apkrichie@gmail.com to 'owner' (idempotent)
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
    from auth.users
   where lower(email) = lower('apkrichie@gmail.com')
   limit 1;

  if v_user_id is not null then
    update public.profiles
       set role = 'owner'
     where id = v_user_id;
  end if;
end $$;

-- Helper RPC that clients can call to read their own staff flag
-- (more reliable than embedding the role into the JWT)
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'member'
  );
$$;

alter function public.my_role() owner to postgres;
grant execute on function public.my_role() to authenticated, anon;
