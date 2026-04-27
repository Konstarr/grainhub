-- ============================================================
-- migration-community-storage.sql
--
-- Lets authenticated users upload community images (icons, banners,
-- post images) into the existing `media` bucket under the
-- `communities/` prefix, and lets the public read them. Members can
-- also DELETE their own uploads if they want to clean up.
--
-- Apply once. Idempotent (drops + recreates each policy by name).
-- ============================================================

-- Bucket should already exist and be PUBLIC for reads. If not, run:
--   insert into storage.buckets (id, name, public)
--     values ('media','media', true)
--     on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do update set public = true;

-- ------------------------------------------------------------
-- Public read for everything in `communities/...`
-- ------------------------------------------------------------
drop policy if exists "media_communities_public_read" on storage.objects;
create policy "media_communities_public_read"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'communities'
  );

-- ------------------------------------------------------------
-- Authenticated users may insert under `communities/...`
-- ------------------------------------------------------------
drop policy if exists "media_communities_authed_insert" on storage.objects;
create policy "media_communities_authed_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'communities'
  );

-- ------------------------------------------------------------
-- Authenticated users can update / delete their own uploads.
-- (storage.objects.owner is set to auth.uid() on insert.)
-- ------------------------------------------------------------
drop policy if exists "media_communities_owner_update" on storage.objects;
create policy "media_communities_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'communities'
    and owner = auth.uid()
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'communities'
  );

drop policy if exists "media_communities_owner_delete" on storage.objects;
create policy "media_communities_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'communities'
    and (owner = auth.uid() or public.is_admin())
  );
