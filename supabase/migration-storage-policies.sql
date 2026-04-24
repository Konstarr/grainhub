-- ============================================================
-- migration-storage-policies.sql
--
-- Storage RLS policies for the `media` bucket:
--   - Anyone can READ (bucket is public anyway, but select policies
--     govern server-side access)
--   - Any authenticated user can INSERT objects under `forum/` (forum
--     image uploads) and `avatars/` (profile avatars)
--   - Admins + owner can INSERT / UPDATE / DELETE anything in the
--     bucket (news covers, editorial images, moderation cleanup)
--
-- Run this in the Supabase SQL Editor once. Idempotent — safe to re-run.
-- ============================================================

-- Ensure bucket exists and is public (safe if already set)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- --------------------------------------------------------
-- SELECT: world-readable
-- --------------------------------------------------------
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select
  using (bucket_id = 'media');

-- --------------------------------------------------------
-- INSERT: authenticated users can upload into forum/ and avatars/
-- --------------------------------------------------------
drop policy if exists media_auth_upload_forum on storage.objects;
create policy media_auth_upload_forum on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (
      (storage.foldername(name))[1] = 'forum'
      or (storage.foldername(name))[1] = 'avatars'
    )
  );

-- --------------------------------------------------------
-- INSERT / UPDATE / DELETE: admins (and owner) can manage anything
-- --------------------------------------------------------
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media' and public.is_admin()
  );

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- --------------------------------------------------------
-- Users can also delete files they own (based on owner column Supabase
-- auto-populates on insert). Handy for "remove my own uploaded image".
-- --------------------------------------------------------
drop policy if exists media_owner_delete on storage.objects;
create policy media_owner_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media' and owner = auth.uid());
