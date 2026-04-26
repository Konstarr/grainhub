-- ============================================================
-- migration-marketplace-storage.sql
--
-- Storage policies for marketplace listing photos in the `media`
-- bucket. Files are path-segregated by user id so a vendor can ONLY
-- upload to their own folder, and can only delete their own files.
--
-- Path layout:
--   media/marketplace/<auth_uid>/<random>.<ext>
--
-- Reads stay world-readable via the existing media_public_read
-- policy (we want img src URLs to load for buyers).
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- INSERT: authenticated users can upload to marketplace/<their uid>/...
-- only. The first foldername segment is 'marketplace', the second
-- must equal the caller's auth.uid() rendered as text.
-- ------------------------------------------------------------
drop policy if exists media_marketplace_owner_insert on storage.objects;
create policy media_marketplace_owner_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'marketplace'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- UPDATE: same scope (so users can re-upload over their own files).
-- Mods/admins fall through to the existing media_admin_update policy.
-- ------------------------------------------------------------
drop policy if exists media_marketplace_owner_update on storage.objects;
create policy media_marketplace_owner_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'marketplace'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'marketplace'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- DELETE: users can delete files in their own marketplace/ folder.
-- Existing media_owner_delete already covers the owner-column case;
-- this adds the path-based check for safety even if the owner column
-- ever gets cleared.
-- ------------------------------------------------------------
drop policy if exists media_marketplace_owner_delete on storage.objects;
create policy media_marketplace_owner_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'marketplace'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
