-- ============================================================
-- migration-community-posts-extras.sql
--
-- Second-pass tweaks on community posts so the feed feels like a
-- real community, not a bland stream:
--
--   post_type  — coarse category for each post: 'discussion',
--                'question', 'showcase', 'announcement'. Lets the UI
--                tint the card, filter by type, and collect shop
--                wins / build photos into a Showcase tab later.
--
--   is_pinned  — mods + owners can pin up to a few posts that
--                surface at the top of the feed.
--
-- RLS updates only the new columns; all existing policies continue
-- to apply unchanged.
--
-- Safe to re-run.
-- ============================================================

alter table public.community_posts
  add column if not exists post_type text not null default 'discussion',
  add column if not exists is_pinned boolean not null default false;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'community_posts_type_check'
  ) then
    alter table public.community_posts drop constraint community_posts_type_check;
  end if;
end $$;

alter table public.community_posts
  add constraint community_posts_type_check
  check (post_type in ('discussion', 'question', 'showcase', 'announcement'));

create index if not exists community_posts_pinned_idx
  on public.community_posts(community_id, is_pinned)
  where is_pinned = true;

-- Only mods/owners/admins can flip is_pinned. Regular members can
-- still edit their own post body (via the existing update policy),
-- so we scope pin changes with a trigger that blocks non-mods from
-- setting/unsetting is_pinned.
create or replace function public.enforce_post_pin_scope()
returns trigger language plpgsql as $$
begin
  if coalesce(old.is_pinned, false) is distinct from coalesce(new.is_pinned, false) then
    if not (public.is_admin() or public.is_community_mod(new.community_id)) then
      raise exception 'Only moderators or the owner can pin/unpin posts';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists community_posts_pin_scope on public.community_posts;
create trigger community_posts_pin_scope
  before update on public.community_posts
  for each row execute function public.enforce_post_pin_scope();
