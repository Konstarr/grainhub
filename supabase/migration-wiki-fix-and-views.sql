-- ============================================================
-- migration-wiki-fix-and-views.sql
--
-- Two fixes for the wiki:
--   1) Re-categorize the encyclopedia articles so they land in the
--      cluster groups the /wiki page uses (their old categories like
--      "Materials", "Production", "Standards" weren't matched).
--   2) Add a view_count column + record_wiki_view() RPC so we can
--      track which articles users actually read.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Re-target categories to match the Wiki page cluster keys
-- ─────────────────────────────────────────────────────────────
-- Cluster keys from src/pages/Wiki.jsx CLUSTERS:
--   Joinery, Finishing, CNC & Digital, Cabinetmaking & Millwork,
--   Wood Species, Hardware & Adhesives, Techniques, Shop & Business,
--   Industry & Brands, Timber & Milling, etc.

update public.wiki_articles set category = 'Cabinetmaking & Millwork'
  where slug in (
    'frameless-cabinet-construction',
    'the-32mm-system',
    'face-frame-construction',
    'edge-banding'
  );

update public.wiki_articles set category = 'Hardware & Adhesives'
  where slug in (
    'european-hinge-selection',
    'drawer-slides'
  );

update public.wiki_articles set category = 'Industry & Brands'
  where slug in (
    'awi-quality-grades',
    'cabinet-vision-vs-microvellum'
  );

update public.wiki_articles set category = 'Finishing'
  where slug in (
    'conversion-varnish-vs-waterborne',
    'spray-booth-setup'
  );

update public.wiki_articles set category = 'CNC & Digital'
  where slug = 'cnc-nesting';

update public.wiki_articles set category = 'Shop & Business'
  where slug = 'dust-collection';

update public.wiki_articles set category = 'Wood Species'
  where slug in (
    'hard-maple',
    'white-oak',
    'walnut',
    'cherry'
  );

update public.wiki_articles set category = 'Cabinetmaking & Millwork'
  where slug = 'plywood-grades';

update public.wiki_articles set category = 'Techniques'
  where slug = 'veneer-matching';

-- Mortise & Tenon flagship is already 'Joinery' but make sure.
update public.wiki_articles set category = 'Joinery'
  where slug = 'mortise-and-tenon-joinery';

-- ─────────────────────────────────────────────────────────────
-- 2. View counter
-- ─────────────────────────────────────────────────────────────
alter table public.wiki_articles
  add column if not exists view_count int not null default 0;

create index if not exists wiki_articles_views_idx
  on public.wiki_articles(view_count desc);

-- record_wiki_view — bump the counter. Anyone (anon or authed)
-- can call it. SECURITY DEFINER so it bypasses RLS on the column.
create or replace function public.record_wiki_view(article_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if article_id_in is null then return; end if;
  update public.wiki_articles
     set view_count = view_count + 1
   where id = article_id_in;
end;
$$;

grant execute on function public.record_wiki_view(uuid) to anon, authenticated;
