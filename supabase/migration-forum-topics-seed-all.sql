-- ============================================================
-- migration-forum-topics-seed-all.sql
--
-- Seeds an initial set of topics under every category that
-- benefits from finer-grained filing. Idempotent via the
-- (category_id, slug) unique constraint.
--
-- Convention:
--   sponsor_tier_min = 'platinum'  → brand / vendor topics that
--                                    a paying sponsor can claim.
--   sponsor_tier_min = NULL        → generic community topic,
--                                    not claimable.
-- ============================================================

insert into public.forum_topics (category_id, name, slug, description, icon, sponsor_tier_min) values
  -- ── Trade Skills & Craft ─────────────────────────────────
  ('cabinet-making',         'Frameless construction',     'frameless',          'Euro-style 32mm system, full-overlay doors, line boring.',          '📐', null),
  ('cabinet-making',         'Face-frame construction',    'face-frame',         'American face-frame boxes, traditional joinery, scribe trim.',     '📐', null),
  ('cabinet-making',         'Inset doors',                'inset',              'Reveal lines, bumpers, hinge geometry for inset cabinetry.',        '🚪', null),
  ('cabinet-making',         'Drawers & boxes',            'drawers',            'Box construction, drawer fronts, slide selection and install.',     '📦', null),

  ('architectural-millwork', 'Crown moulding',             'crown',              'Sprung profiles, returns, miter compounds, scarf joints.',          '🏛',  null),
  ('architectural-millwork', 'Wainscoting & paneling',     'wainscoting',        'Frame-and-panel walls, beadboard, raised panel proportions.',       '🏛',  null),
  ('architectural-millwork', 'AWI Premium / Custom grade', 'awi-grades',         'Quality grading, scribing tolerances, finish standards.',           '📋', null),
  ('architectural-millwork', 'Coffered ceilings',          'coffered-ceilings',  'Box-beam grids, layout, lighting integration.',                     '🏛',  null),

  ('finishing-coatings',     'Lacquer',                    'lacquer',            'Pre-cat, post-cat, nitro — handling, blushing, recoats.',           '🎨', null),
  ('finishing-coatings',     'Conversion varnish',         'conversion-varnish', 'CV curing, pot life, intercoat adhesion, white-pigment yellowing.', '🎨', null),
  ('finishing-coatings',     'Water-based finishes',       'water-based',        'WB top coats, grain raise, dry times, recoat windows.',             '🎨', null),
  ('finishing-coatings',     'Spray equipment',            'spray-equipment',    'HVLP vs AAA, gun setup, fluid tips, booth requirements.',           '🛠',  null),
  ('finishing-coatings',     'Stains & dyes',              'stains-dyes',        'Wiping stains, NGR dyes, glaze, toning, color matching.',           '🎨', null),

  ('wood-species',           'White oak',                  'white-oak',          'Quartersawn, rift, plain — pricing, drying, finishing.',            '🪵', null),
  ('wood-species',           'Walnut',                     'walnut',             'Black walnut sourcing, sapwood, color steaming.',                   '🪵', null),
  ('wood-species',           'Hard maple',                 'hard-maple',         'Color sorting, tearout, finishing maple without blotch.',           '🪵', null),
  ('wood-species',           'Cherry',                     'cherry',             'UV darkening, color matching new to old, finishing schedules.',     '🪵', null),
  ('wood-species',           'Edge banding',               'edge-banding',       'PUR vs EVA, PVC vs ABS vs wood, application equipment.',            '🧷', null),

  ('hand-tools',             'Hand planes',                'hand-planes',        'Bench planes, blocks, scrapers, tuning, restoration.',              '🪚', null),
  ('hand-tools',             'Chisels',                    'chisels',            'Bench chisels, mortise, paring — sharpening and use.',              '🪚', null),
  ('hand-tools',             'Joinery saws',               'joinery-saws',       'Western and Japanese saws, dovetails, tenons.',                     '🪚', null),
  ('hand-tools',             'Sharpening',                 'sharpening',         'Waterstones, oilstones, diamond, jigs, geometry.',                  '🪨', null),

  -- ── Machines & Technology ────────────────────────────────
  ('cnc-routers',            'Biesse',                     'biesse',             'Rover, Skipper, Brema setup, BSolid, post-processors.',             '🖥', 'platinum'),
  ('cnc-routers',            'SCM',                        'scm',                'Morbidelli, Tech, Author — Maestro, machining cycles.',             '🖥', 'platinum'),
  ('cnc-routers',            'Thermwood',                  'thermwood',          'Cut Center, eCabinet integration, vacuum hold-down.',               '🖥', 'platinum'),
  ('cnc-routers',            'MultiCam',                   'multicam',           'M-Series, V-Series, EZ Control, post setup.',                       '🖥', 'platinum'),
  ('cnc-routers',            'AXYZ / CNC Factory',         'axyz',               'AXYZ Series 4000, Pacer, Z7 setup and maintenance.',                '🖥', 'platinum'),
  ('cnc-routers',            'Vortex spindles',            'vortex',             'Vortex tooling, ATC, runout, troubleshooting.',                     '⚙', 'platinum'),

  ('edge-banders',           'SCM Olimpic',                'scm-olimpic',        'K-series PUR setup, glue-pot cleaning, between-shift care.',        '🔧', 'platinum'),
  ('edge-banders',           'Biesse Akron / Stream',      'biesse-eb',          'Stream B and Akron config, edge-quality troubleshooting.',          '🔧', 'platinum'),
  ('edge-banders',           'Homag',                      'homag',              'Ambition / KAL / KAR — laserTec, airTec, glue feed.',               '🔧', 'platinum'),
  ('edge-banders',           'IMA',                        'ima',                'IMA / Schelling combos, integrated lines.',                         '🔧', 'platinum'),

  ('software-tools',         'Microvellum',                'microvellum',        'Library work, ribbon scripts, post-processor questions.',           '📐', 'platinum'),
  ('software-tools',         'Cabinet Vision',             'cabinet-vision',     'CV setup, post processors, UCS, library work, migration.',         '📐', 'platinum'),
  ('software-tools',         'KCDw',                       'kcdw',               'KCDw users — tips, troubleshooting, library tweaks.',               '📐', 'platinum'),
  ('software-tools',         'Mozaik',                     'mozaik',             'Mozaik plus its parametric scripting and report tools.',            '📐', 'platinum'),
  ('software-tools',         'AutoCAD / SketchUp',         'autocad-sketchup',   'Drafting workflows, 3D modeling for shop drawings.',                '💻', null),
  ('software-tools',         'ERP & shop management',      'erp',                'JobBOSS, E2 Shop, Odoo, custom shop-floor systems.',                '📊', null),

  ('shop-automation',        'RFID & barcoding',           'rfid',               'Tag systems, scanner workflows, inventory integration.',            '🏷', null),
  ('shop-automation',        'Lean manufacturing',         'lean',               'Cell layout, Kanban, value-stream mapping in shops.',               '📈', null),
  ('shop-automation',        'Material flow',              'material-flow',      'Conveyors, return systems, in-feed/out-feed at the saw.',           '🚚', null),
  ('shop-automation',        'Pneumatic & dust ducting',   'ducting',            'Duct sizing, blast gates, drop runs, balancing.',                   '💨', null),

  -- ── Running a Shop ───────────────────────────────────────
  ('estimating',             'Bid strategy',               'bid-strategy',       'Win/loss analysis, target margins, walking away from work.',       '📊', null),
  ('estimating',             'Labor rates',                'labor-rates',        'Burdened rates, regional benchmarks, productivity targets.',        '⏱', null),
  ('estimating',             'Material costs & markups',   'material-costs',     'Markup vs margin, supplier pricing, scrap allowances.',             '💲', null),
  ('estimating',             'Project management',         'pm',                 'Schedules, change orders, RFIs, submittal logs.',                   '📋', null),

  ('hiring-workforce',       'Apprenticeships',            'apprenticeships',    'Trade school partnerships, internal apprentice tracks.',            '👥', null),
  ('hiring-workforce',       'Compensation & benefits',    'comp',               'Wage benchmarks, profit sharing, PTO, healthcare in shops.',        '💰', null),
  ('hiring-workforce',       'Training programs',          'training',           'Cross-training, certifications, manufacturer training.',            '🎓', null),
  ('hiring-workforce',       'Shop culture',               'culture',            'Retention, expectations, communication, safety culture.',           '🤝', null),

  ('standards-codes',        'AWI',                        'awi',                'AWS Quality Standards Illustrated — premium vs custom.',           '📋', null),
  ('standards-codes',        'KCMA',                       'kcma',               'KCMA testing, environmental certification, sticker programs.',     '📋', null),
  ('standards-codes',        'CARB',                       'carb',               'CARB Phase 2/3 compliance, Title VI, supplier certs.',              '📋', null),
  ('standards-codes',        'OSHA',                       'osha',               'Recordkeeping, GHS, lockout/tagout, walking-working surfaces.',     '⚠', null),
  ('standards-codes',        'ADA',                        'ada',                'ADA-compliant cabinetry, reach ranges, knee clearance.',            '♿', null),

  ('safety-dust',            'Dust collection systems',    'dust-collection',    'Cyclones, baghouses, ductwork balancing, NFPA 664.',                '💨', null),
  ('safety-dust',            'Respiratory PPE',            'respiratory',        'Half/full-face respirators, PAPR, fit testing.',                    '🛡', null),
  ('safety-dust',            'Fire suppression',           'fire',               'Spark detection, abort gates, sprinklers in dust environments.',    '🔥', null),
  ('safety-dust',            'OSHA compliance',            'osha-compliance',    'Wood dust PEL, hearing conservation, machine guarding.',            '⚠', null),

  ('sales-marketing',        'Houzz & social',             'houzz',              'Houzz pro, Instagram, project portfolios.',                         '📸', null),
  ('sales-marketing',        'Lead generation',            'leads',               'Inbound funnels, designer relationships, SEO.',                     '📈', null),
  ('sales-marketing',        'Working with designers',     'designers',          'Communication, drawings, change-order discipline.',                 '🤝', null),
  ('sales-marketing',        'Pricing strategy',           'pricing-strategy',   'Value-based pricing, anchoring, walking away from low-bid.',         '💲', null),

  -- ── Community & Off-Topic ────────────────────────────────
  ('industry-news',          'IWF Atlanta',                'iwf',                'IWF show coverage, must-see exhibits, deals.',                      '📅', null),
  ('industry-news',          'AWFS Las Vegas',             'awfs',                'AWFS Fair coverage, Vegas show notes.',                            '📅', null),
  ('industry-news',          'Market & supply chain',      'market',             'Lumber pricing, hardware availability, freight.',                   '📊', null)
on conflict (category_id, slug) do nothing;
