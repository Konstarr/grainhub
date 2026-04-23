-- ============================================================
-- GrainHub DEMO USERS + FORUM POSTS
-- Creates 20 demo auth users (with profiles) and seeds 2–5 forum
-- posts per existing thread, authored by those demo profiles.
--
-- Run AFTER: schema.sql, seed.sql, and seed-sample-data.sql
-- Safe to re-run: skips users whose email already exists and
-- skips threads that already have posts.
--
-- All demo users use the email domain @grainhub.example so they
-- are easy to find and delete later. The password is set but the
-- accounts are not meant to be used for real login.
-- ============================================================

-- ------------------------------------------------------------
-- 20 DEMO AUTH USERS + PROFILES
-- ------------------------------------------------------------
do $$
declare
  emails text[] := array[
    'anna.carpenter@grainhub.example',
    'bill.builder@grainhub.example',
    'carlos.mendez@grainhub.example',
    'dana.whitfield@grainhub.example',
    'evan.park@grainhub.example',
    'farah.ng@grainhub.example',
    'grant.sullivan@grainhub.example',
    'hana.takeda@grainhub.example',
    'ivan.petrov@grainhub.example',
    'julia.ortega@grainhub.example',
    'kwame.adebayo@grainhub.example',
    'lena.fischer@grainhub.example',
    'marco.ruiz@grainhub.example',
    'nadia.chen@grainhub.example',
    'oscar.bennett@grainhub.example',
    'priya.shah@grainhub.example',
    'quentin.fox@grainhub.example',
    'ruth.alvarado@grainhub.example',
    'samir.khouri@grainhub.example',
    'tessa.moreau@grainhub.example'
  ];
  usernames text[] := array[
    'anna_carpenter','bill_builder','carlos_mendez','dana_whitfield','evan_park',
    'farah_ng','grant_sullivan','hana_takeda','ivan_petrov','julia_ortega',
    'kwame_adebayo','lena_fischer','marco_ruiz','nadia_chen','oscar_bennett',
    'priya_shah','quentin_fox','ruth_alvarado','samir_khouri','tessa_moreau'
  ];
  fullnames text[] := array[
    'Anna Carpenter','Bill Builder','Carlos Mendez','Dana Whitfield','Evan Park',
    'Farah Ng','Grant Sullivan','Hana Takeda','Ivan Petrov','Julia Ortega',
    'Kwame Adebayo','Lena Fischer','Marco Ruiz','Nadia Chen','Oscar Bennett',
    'Priya Shah','Quentin Fox','Ruth Alvarado','Samir Khouri','Tessa Moreau'
  ];
  trades text[] := array[
    'cabinet-making','millwork','cnc-machining','furniture-making','architectural-woodwork',
    'finishing-coatings','hardware-accessories','wood-species','safety-standards','cabinet-making',
    'millwork','cnc-machining','furniture-making','architectural-woodwork','finishing-coatings',
    'hardware-accessories','wood-species','safety-standards','cabinet-making','millwork'
  ];
  bios text[] := array[
    '20 years building custom kitchens on the West Coast. Frameless specialist.',
    'Third-generation millwork shop owner. Church and library interiors mostly.',
    'CNC programmer and operator. Biesse Rover and Holz-Her panel saws.',
    'Studio furniture maker. One-off commissions, hardwoods, hand-cut joinery.',
    'Architectural woodwork — yachts, boardrooms, high-end residential.',
    'Spray finisher. Conversion varnish, waterborne, and pre-cat lacquer.',
    'Hardware nerd. Blum, Hafele, Richelieu dealer + installer.',
    'Lumber buyer and sawyer. Specialize in Appalachian hardwoods.',
    'Shop safety consultant. Former OSHA compliance officer.',
    'Custom closets and built-ins. 12-person shop in Denver.',
    'Commercial millwork foreman. Schools, hospitals, hospitality.',
    'CAD/CAM for cabinet shops. Cabinet Vision, Microvellum, AlphaCAM.',
    'Windsor chairs and period reproductions. Hand tools only.',
    'AWI-certified premium grade woodwork inspector.',
    'Restoring oil finishes and shellac on antiques.',
    'Sell and install Blum Orgalux, Tandembox, and Aventos.',
    'Kiln operator. Run a small custom drying business in the Southeast.',
    'Dust collection design, fire suppression, MSDS compliance.',
    'Second-gen cabinet shop. Transitioning from face-frame to frameless.',
    'Window and door restorer. Historic districts in the Northeast.'
  ];
  locations text[] := array[
    'Portland, OR','Austin, TX','Phoenix, AZ','Brooklyn, NY','Seattle, WA',
    'San Diego, CA','Nashville, TN','Raleigh, NC','Chicago, IL','Denver, CO',
    'Boston, MA','Atlanta, GA','Minneapolis, MN','Miami, FL','Kansas City, MO',
    'Salt Lake City, UT','Asheville, NC','Cleveland, OH','Richmond, VA','Burlington, VT'
  ];
  websites text[] := array[
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
  ];
  i int;
  new_uid uuid;
begin
  for i in 1..array_length(emails, 1) loop
    -- Skip if this demo user already exists (makes re-runs safe)
    if exists (select 1 from auth.users where email = emails[i]) then
      continue;
    end if;

    new_uid := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      emails[i],
      crypt('grainhub-demo-password', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', fullnames[i]),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- The handle_new_user trigger just inserted a profile stub.
    -- Update it with the real demo values.
    update public.profiles
       set username  = usernames[i],
           full_name = fullnames[i],
           trade     = trades[i],
           bio       = bios[i],
           location  = locations[i],
           website   = websites[i]
     where id = new_uid;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 2–5 FORUM POSTS PER THREAD (authored by demo profiles)
-- ------------------------------------------------------------
do $$
declare
  thread_rec record;
  author_pool uuid[];
  bodies text[] := array[
    'I ran into the same issue on a job last month. Stepping the feed rate down and going back up after a test piece fixed it for me.',
    'Have you checked your bit geometry? A compression bit sometimes solves this where a straight spiral will chip out.',
    'Great question. Posting my notes from a similar project in case they help anyone searching for this later.',
    'Seconding the above. I run the same setup in my shop and it has been reliable for two years now.',
    'Appreciate you writing this up. Bookmarking for our shop wiki.',
    'We ran into this at scale and ended up building a small jig. Happy to share plans if anyone wants them.',
    'Interesting. What brand of machine are you running? That really matters for this particular issue.',
    'Thanks everyone. Going to try the second suggestion this week and will report back with photos.',
    'Same experience on my end. The trick is definitely surface prep before the first coat goes on.',
    'I would push back a little — on softer species you can absolutely see tearout using that method. Depends on the wood.',
    'Has anybody tried this with figured walnut? That is where I consistently have trouble and have not found a good answer.',
    'Following. We are about to build a batch of 30 cabinets and this thread is exactly what I needed.',
    'Two thoughts: first, check your humidity. Second, make sure your jointer knives are genuinely sharp, not just recently changed.',
    'Adding a photo in the next reply. You can see the chatter marks pretty clearly and it matches the description.',
    'Update from me: sharper blade plus a slower feed fixed it. Thanks to everyone who chimed in.',
    'Good call — that suggestion saved me a full weekend of headaches last summer on a similar build.',
    'Not sure I fully agree with the blanket rule there, but I see where you are coming from given your setup.',
    'If anybody is local and wants to come see the setup running in person, DM me. Always happy to host.',
    'Bumping this thread — still looking for suggestions if anyone has run this exact combination.',
    'Resolved on my end. Leaving the thread up so the next person searching for this finds a working answer.'
  ];
  num_posts int;
  j int;
begin
  -- Grab the 20 demo profiles as the author pool
  select array_agg(p.id)
    into author_pool
    from public.profiles p
    join auth.users u on u.id = p.id
   where u.email like '%@grainhub.example';

  if author_pool is null or array_length(author_pool, 1) = 0 then
    raise notice 'No demo profiles found. Run the user seeding block above first.';
    return;
  end if;

  for thread_rec in select id from public.forum_threads loop
    -- Idempotent: only seed posts on threads that currently have none
    if exists (select 1 from public.forum_posts where thread_id = thread_rec.id) then
      continue;
    end if;

    num_posts := 2 + floor(random() * 4)::int;  -- 2..5 posts

    for j in 1..num_posts loop
      insert into public.forum_posts (thread_id, author_id, body)
      values (
        thread_rec.id,
        author_pool[1 + floor(random() * array_length(author_pool, 1))::int],
        bodies[1 + floor(random() * array_length(bodies, 1))::int]
      );
    end loop;
  end loop;
end $$;

-- ============================================================
-- Summary after running this file:
--   auth.users:        +20 demo accounts (@grainhub.example)
--   profiles:          +20 rows (auto-created by trigger, updated here)
--   forum_posts:       ~40–100 rows (2–5 per existing thread)
-- The bump_thread_on_post trigger will also update
-- forum_threads.reply_count and last_reply_at automatically.
--
-- To wipe the demo data later:
--   delete from auth.users where email like '%@grainhub.example';
-- (cascades will clean up profiles and posts.)
-- ============================================================
