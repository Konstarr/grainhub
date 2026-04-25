-- ============================================================
-- migration-apply-subscription.sql
--
-- Lets a signed-in user atomically apply their own subscription
-- choices (membership tier, role packs, sponsor tier) without going
-- through admin. This is the bridge until Stripe is wired up — once
-- Stripe checkout completes, the webhook will call this same RPC
-- with the verified selections and the function does the database
-- writes in one transaction.
--
-- The function is SECURITY DEFINER so it can write to
-- subscription_packs even though the existing RLS on that table is
-- admin-only. This is safe because the RPC body always pins the
-- writes to auth.uid(); a caller cannot apply a subscription to
-- someone else.
--
-- Gating model:
--   • Membership tiers — UI-gated to the user's account_type
--   • Role packs        — open to BOTH individuals and businesses
--   • Sponsorships      — business-only (DB + UI)
--   • À la carte        — business-only (UI-only; à la carte items
--                         go through email follow-up, not this RPC)
-- ============================================================

create or replace function public.apply_my_subscription(
  membership_tier_in text,
  sponsor_tier_in    text,
  packs_in           jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  acct text;
  pack_slug text;
  tier_slug text;
begin
  if uid is null then
    raise exception 'sign_in_required: must be signed in to subscribe' using errcode = 'P0001';
  end if;

  -- 1) Validate membership tier
  if membership_tier_in is not null and membership_tier_in not in ('free','basic','pro','enterprise') then
    raise exception 'invalid_membership_tier: %', membership_tier_in using errcode = 'P0001';
  end if;

  -- 2) Look up account type so we can gate sponsorships
  select account_type into acct from public.profiles where id = uid;

  -- 3) Sponsor tier: business accounts only. Validate slug too.
  if sponsor_tier_in is not null and sponsor_tier_in <> '' then
    if sponsor_tier_in not in ('silver','gold','platinum') then
      raise exception 'invalid_sponsor_tier: %', sponsor_tier_in using errcode = 'P0001';
    end if;
    if coalesce(acct, 'individual') <> 'business' then
      raise exception 'sponsor_business_only: switch to a business account to add a sponsorship'
        using errcode = 'P0001';
    end if;
  end if;

  -- 4) Apply the membership_tier + sponsor_tier in a single update
  update public.profiles
     set membership_tier = coalesce(membership_tier_in, membership_tier),
         sponsor_tier    = case
           -- Pass empty string from the cart to mean "remove sponsorship"
           when sponsor_tier_in = '' then null
           when sponsor_tier_in is not null then sponsor_tier_in
           else sponsor_tier
         end
   where id = uid;

  -- 5) Replace the user's role packs with whatever's in `packs_in`.
  -- The shape is { recruiter: 'growth', vendor: 'starter', ... }.
  -- Empty object = clear all packs.
  delete from public.subscription_packs where profile_id = uid;

  for pack_slug, tier_slug in
    select * from jsonb_each_text(coalesce(packs_in, '{}'::jsonb))
  loop
    if pack_slug not in ('recruiter','vendor','supplier') then
      raise exception 'invalid_pack: %', pack_slug using errcode = 'P0001';
    end if;
    if tier_slug not in ('starter','growth','scale','enterprise') then
      raise exception 'invalid_pack_tier: %', tier_slug using errcode = 'P0001';
    end if;
    insert into public.subscription_packs (profile_id, pack_slug, tier_slug)
    values (uid, pack_slug, tier_slug);
  end loop;
end $$;

revoke all on function public.apply_my_subscription(text, text, jsonb) from public;
grant execute on function public.apply_my_subscription(text, text, jsonb) to authenticated;
