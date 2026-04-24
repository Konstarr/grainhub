-- ============================================================
-- migration-users-sponsors.sql
--
-- 1) Adds permission, visibility, notification, and sponsor columns
--    to public.profiles.
-- 2) Creates public.sponsor_media — a table of ad assets grouped by
--    slot (marquee/leaderboard/sidebar/hero/other) with tier gating
--    (silver/gold/platinum).
-- 3) Adds RLS policies: public read for approved assets, staff CRUD,
--    and a "sponsor owner" self-service path (profile.sponsor_tier
--    not null + user owns the record).
--
-- Safe to re-run — all statements are idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Profile permission / visibility / notification / sponsor cols
-- ------------------------------------------------------------
alter table public.profiles
  -- Moderation
  add column if not exists is_suspended    boolean not null default false,
  add column if not exists is_verified     boolean not null default false,
  add column if not exists is_shadowbanned boolean not null default false,
  add column if not exists mod_note        text,

  -- Content permissions (default true so existing users keep all privileges)
  add column if not exists can_post_forums      boolean not null default true,
  add column if not exists can_post_marketplace boolean not null default true,
  add column if not exists can_post_jobs        boolean not null default true,
  add column if not exists can_submit_events    boolean not null default true,

  -- Notifications
  add column if not exists email_digest    boolean not null default true,
  add column if not exists notify_mentions boolean not null default true,
  add column if not exists notify_replies  boolean not null default true,
  add column if not exists newsletter_optin boolean not null default false,

  -- Visibility
  add column if not exists profile_public      boolean not null default true,
  add column if not exists show_on_leaderboard boolean not null default true,
  add column if not exists email_visible       boolean not null default false,

  -- Sponsor linkage
  add column if not exists sponsor_tier    text check (sponsor_tier in ('silver','gold','platinum')),
  add column if not exists sponsor_company text,
  add column if not exists sponsor_notes   text;

-- ------------------------------------------------------------
-- 2) sponsor_media — the ad asset library
-- ------------------------------------------------------------
create table if not exists public.sponsor_media (
  id               uuid primary key default gen_random_uuid(),
  -- Owning profile (for self-service editing); may be null for house ads.
  owner_id         uuid references public.profiles(id) on delete set null,
  -- Display name (e.g. "Blum SERVO-DRIVE"); shown in admin list.
  name             text not null,
  -- Tier the asset is associated with. Null = house ad / not tier-gated.
  tier             text check (tier in ('silver','gold','platinum')),
  -- Ad placement slot. Controls which component renders it on the site.
  slot             text not null check (slot in ('marquee','leaderboard','sidebar','hero','other')),
  -- The uploaded image URL + optional natural size metadata.
  image_url        text not null,
  image_width      int,
  image_height     int,
  -- Where clicking this takes the visitor.
  click_url        text,
  -- Optional alt text for accessibility.
  alt_text         text,
  -- Optional schedule window; nulls mean "always on".
  starts_at        timestamptz,
  ends_at          timestamptz,
  -- is_approved + is_active combined: approved means staff-reviewed,
  -- active means currently running. Both must be true to show publicly.
  is_approved      boolean not null default false,
  is_active        boolean not null default true,
  -- Display ordering within a slot.
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists sponsor_media_slot_idx   on public.sponsor_media(slot, sort_order);
create index if not exists sponsor_media_active_idx on public.sponsor_media(is_approved, is_active);
create index if not exists sponsor_media_owner_idx  on public.sponsor_media(owner_id);

drop trigger if exists sponsor_media_touch on public.sponsor_media;
create trigger sponsor_media_touch before update on public.sponsor_media
  for each row execute function public.touch_updated_at();

alter table public.sponsor_media enable row level security;

-- Public SELECT: anyone can read approved + active assets within window.
drop policy if exists sponsor_media_public_read on public.sponsor_media;
create policy sponsor_media_public_read on public.sponsor_media
  for select
  using (
    is_approved = true
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
  );

-- Staff SELECT: admins and moderators can see everything (drafts, scheduled, etc.).
drop policy if exists sponsor_media_staff_read on public.sponsor_media;
create policy sponsor_media_staff_read on public.sponsor_media
  for select
  to authenticated
  using (public.is_moderator());

-- Owner SELECT: the sponsor owning the row can see it regardless of status.
drop policy if exists sponsor_media_owner_read on public.sponsor_media;
create policy sponsor_media_owner_read on public.sponsor_media
  for select
  to authenticated
  using (owner_id = auth.uid());

-- INSERT: staff can insert anything; sponsors can insert assets they own.
drop policy if exists sponsor_media_staff_insert on public.sponsor_media;
create policy sponsor_media_staff_insert on public.sponsor_media
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists sponsor_media_sponsor_insert on public.sponsor_media;
create policy sponsor_media_sponsor_insert on public.sponsor_media
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and sponsor_tier is not null
    )
  );

-- UPDATE: staff or the owner.
drop policy if exists sponsor_media_staff_update on public.sponsor_media;
create policy sponsor_media_staff_update on public.sponsor_media
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists sponsor_media_owner_update on public.sponsor_media;
create policy sponsor_media_owner_update on public.sponsor_media
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- DELETE: staff only. Sponsors should request deletion.
drop policy if exists sponsor_media_staff_delete on public.sponsor_media;
create policy sponsor_media_staff_delete on public.sponsor_media
  for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 3) Profiles — staff UPDATE on ANY profile for admin editing
--    (existing policy only allows self-update; moderators get override)
-- ------------------------------------------------------------
drop policy if exists profiles_staff_update on public.profiles;
create policy profiles_staff_update on public.profiles
  for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- ------------------------------------------------------------
-- 4) Storage policies — allow sponsor owners to upload under sponsors/
-- ------------------------------------------------------------
drop policy if exists media_sponsor_upload on storage.objects;
create policy media_sponsor_upload on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'sponsors'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and sponsor_tier is not null
    )
  );

-- (Admin storage policy already covers the admin upload path, so
-- staff can also write to sponsors/ via the general admin policy.)
