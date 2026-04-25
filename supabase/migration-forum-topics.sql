-- ============================================================
-- migration-forum-topics.sql
--
-- Third level under group -> subcategory: "Topics" (e.g. Microvellum
-- under Software & Design Tools). Topics live in the DB so they can
-- be claimed by official vendors and admins can add new ones without
-- a code deploy.
--
-- Idempotent.
-- ============================================================

create table if not exists public.forum_topics (
  id              uuid primary key default gen_random_uuid(),
  category_id     text not null,
  name            text not null,
  slug            text not null,
  description     text,
  icon            text,
  owner_id        uuid references public.profiles(id) on delete set null,
  is_official     boolean not null default false,
  sponsor_tier_min text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (category_id, slug)
);
create index if not exists forum_topics_category_idx on public.forum_topics(category_id);
create index if not exists forum_topics_owner_idx    on public.forum_topics(owner_id);

alter table public.forum_threads
  add column if not exists topic_id uuid references public.forum_topics(id) on delete set null;
create index if not exists forum_threads_topic_idx on public.forum_threads(topic_id);

alter table public.forum_topics enable row level security;
drop policy if exists forum_topics_select on public.forum_topics;
create policy forum_topics_select on public.forum_topics for select using (true);
drop policy if exists forum_topics_admin_write on public.forum_topics;
create policy forum_topics_admin_write on public.forum_topics
  for all using (public.is_admin()) with check (public.is_admin());

-- SECURITY DEFINER RPCs so the editor doesn't depend on RLS quirks.
create or replace function public.admin_upsert_topic(
  p_id              uuid,
  p_category_id     text,
  p_name            text,
  p_slug            text,
  p_description     text,
  p_icon            text,
  p_owner_id        uuid,
  p_is_official     boolean,
  p_sponsor_tier_min text,
  p_is_active       boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_id is null then
    insert into public.forum_topics
      (category_id, name, slug, description, icon, owner_id,
       is_official, sponsor_tier_min, is_active)
    values
      (p_category_id, p_name, p_slug, p_description, p_icon, p_owner_id,
       coalesce(p_is_official, false), p_sponsor_tier_min, coalesce(p_is_active, true))
    returning id into v_id;
  else
    update public.forum_topics set
      category_id      = p_category_id,
      name             = p_name,
      slug             = p_slug,
      description      = p_description,
      icon             = p_icon,
      owner_id         = p_owner_id,
      is_official      = coalesce(p_is_official, false),
      sponsor_tier_min = p_sponsor_tier_min,
      is_active        = coalesce(p_is_active, true),
      updated_at       = now()
    where id = p_id
    returning id into v_id;
  end if;
  return v_id;
end $$;

create or replace function public.admin_delete_topic(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  delete from public.forum_topics where id = p_id;
end $$;

-- Move a thread into / out of a topic. Author or staff only.
create or replace function public.set_thread_topic(p_thread_id uuid, p_topic_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_author uuid;
begin
  select author_id into v_author from public.forum_threads where id = p_thread_id;
  if v_author is null then
    raise exception 'Thread not found' using errcode = 'P0002';
  end if;
  if v_author <> auth.uid() and not public.is_moderator() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  update public.forum_threads set topic_id = p_topic_id where id = p_thread_id;
end $$;

revoke all on function public.admin_upsert_topic(uuid,text,text,text,text,text,uuid,boolean,text,boolean) from public;
revoke all on function public.admin_delete_topic(uuid) from public;
revoke all on function public.set_thread_topic(uuid, uuid) from public;
grant execute on function public.admin_upsert_topic(uuid,text,text,text,text,text,uuid,boolean,text,boolean) to authenticated;
grant execute on function public.admin_delete_topic(uuid) to authenticated;
grant execute on function public.set_thread_topic(uuid, uuid) to authenticated;

-- Seed a few starter topics so the UI has something to render.
insert into public.forum_topics (category_id, name, slug, description, icon, sponsor_tier_min)
values
  ('software-tools', 'Microvellum',    'microvellum',    'Microvellum-specific questions, scripts, and library tips.', '📐', 'platinum'),
  ('software-tools', 'Cabinet Vision', 'cabinet-vision', 'CV setup, post processors, UCS, library work, and migration help.', '📐', 'platinum'),
  ('software-tools', 'KCDw',           'kcdw',           'KCDw users — tips, troubleshooting, library tweaks.', '📐', 'platinum'),
  ('software-tools', 'Mozaik',         'mozaik',         'Mozaik plus its parametric scripting and report tools.', '📐', 'platinum'),
  ('hardware',       'Blum',           'blum',           'Blum hinges, drawer slides, LEGRABOX, SERVO-DRIVE.', '🔩', 'platinum'),
  ('hardware',       'Grass',          'grass',          'Grass Nova Pro, Vionaro, Tiomos hinges.',          '🔩', 'platinum'),
  ('hardware',       'Hettich',        'hettich',        'Hettich AvanTech, InnoTech, Sensys hinges.',       '🔩', 'platinum')
on conflict (category_id, slug) do nothing;
