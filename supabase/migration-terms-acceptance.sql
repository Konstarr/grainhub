-- ============================================================
-- migration-terms-acceptance.sql
--
-- Records that a profile has accepted a specific version of the
-- Terms of Service / Privacy Policy / Community Rules. The
-- frontend re-prompts when TERMS_VERSION (in src/lib/termsVersion.js)
-- is newer than the stored value.
-- ============================================================

alter table public.profiles
  add column if not exists terms_version     text,
  add column if not exists terms_accepted_at timestamptz;

create index if not exists profiles_terms_accepted_at_idx
  on public.profiles (terms_accepted_at);

-- Existing users are grandfathered in at v0 — they'll be re-prompted
-- on next sign-in if you raise TERMS_VERSION.
