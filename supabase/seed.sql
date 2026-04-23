-- ============================================================
-- GrainHub seed data - generated from src/data/*.js
-- Run AFTER schema.sql. Safe to re-run.
-- ============================================================

-- forum_groups
insert into public.forum_groups (id, name, description, icon, icon_color, display_order) values
  ('trade-skills', 'Trade Skills & Craft', 'Construction methods, joinery, installation, finishing, and the hands-on craft of making things', '🛠', 'brown', 0),
  ('machines-tech', 'Machines & Technology', 'CNC, edge banders, panel saws, software, automation, and everything that runs in the shop', '⚙️', 'blue', 1),
  ('running-shop', 'Running a Shop', 'Estimating, pricing, business development, HR, safety, standards, and everything that keeps the lights on', '💼', 'amber', 2),
  ('community', 'Community & Off-Topic', 'Introductions, industry news discussion, show & tell, off-topic conversation, and site feedback', '🤝', 'teal', 3)
on conflict (id) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, icon_color = excluded.icon_color, display_order = excluded.display_order;

-- forum_categories
insert into public.forum_categories (id, group_id, name, description, icon, icon_color, trade, display_order) values
  ('cabinet-making', 'trade-skills', 'Cabinet Making', 'Frameless and face-frame construction, box building, joinery methods, door and drawer fitting, installation tips', '📐', 'brown', 'cabinet-making', 0),
  ('architectural-millwork', 'trade-skills', 'Architectural Millwork', 'Moulding profiles, architectural casework, AWI quality grades, commercial and institutional millwork, wainscoting', '🏛', 'green', 'millwork-moulding', 1),
  ('finishing-coatings', 'trade-skills', 'Finishing & Coatings', 'Lacquers, conversion varnish, water-based finishes, staining, spray technique, equipment, and troubleshooting', '🎨', 'purple', 'finishing-coatings', 2),
  ('wood-species', 'trade-skills', 'Wood Species & Materials', 'Species selection, working properties, grain, drying, sourcing, plywood and sheet goods, edge banding materials', '🪵', 'teal', 'wood-species', 3),
  ('hardware', 'trade-skills', 'Hardware & Accessories', 'Hinges, drawer systems, lifts, pulls, knobs, shelf pins, organizational hardware — selection, installation, comparisons', '🔩', 'red', 'hardware-accessories', 4),
  ('hand-tools', 'trade-skills', 'Hand Tools & Traditional Methods', 'Hand planes, chisels, joinery by hand, furniture making, lutherie, traditional joinery, tool restoration and sharpening', '🪚', 'gray', 'cabinet-making', 5),
  ('cnc-routers', 'machines-tech', 'CNC Routers & Machining', 'CNC programming, nesting, toolpaths, spoilboard management, machine comparisons, Biesse, SCM, Thermwood, MultiCam, and more', '🖥️', 'blue', 'cnc-machining', 6),
  ('edge-banders', 'machines-tech', 'Edge Banders & Panel Equipment', 'Edge banders, panel saws, widebelt sanders, line borers — setup, maintenance, troubleshooting, and buying advice', '🔧', 'teal', 'cnc-machining', 7),
  ('software-tools', 'machines-tech', 'Software & Design Tools', 'Cabinet Vision, Microvellum, KCDw, Mozaik, AutoCAD, SketchUp, estimating software, ERP and shop management systems', '💻', 'purple', 'business-estimating', 8),
  ('shop-automation', 'machines-tech', 'Shop Setup & Automation', 'Shop layout, dust collection, compressed air, material flow, production line design, automation, RFID, and lean manufacturing', '🏭', 'gray', 'shop-management', 9),
  ('estimating', 'running-shop', 'Estimating & Pricing', 'Takeoffs, bid strategy, pricing models, labor rates, material costs, project management, and winning the right jobs', '📊', 'amber', 'business-estimating', 10),
  ('hiring-workforce', 'running-shop', 'Hiring & Workforce', 'Finding and keeping talent, apprenticeships, wages, training programs, shop culture, and managing crews', '👥', 'green', 'shop-management', 11),
  ('standards-codes', 'running-shop', 'Standards, Codes & Legal', 'AWI, KCMA, CARB, OSHA, contracts, warranty, liability, licensing, and compliance questions', '📋', 'red', 'safety-standards', 12),
  ('safety-dust', 'running-shop', 'Safety & Dust Control', 'OSHA compliance, dust collection systems, respiratory protection, wood dust limits, fire suppression, and shop safety programs', '🛡', 'teal', 'safety-standards', 13),
  ('sales-marketing', 'running-shop', 'Sales, Marketing & Growth', 'Finding clients, working with designers and architects, portfolio building, online presence, referrals, and scaling up', '📈', 'gray', 'business-estimating', 14),
  ('introductions', 'community', 'Introductions', 'New to GrainHub? Introduce yourself, your shop, and your specialty. The community loves meeting new members.', '👋', 'teal', null, 15),
  ('show-tell', 'community', 'Show & Tell — Project Showcase', 'Share your best work — finished kitchens, architectural millwork, custom pieces. Inspiration and feedback welcome.', '📸', 'amber', null, 16),
  ('industry-news', 'community', 'Industry News & Discussion', 'React to industry news, market changes, new products, and anything happening in the trade', '📰', 'blue', null, 17),
  ('site-feedback', 'community', 'Site Feedback & Suggestions', 'Ideas for improving GrainHub — new features, forum categories, wiki topics, or anything else. We read everything.', '💬', 'gray', null, 18)
on conflict (id) do update set group_id = excluded.group_id, name = excluded.name, description = excluded.description, icon = excluded.icon, icon_color = excluded.icon_color, trade = excluded.trade, display_order = excluded.display_order;

-- suppliers
insert into public.suppliers (name, slug, category, trade, logo_initials, description, rating, review_count, badges, is_verified, is_approved) values
  ('Julius Blum GmbH', 'julius-blum-gmbh', 'Cabinet Hardware', 'hardware-accessories', 'Bl', '', 4.9, 1284, '{"⭐ Platinum Sponsor","✓ Verified","Manufacturer"}'::text[], true, true),
  ('Hettich America', 'hettich-america', 'Hinges & Runners', 'hardware-accessories', 'He', '', 4.8, 892, '{"✓ Verified","Manufacturer"}'::text[], true, true),
  ('Grass America', 'grass-america', 'Drawer Systems', 'hardware-accessories', 'Gr', '', 4.7, 756, '{"✓ Verified","Manufacturer"}'::text[], true, true),
  ('Salice America', 'salice-america', 'European Hinges', null, 'Sa', '', 4.7, 634, '{"✓ Verified","Distributor"}'::text[], true, true)
on conflict (slug) do update set name = excluded.name, category = excluded.category, trade = excluded.trade, logo_initials = excluded.logo_initials, description = excluded.description, rating = excluded.rating, review_count = excluded.review_count, badges = excluded.badges;

-- After your first signup, promote yourself: update public.profiles set role = 'admin' where username like 'yourname%';
