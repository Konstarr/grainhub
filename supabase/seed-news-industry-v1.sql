-- ============================================================================
-- 10 industry articles for /news — millwork, cabinet, woodworking business.
-- Each article includes inline references and a "Sources & further reading"
-- section at the end with real, verifiable citations.
--
-- Citation policy:
--   * U.S. government sources (BLS, EPA, Census, USDA, CFR) are public-domain
--     and freely usable.
--   * Trade-association programs (AWI, KCMA, NKBA, AHEC) are referenced by
--     name with a link to their public landing page; do NOT reproduce their
--     proprietary report text.
--   * Trade publications (FDMC, Custom Woodworking Business, Closets &
--     Organized Storage, Hardwood Market Report) are named with their
--     publisher's URL; readers should consult them directly for specifics.
--   * Vendor product pages (Blum, Hettich, Cabinet Vision, etc.) are public
--     reference material.
--
-- Idempotent: ON CONFLICT (slug) DO NOTHING. Re-running is safe.
-- ============================================================================

insert into public.news_articles
  (title, slug, category, trade, excerpt, body, is_published, published_at)
values

-- ----------------------------------------------------------------------------
-- 1. Industry — Skilled labor shortage
-- ----------------------------------------------------------------------------
(
  'The Skilled Labor Squeeze: Why Millwork Shops Are Building Their Own Apprentice Pipelines',
  'skilled-labor-squeeze-millwork-apprentice-pipelines',
  'Industry',
  'cabinetmaker',
  'Cabinet shops face one of the tightest labor markets in a generation. The shops growing through it have stopped waiting for trade schools and started building their own benchmen, often through formalized U.S. Department of Labor Registered Apprenticeships.',
  $$
<p class="lead">The U.S. Bureau of Labor Statistics tracks Cabinetmakers and Bench Carpenters under occupation code SOC 51-7011 in the Occupational Employment and Wage Statistics (OEWS) program. The headline number — total employment in the occupation — has been roughly flat for over a decade, even as residential and commercial construction activity has grown. The shops trying to staff up against that constrained pool have largely converged on a single solution: stop hiring, start training.</p>

<h2>What the BLS data actually shows</h2>
<p>According to the BLS Occupational Outlook Handbook entry for Woodworkers (which covers cabinetmakers, furniture finishers, and sawing-machine operators), employment of woodworkers is projected to grow only modestly over the coming decade, while replacement-need openings — workers exiting the field — drive most annual job openings. In other words: the gap is not new growth in the trade. It is the steady departure of experienced workers who are not being backfilled at the same pace.</p>
<p>Wage data from the BLS OEWS program shows median hourly wages for Cabinetmakers and Bench Carpenters that vary widely by state and metro area. A shop building a wage scale should pull the metro-specific OEWS data for its region rather than relying on national medians.</p>

<h2>The DOL Registered Apprenticeship pathway</h2>
<p>The U.S. Department of Labor's Office of Apprenticeship maintains formal occupational frameworks for several cabinet and millwork roles, including Cabinetmaker (RAPIDS code 0067) and Architectural Woodworker. Registered Apprenticeship is a structured employer-driven model: the apprentice works full time at progressively higher wages while completing a documented set of competencies and a related instruction component.</p>
<p>Two practical advantages of formal registration through apprenticeship.gov:</p>
<ul>
  <li>The apprentice earns a portable, federally recognized credential.</li>
  <li>Many states offer employer tax credits for sponsoring registered apprentices — the specifics vary by state and are listed at apprenticeship.gov under "State Resources."</li>
</ul>

<h2>The Woodwork Career Alliance credential</h2>
<p>For shops that want a credential without the full DOL apprenticeship registration, the Woodwork Career Alliance (WCA) maintains a Skill Standards system used by several state CTE programs and trade schools. WCA's Passport credential is portable across employers and is recognized in the AWI Quality Certification Program (QCP) framework as a pathway for qualified labor on certified projects.</p>

<h2>Building an in-house pipeline</h2>
<p>Beyond the formal credentials, shops that successfully grow benchmen tend to share a small set of practical decisions:</p>
<ul>
  <li>A defined progression — apprentice, journeyman, lead, foreman — with documented competency milestones.</li>
  <li>A designated mentor for each new hire, protected from production pressure.</li>
  <li>An entry wage high enough to compete with adjacent industries (a useful local benchmark is the OEWS 25th-percentile wage for SOC 51-7011 in your metro).</li>
  <li>An informal curriculum covering shop math, materials, hardware, finishing, and basic CAD.</li>
  <li>Raises tied to demonstrated competency rather than tenure alone.</li>
</ul>

<h2>Industry context</h2>
<p>The Kitchen Cabinet Manufacturers Association (KCMA) publishes member-facing workforce surveys; trade publications including <em>FDMC</em> (Furniture Design & Manufacturing Custom) and <em>Custom Woodworking Business</em> regularly cover cabinet-shop hiring trends. Shop owners building a hiring strategy should consult their state workforce-development office for current apprenticeship tax credits and on-the-job training reimbursement programs, which change year to year.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.bls.gov/ooh/production/woodworkers.htm" target="_blank" rel="noopener">U.S. Bureau of Labor Statistics — Occupational Outlook Handbook: Woodworkers</a></li>
  <li><a href="https://www.bls.gov/oes/current/oes517011.htm" target="_blank" rel="noopener">BLS Occupational Employment and Wage Statistics: 51-7011 Cabinetmakers and Bench Carpenters</a></li>
  <li><a href="https://www.apprenticeship.gov" target="_blank" rel="noopener">U.S. Department of Labor — Apprenticeship.gov</a></li>
  <li><a href="https://woodworkcareer.org" target="_blank" rel="noopener">Woodwork Career Alliance — Skill Standards &amp; Passport credential</a></li>
  <li><a href="https://www.kcma.org" target="_blank" rel="noopener">Kitchen Cabinet Manufacturers Association (KCMA)</a></li>
  <li><a href="https://www.woodworkingnetwork.com/fdmc" target="_blank" rel="noopener">FDMC — trade coverage of cabinet-shop labor trends</a></li>
</ul>
$$,
  true,
  now() - interval '2 days'
),

-- ----------------------------------------------------------------------------
-- 2. Markets — Healthcare millwork
-- ----------------------------------------------------------------------------
(
  'Healthcare Construction Is One of the Most Stable Custom-Millwork Markets',
  'healthcare-construction-stable-custom-millwork-market',
  'Markets',
  'cabinetmaker',
  'Residential cabinet demand swings with mortgage rates. Healthcare construction does not. The U.S. Census Bureau''s monthly construction spending report consistently shows healthcare as one of the more resilient nonresidential sectors, and shops able to navigate hospital-grade specs find steady, well-priced work.',
  $$
<p class="lead">The U.S. Census Bureau publishes monthly Total Construction Spending data (the C-30 series) broken out by sector, including a healthcare line under "Health care." Shops looking for evidence of where the steady millwork demand lives should pull the most recent C-30 release directly — healthcare construction has been one of the more consistent nonresidential lines in that series.</p>

<h2>Why healthcare buys custom</h2>
<p>Hospital, surgery-center, and life-sciences-lab projects rarely repeat room layouts. Medical equipment, plumbing rough-ins, and code-driven clearances vary by service line, which means casework is shop-drawn from architectural drawings rather than ordered from a stock catalog. The general contractor on a healthcare project sources casework from architectural millwork shops, not from kitchen-and-bath dealers.</p>

<h2>The specifications a healthcare project will list</h2>
<p>Healthcare casework specifications are not categorically harder than residential — they are longer, more documented, and more strictly enforced. Common spec elements include:</p>
<ul>
  <li><strong>High-pressure laminate (HPL) interiors and exteriors</strong> — typical brand names include Wilsonart, Formica, and Pionite.</li>
  <li><strong>AWI Quality Certification Program (QCP) Custom or Premium grade</strong> on most institutional and many commercial projects.</li>
  <li><strong>Solid surface countertops with integrated coved sinks</strong> — Corian, Avonite, LG HI-MACS, and equivalent products.</li>
  <li><strong>Phenolic resin or epoxy resin tops</strong> on chemistry, pathology, and life-sciences laboratory benches.</li>
  <li><strong>Lockable, keyed-alike drawer and door hardware</strong> with documented load ratings, typically Blum or Hettich.</li>
  <li><strong>Antimicrobial laminate or copper-infused surfaces</strong> on patient-contact areas (Wilsonart's AEON line and similar competing products).</li>
</ul>
<p>The reference standard for Custom and Premium grade is the AWI Architectural Woodwork Standards (AWS), which the AWI sells through awinet.org. Any shop submitting on a healthcare project should have a current copy in the office.</p>

<h2>Surgery centers and outpatient clinics as the entry point</h2>
<p>Major academic medical center patient-tower work usually requires bonding capacity and union compliance that put it outside the reach of small to mid-size shops. The accessible entry points are ambulatory surgery centers, medical office buildings, dialysis centers, urgent-care clinics, dental specialty offices, and outpatient imaging centers. Project values for casework on those projects commonly fall in a six-figure-to-low-seven-figure range.</p>

<h2>Lab casework as a high-margin niche</h2>
<p>Within healthcare, laboratory casework — chemistry benches, pathology stations, suspended cabinet hangers on slotted standards — is the highest-margin specialty and the one with the fewest qualified competitors in any given regional market. The reference industry standard for laboratory casework manufacturing is the Scientific Equipment and Furniture Association (SEFA) recommended practices, particularly SEFA 8 (laboratory casework). Architects spec'ing labs frequently call out SEFA 8 compliance directly.</p>

<h2>How to break in</h2>
<p>Two reliable paths exist. The first is to get on the bidder list of a single general contractor that specializes in medical work and prove the shop on a small clinic build-out or single-floor renovation. The second is to subcontract under a larger millwork firm on a healthcare project as a feeder shop, learning the spec on someone else's risk before bidding direct.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.census.gov/construction/c30/c30index.html" target="_blank" rel="noopener">U.S. Census Bureau — Construction Spending (C-30 series)</a></li>
  <li><a href="https://www.awinet.org" target="_blank" rel="noopener">Architectural Woodwork Institute (AWI) — AWS standards &amp; QCP</a></li>
  <li><a href="https://qcp.org" target="_blank" rel="noopener">AWI Quality Certification Program (QCP)</a></li>
  <li><a href="https://www.sefalabs.com" target="_blank" rel="noopener">Scientific Equipment and Furniture Association (SEFA) — recommended practices</a></li>
  <li><a href="https://www.aia.org/resources/10046-the-architecture-billings-index" target="_blank" rel="noopener">AIA Architecture Billings Index — sector breakdown including Institutional</a></li>
  <li><a href="https://www.ashe.org" target="_blank" rel="noopener">American Society for Healthcare Engineering (ASHE)</a></li>
</ul>
$$,
  true,
  now() - interval '4 days'
),

-- ----------------------------------------------------------------------------
-- 3. Materials — Hardwood lumber
-- ----------------------------------------------------------------------------
(
  'Where to Get Real Hardwood Lumber Pricing Data',
  'where-to-get-real-hardwood-lumber-pricing-data',
  'Materials',
  'cabinetmaker',
  'Hardwood lumber pricing has not stabilized so much as it has redefined itself. Shops trying to stay ahead need to read the real data sources — Hardwood Market Report, AHEC export statistics, and USDA Forest Service publications — rather than relying on what their supplier rep says on the phone.',
  $$
<p class="lead">Hardwood lumber pricing is published in several primary sources. The most widely cited industry pricing service is <em>Hardwood Market Report</em> (HMR), a paid weekly publication that has been the reference for kiln-dried hardwood lumber pricing in North America for decades. The American Hardwood Export Council (AHEC) publishes free export statistics on a monthly basis. The USDA Forest Service's Northern Research Station publishes hardwood market reviews and stumpage price data on a quarterly basis.</p>

<h2>White oak: the dominant species request</h2>
<p>White oak demand was elevated through the late 2010s and into the 2020s, driven by both North American residential design trends and strong export demand from European cooperage and flooring buyers. The American Hardwood Export Council (AHEC) tracks white oak export volume and value in its monthly statistics; readers can see the pull from European markets directly in those reports.</p>
<p>White oak supply responds slowly. Mature trees in the rift and quartered specifications most commonly requested by designers represent harvest decisions made 60+ years ago, and silvicultural practices today will not affect the supply chain for years. Shops planning around white oak availability should expect periodic tightness in the FAS 5/4 and 8/4 categories rather than reliable supply at low prices.</p>

<h2>Walnut volatility</h2>
<p>Black walnut pricing is more volatile than white oak, primarily because demand swings with residential design fashion on a roughly five-year cycle while supply is comparatively stable. Shops that carry a small inventory of FAS walnut through fashion troughs tend to do better than shops that buy reactively when designer demand peaks.</p>

<h2>Cherry, maple, and the workhorse hedge</h2>
<p>Hard maple remains the most useful hardwood in cabinet shops doing painted casework — which has been the dominant residential finish call for nearly a decade per <em>NKBA Design Trends</em> reports. Soft maple is a viable substitute on most painted applications and typically prices below hard maple per board foot. Cherry has been quietly returning to design specifications, particularly on the East Coast, after a long period of being out of fashion.</p>

<h2>Buying tactics for shops under 25 employees</h2>
<ul>
  <li><strong>Buy in packs and rough-mill in batches.</strong> A 1,000-board-foot pack run through the rough mill in one day yields better quality control and lower per-foot cost than buying piecemeal.</li>
  <li><strong>Maintain relationships with two suppliers in different regions.</strong> When one mill cannot fill an order on time, the second can. This matters most on white oak.</li>
  <li><strong>Quote with a contingency on hardwood pricing.</strong> A material contingency line item — often expressed as a percentage on the proposal — protects the shop on any project that takes more than 60 days from quote to cut.</li>
</ul>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.hmr.com" target="_blank" rel="noopener">Hardwood Market Report (HMR) — kiln-dried hardwood lumber pricing</a> (paid subscription)</li>
  <li><a href="https://www.americanhardwood.org" target="_blank" rel="noopener">American Hardwood Export Council (AHEC) — monthly export statistics</a></li>
  <li><a href="https://www.fs.usda.gov/research/nrs" target="_blank" rel="noopener">USDA Forest Service Northern Research Station — hardwood market reports</a></li>
  <li><a href="https://www.nhla.com" target="_blank" rel="noopener">National Hardwood Lumber Association (NHLA) — grading rules</a></li>
  <li><a href="https://nkba.org/research" target="_blank" rel="noopener">NKBA Design Trends — kitchen and bath finish trend reports</a></li>
</ul>
$$,
  true,
  now() - interval '6 days'
),

-- ----------------------------------------------------------------------------
-- 4. Machinery — CNC nested-base
-- ----------------------------------------------------------------------------
(
  'Nested-Base Manufacturing: Why CNC Routers Have Become the Default for Production Cabinet Shops',
  'nested-base-manufacturing-default-cabinet-shops',
  'Machinery',
  'cabinetmaker',
  'A CNC router, panel saw, and labeling printer can redefine what a 10-person cabinet shop produces. The math on yield and assembly labor — covered regularly in trade publications like FDMC and Custom Woodworking Business — increasingly favors nested-base over traditional cabinet construction.',
  $$
<p class="lead">Nested-base manufacturing — cutting every part of a cabinet from a single sheet of substrate on a CNC router with all hardware drilling done in the same pass — has gone from specialty technique to default production method in a decade. The trade press has covered the transition extensively; readers tracking the topic should follow <em>FDMC</em>, <em>Custom Woodworking Business</em>, <em>Closets &amp; Organized Storage</em>, and the Association of Woodworking &amp; Furnishings Suppliers (AWFS) trade-show publications.</p>

<h2>What nested-base actually is</h2>
<p>In nested-base production, the CNC router cuts every part for a cabinet — sides, bottom, top, stretchers, back, and shelves — from a single sheet of 3/4-inch prefinished plywood, melamine, or particleboard in one pass. The router also drills every dowel hole, shelf-pin hole, hinge cup, and assembly hole, and labels each part with a barcode or printed sticker.</p>
<p>The cabinet then assembles dry-fit, no jig required, because every joint location is precisely indexed by holes the router drilled. A two-person team can assemble a finished kitchen in a fraction of the labor face-frame, dado-and-rabbet construction required.</p>

<h2>The economic case</h2>
<p>The case for nested-base rests on three operational claims commonly cited in vendor and trade-publication coverage. Shops should validate them against their own data:</p>
<ul>
  <li><strong>Sheet yield.</strong> Nesting algorithms typically pack parts on the sheet more densely than a human cutting workflow. Vendors of nesting software including Cabinet Vision, Microvellum, KCDw, and Mozaik publish case studies on yield improvement; shops should request specifics for their own job mix.</li>
  <li><strong>Assembly labor.</strong> Dowel-and-screw nested-base assembly is faster than traditional dado-and-rabbet. The exact differential is shop-specific.</li>
  <li><strong>Quality consistency.</strong> Every box is identical because every hole was drilled by the same machine to the same coordinates.</li>
</ul>

<h2>The software stack</h2>
<p>The CNC router is the visible part of nested-base. The software is the more consequential part:</p>
<ul>
  <li><strong>Cabinet Vision (Hexagon AB)</strong> — pairs with S2M Center for direct CNC output. Industry standard for production shops.</li>
  <li><strong>Microvellum</strong> — runs on AutoCAD, preferred by architectural-millwork firms with AutoCAD-trained engineers.</li>
  <li><strong>KCDw</strong> — strong in small-to-mid custom shops; reasonable price.</li>
  <li><strong>Mozaik</strong> — fast-growing, attractive licensing, strong CNC integration.</li>
</ul>

<h2>When traditional construction still wins</h2>
<p>Nested-base is not always the right answer. High-end residential face-frame work in cherry or walnut, where visible faces are solid wood and construction is dado-and-rabbet, derives smaller benefits from nested-base. Truly custom architectural millwork — paneled walls, curved counters, unusual geometry — generally lives outside the nested-base envelope.</p>

<h2>Capital math</h2>
<p>Capable entry-level production CNC routers from established manufacturers (Anderson, AXYM, Biesse, C.R. Onsrud, ShopSabre, Thermwood) are widely advertised in <em>FDMC</em>, <em>Custom Woodworking Business</em>, and at AWFS Fair. Pricing varies with table size, vacuum table type, and tool-changer specification. Shops should request quotes from at least three vendors and ask for ROI references from existing customers in similar work.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.woodworkingnetwork.com/fdmc" target="_blank" rel="noopener">FDMC — Furniture Design &amp; Manufacturing Custom</a></li>
  <li><a href="https://www.woodworkingnetwork.com/custom-woodworking-business" target="_blank" rel="noopener">Custom Woodworking Business</a></li>
  <li><a href="https://www.woodworkingnetwork.com/closets" target="_blank" rel="noopener">Closets &amp; Organized Storage</a></li>
  <li><a href="https://www.awfs.org" target="_blank" rel="noopener">Association of Woodworking &amp; Furnishings Suppliers (AWFS Fair)</a></li>
  <li><a href="https://www.cabinetvision.com" target="_blank" rel="noopener">Cabinet Vision (Hexagon AB)</a></li>
  <li><a href="https://www.microvellum.com" target="_blank" rel="noopener">Microvellum</a></li>
  <li><a href="https://www.kcdw.com" target="_blank" rel="noopener">KCDw Cabinet Software</a></li>
  <li><a href="https://www.mozaiksoftware.com" target="_blank" rel="noopener">Mozaik Software</a></li>
</ul>
$$,
  true,
  now() - interval '8 days'
),

-- ----------------------------------------------------------------------------
-- 5. Software — Cabinet design software
-- ----------------------------------------------------------------------------
(
  'A Practical Guide to Cabinet Design Software',
  'practical-guide-cabinet-design-software',
  'Software',
  'cabinetmaker',
  'Cabinet Vision, Microvellum, KCDw, and Mozaik dominate the cabinet-design software category. Each vendor publishes detailed product information; shops should evaluate against their actual work mix rather than against a trade-show demo.',
  $$
<p class="lead">The cabinet-design software a shop chooses will shape its bidding, engineering, cutting, and assembly for years. Each major vendor publishes detailed product documentation on its website, which is the most reliable starting point for evaluation. The four packages dominating the U.S. market are Cabinet Vision (Hexagon AB), Microvellum, KCDw, and Mozaik.</p>

<h2>Two questions that decide everything</h2>
<p><strong>What kind of work does the shop do?</strong> A residential kitchen-and-bath shop has different software needs than an architectural millwork firm doing commercial casework. A 5-person custom shop has different needs than a 50-person production shop.</p>
<p><strong>Who is going to use it?</strong> If engineering is done by an owner-operator already comfortable with AutoCAD, the shortlist looks different from a shop hiring a full-time CAD operator. Software depth and learning curve are inversely correlated.</p>

<h2>Cabinet Vision (Hexagon AB)</h2>
<p>Cabinet Vision is the most widely deployed software in U.S. production cabinet shops. The package pairs with S2M Center for direct CNC output and integrates with a wide range of routers. The user interface and learning curve are demanding; vendor-published implementation timelines and customer references should be requested as part of any evaluation. Product information at <a href="https://www.cabinetvision.com" target="_blank" rel="noopener">cabinetvision.com</a>.</p>

<h2>Microvellum</h2>
<p>Microvellum runs on AutoCAD, which is its principal differentiator. For shops staffed with AutoCAD-trained CAD operators, the AutoCAD foundation is the smoothest path. Common in commercial architectural-millwork firms. Product information at <a href="https://www.microvellum.com" target="_blank" rel="noopener">microvellum.com</a>.</p>

<h2>KCDw</h2>
<p>KCDw has been a default for small-to-mid custom shops for over two decades. Friendlier learning curve than Cabinet Vision or Microvellum; reasonable price; solid CNC output for shops doing nested-base. Product information at <a href="https://www.kcdw.com" target="_blank" rel="noopener">kcdw.com</a>.</p>

<h2>Mozaik</h2>
<p>Mozaik has been the fastest-growing entrant in the U.S. market over the last several years. Strong CNC integration, attractive rendering output for client presentations, friendly licensing model for small shops. Product information at <a href="https://www.mozaiksoftware.com" target="_blank" rel="noopener">mozaiksoftware.com</a>.</p>

<h2>AutoCAD plus cabinet plug-ins</h2>
<p>For very small shops where the owner-operator is doing all engineering personally, AutoCAD with a cabinet plug-in (Polyboard, eCabinet Systems, or others) remains a viable approach for low-volume work. It is not optimized for nested-base CNC production at scale.</p>

<h2>Total cost of ownership</h2>
<ul>
  <li><strong>Training time.</strong> Six months of partial productivity from engineering staff is expensive in real dollars.</li>
  <li><strong>Library setup.</strong> Building out the shop's standard cabinet construction, hardware, and finish libraries inside the new package is a substantial up-front project.</li>
  <li><strong>Annual maintenance.</strong> Most packages now run on subscription or annual maintenance plans; per-seat figures are listed by each vendor on request.</li>
  <li><strong>Switching costs.</strong> Once team and standards are inside one package, moving resets the above to zero.</li>
</ul>
<p>Run any candidate package on three real jobs from your last quarter before signing. Vendor demo data is engineered to make the software look easy.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.cabinetvision.com" target="_blank" rel="noopener">Cabinet Vision (Hexagon AB)</a></li>
  <li><a href="https://www.microvellum.com" target="_blank" rel="noopener">Microvellum</a></li>
  <li><a href="https://www.kcdw.com" target="_blank" rel="noopener">KCDw Cabinet Software</a></li>
  <li><a href="https://www.mozaiksoftware.com" target="_blank" rel="noopener">Mozaik Software</a></li>
  <li><a href="https://www.autodesk.com/products/autocad/overview" target="_blank" rel="noopener">Autodesk AutoCAD</a></li>
  <li><a href="https://www.woodworkingnetwork.com" target="_blank" rel="noopener">Woodworking Network — software coverage in FDMC and Custom Woodworking Business</a></li>
</ul>
$$,
  true,
  now() - interval '10 days'
),

-- ----------------------------------------------------------------------------
-- 6. Hardware — Soft-close
-- ----------------------------------------------------------------------------
(
  'Soft-Close Hardware: Why It Is the Spec, Not the Upgrade',
  'soft-close-hardware-spec-not-upgrade',
  'Hardware',
  'cabinetmaker',
  'European cabinet hardware — Blum, Hettich, Salice, Grass, Hafele — has consolidated around soft-close as the baseline product. Specifications and load ratings are published in each manufacturer''s technical literature.',
  $$
<p class="lead">A decade ago, soft-close hinges and undermount drawer slides were the upgrade line on a kitchen quote. Today they are baseline expectation, written into the spec on most residential cabinetry. The change has been documented in NKBA Design Trends reports, KCMA member surveys, and the trade press.</p>

<h2>The market has shifted</h2>
<p>The mass-market cabinet retailers — major stock manufacturers and the cabinet lines at the national home-improvement chains — converted to soft-close hardware as the default several years ago. NKBA's annual <em>Design Trends</em> reports document the consumer-side shift: soft-close is now an expectation, not a feature.</p>

<h2>The five hardware brands worth knowing</h2>
<p>The European cabinet-hardware market is dominated by five companies. Each publishes detailed technical data sheets — load ratings, installation drawings, adjustment specifications — through its public product catalogs:</p>
<ul>
  <li><strong>Blum</strong> (Austria) — Movento and Tandem undermount slides, CLIP top hinges. <a href="https://www.blum.com" target="_blank" rel="noopener">blum.com</a></li>
  <li><strong>Hettich</strong> (Germany) — Quadro slides, Sensys hinges. <a href="https://www.hettich.com" target="_blank" rel="noopener">hettich.com</a></li>
  <li><strong>Salice</strong> (Italy) — strong reputation in framed-cabinet hinges. <a href="https://www.salice.com" target="_blank" rel="noopener">salice.com</a></li>
  <li><strong>Grass</strong> (Austria) — broad product line. <a href="https://www.grass.eu" target="_blank" rel="noopener">grass.eu</a></li>
  <li><strong>Hafele</strong> (Germany) — distributor and manufacturer. <a href="https://www.hafele.com" target="_blank" rel="noopener">hafele.com</a></li>
</ul>

<h2>Undermount versus side-mount</h2>
<p>The functional difference between undermount and side-mount slides is meaningful: undermount slides hide entirely beneath the drawer, deliver soft-close action smoothly, support 75 lb or 100 lb load ratings as standard (per Blum and Hettich technical data), and present cleaner visual lines. Side-mount slides show on the drawer side, generally support lower loads, and are visually cruder. Each manufacturer publishes load-rated specifications; readers should check the data sheet for the specific model number being specified.</p>

<h2>Hinge geometry and door overlay</h2>
<p>Hinge spec interacts with door overlay in ways that affect every cabinet drawing. Half-overlay, full-overlay, and inset doors each require different hinge cups, baseplates, and adjustment ranges. The Blum CLIP top, Hettich Sensys, and Salice 200/700 Series are the dominant hinge platforms; each has slightly different installation logic, screw spacing, and adjustment behavior. Standardizing on one hinge platform across the shop simplifies bench training, parts inventory, and CNC drilling templates.</p>

<h2>The gray-market trap</h2>
<p>Hardware that resembles Blum or Hettich at a lower price point is widely available. Some of it is legitimate Asian-manufactured product to comparable specs; some is counterfeit, mislabeled, or built to specs that fail in service. The Better Business Bureau and the trade press have documented warranty issues with counterfeit cabinet hardware; shops should buy through authorized distribution channels (Blum's authorized dealer list is published at blum.com).</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.blum.com" target="_blank" rel="noopener">Blum — technical data sheets &amp; authorized dealer locator</a></li>
  <li><a href="https://www.hettich.com" target="_blank" rel="noopener">Hettich — product catalog &amp; load ratings</a></li>
  <li><a href="https://www.salice.com" target="_blank" rel="noopener">Salice — product catalog</a></li>
  <li><a href="https://www.grass.eu" target="_blank" rel="noopener">Grass — product catalog</a></li>
  <li><a href="https://www.hafele.com" target="_blank" rel="noopener">Hafele — product catalog</a></li>
  <li><a href="https://nkba.org/research" target="_blank" rel="noopener">NKBA Design Trends — annual kitchen &amp; bath trend report</a></li>
  <li><a href="https://www.kcma.org" target="_blank" rel="noopener">Kitchen Cabinet Manufacturers Association (KCMA)</a></li>
</ul>
$$,
  true,
  now() - interval '12 days'
),

-- ----------------------------------------------------------------------------
-- 7. Finishing — Waterborne
-- ----------------------------------------------------------------------------
(
  'The Quiet Conversion: Why Cabinet Shops Are Moving to Waterborne 2K Finishes',
  'cabinet-shops-moving-to-waterborne-2k-finishes',
  'Finishing',
  'finisher',
  'Conversion varnish has been the default cabinet finish for decades. South Coast AQMD Rule 1136, EPA NESHAP, and a tightening patchwork of state VOC rules have made waterborne 2K an increasingly serious alternative — backed by published manufacturer technical data sheets.',
  $$
<p class="lead">For most of the last thirty years, conversion varnish (CV) has been the default finish for production cabinet shops. The chemistry is mature, the durability is excellent, and the application is well understood. Over the past several years, the regulatory environment around volatile organic compounds (VOCs) — together with maturing waterborne 2K (two-component) chemistry — has pushed an increasing number of shops to convert.</p>

<h2>Why the regulatory environment matters</h2>
<p>Conversion varnish, post-catalyzed lacquers, and pre-cat finishes release a substantial volume of VOCs during cure. Two regulatory frameworks govern this directly:</p>
<ul>
  <li><strong>South Coast Air Quality Management District (SCAQMD) Rule 1136</strong> — Wood Products Coatings — sets VOC content limits for coatings used on wood products in the four-county Southern California region. The current text and limits are published at <a href="https://www.aqmd.gov/docs/default-source/rule-book/reg-xi/r1136.pdf" target="_blank" rel="noopener">aqmd.gov</a>.</li>
  <li><strong>EPA National Emission Standards for Hazardous Air Pollutants (NESHAP) — Wood Products Surface Coating</strong>, codified at 40 CFR Part 63, Subpart QQQQ, addresses HAP emissions from wood-products coatings at major-source facilities.</li>
</ul>
<p>Several Northeast states have additional VOC regulations modeled on or stricter than the SCAQMD limits. Shops should consult their state environmental agency for the specific rules in force.</p>

<h2>Where waterborne 2K stands today</h2>
<p>Waterborne 2K finishes available in 2026 are not the products that gave waterborne a poor reputation in the 1990s. The category has matured. Major suppliers with published technical data sheets include:</p>
<ul>
  <li><strong>Renner Italia</strong> — Aquaplus and Aquaver waterborne 2K lines.</li>
  <li><strong>ICA Group</strong> — Iridea waterborne 2K lacquers.</li>
  <li><strong>Milesi (IVM Chemicals)</strong> — Hydrocryl and Hydroplus.</li>
  <li><strong>Sherwin-Williams</strong> — Kem Aqua waterborne line.</li>
  <li><strong>Becker Industrial Coatings</strong> — waterborne 2K range.</li>
</ul>
<p>Each manufacturer publishes detailed technical data sheets covering pencil hardness, chemical resistance, block resistance, and recommended application parameters. Shops evaluating a switch should request data sheets directly from the supplier and run their own test panels.</p>

<h2>Spray-booth implications</h2>
<p>Switching to waterborne is not free. Application equipment changes (HVLP guns are the dominant choice; air-to-fluid ratios differ; gun cleaning protocols differ; booth airflow and humidity management differ). Shops that have done the conversion well typically report a few weeks of operational disruption while the finishing team rebuilds muscle memory and dials in the spray parameters. Coatings vendors — listed above — publish application guides specific to their products.</p>

<h2>The shops that should not switch yet</h2>
<p>Waterborne is not the right answer for every shop. Shops in jurisdictions where VOC compliance is loose, with deep operator familiarity in CV, with capital tied up in solvent-rated booth equipment, and with no near-term workforce or insurance pressure, are reasonable to continue with conversion varnish. The argument is not that waterborne is universally better. The argument is that the relative position has shifted enough that capital and operations planning over a 5-year horizon should run both numbers honestly.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.aqmd.gov/docs/default-source/rule-book/reg-xi/r1136.pdf" target="_blank" rel="noopener">SCAQMD Rule 1136 — Wood Products Coatings (full text PDF)</a></li>
  <li><a href="https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-63/subpart-QQQQ" target="_blank" rel="noopener">40 CFR Part 63 Subpart QQQQ — NESHAP Wood Products Surface Coating</a></li>
  <li><a href="https://www.renneritalia.com" target="_blank" rel="noopener">Renner Italia — coatings technical data</a></li>
  <li><a href="https://www.icaspa.com" target="_blank" rel="noopener">ICA Group — Iridea technical data</a></li>
  <li><a href="https://www.milesi.com" target="_blank" rel="noopener">Milesi — Hydrocryl &amp; Hydroplus technical data</a></li>
  <li><a href="https://www.sherwin-williams.com/architects-specifiers-designers/products/kem-aqua" target="_blank" rel="noopener">Sherwin-Williams — Kem Aqua line</a></li>
  <li><a href="https://www.epa.gov/stationary-sources-air-pollution/wood-products-surface-coating-national-emission-standards-hazardous" target="_blank" rel="noopener">EPA — Wood Products Surface Coating NESHAP</a></li>
</ul>
$$,
  true,
  now() - interval '14 days'
),

-- ----------------------------------------------------------------------------
-- 8. Regulatory — TSCA Title VI
-- ----------------------------------------------------------------------------
(
  'TSCA Title VI Compliance: What Cabinet Shops Need to Document',
  'tsca-title-vi-compliance-what-cabinet-shops-need-to-document',
  'Regulatory',
  'cabinetmaker',
  'The federal formaldehyde standard for composite wood products is codified at 40 CFR Part 770 and is fully in force. The EPA enforces it. If your shop builds with particleboard, MDF, or hardwood plywood, here is the documentation chain you must be able to produce.',
  $$
<p class="lead">If your cabinet or millwork shop uses particleboard, MDF, or hardwood plywood, you are subject to the federal Formaldehyde Emission Standards for Composite Wood Products under Title VI of the Toxic Substances Control Act (TSCA). The rule is codified at 40 CFR Part 770 and is published in the Code of Federal Regulations. The full text is freely accessible at <a href="https://www.ecfr.gov/current/title-40/chapter-I/subchapter-R/part-770" target="_blank" rel="noopener">ecfr.gov</a>.</p>

<h2>The emission limits</h2>
<p>The emission limits in 40 CFR § 770.10 apply to composite wood products manufactured or imported into the United States:</p>
<ul>
  <li><strong>Hardwood plywood</strong> — 0.05 ppm formaldehyde.</li>
  <li><strong>Medium-density fiberboard (MDF)</strong> — 0.11 ppm.</li>
  <li><strong>Thin MDF</strong> (≤ 8 mm) — 0.13 ppm.</li>
  <li><strong>Particleboard</strong> — 0.09 ppm.</li>
</ul>
<p>These limits are functionally equivalent to California Air Resources Board (CARB) Phase 2 (CARB-2), codified in the California Code of Regulations at 17 CCR § 93120 et seq.</p>

<h2>The compliance chain</h2>
<p>Composite wood products must be tested and certified by an EPA-recognized Third-Party Certifier (TPC). The certified status must be documented through the entire supply chain from manufacturer to the end user that incorporates the panel into a finished product. Labeling requirements are specified in 40 CFR § 770.45.</p>

<h2>Fabricator obligations</h2>
<p>A cabinet shop is, in TSCA Title VI terminology, a "fabricator." The obligations on fabricators are spelled out in 40 CFR § 770.30 and include:</p>
<ul>
  <li>Buying composite wood products only from sources that supply TSCA Title VI compliant material.</li>
  <li>Maintaining records that document the compliant status of received material for at least three years (40 CFR § 770.30(a)).</li>
  <li>Labeling finished goods sold to indicate use of TSCA Title VI compliant material, where applicable.</li>
  <li>Not importing or specifying non-compliant composite wood material.</li>
</ul>
<p>Fabricators are not required to test finished products; the certification responsibility lives with panel manufacturers and importers.</p>

<h2>Audit-ready documentation</h2>
<p>An EPA inspection of a small cabinet shop typically focuses on three things: invoices on recent composite-panel purchases, supplier compliance certifications, and visible labeling on stocked sheet goods. Shops that fail an inspection generally fail on documentation rather than material — they cannot produce records linking the panels in their rack to a recognized TPC.</p>

<h2>The CARB-2 / TSCA Title VI relationship</h2>
<p>Many panel suppliers continue to label products "CARB-2 compliant" rather than "TSCA Title VI compliant." Panels meeting CARB-2 generally also meet TSCA Title VI because the emission limits are functionally identical. EPA inspectors look for documentation that establishes TSCA Title VI compliance specifically; suppliers should be able to confirm both. Reference the EPA TSCA Title VI Final Rule overview at <a href="https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products" target="_blank" rel="noopener">epa.gov</a>.</p>

<h2>Penalties</h2>
<p>The TSCA Title I civil penalty schedule applies, allowing penalties up to a statutory maximum per violation per day for serious cases. EPA enforcement actions historically focus on panel manufacturers and importers more than on small fabricators, but the documentation expectation on fabricators is real and audit-able.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.ecfr.gov/current/title-40/chapter-I/subchapter-R/part-770" target="_blank" rel="noopener">40 CFR Part 770 — Formaldehyde Standards for Composite Wood Products (full text)</a></li>
  <li><a href="https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products" target="_blank" rel="noopener">EPA — Formaldehyde Emission Standards for Composite Wood Products</a></li>
  <li><a href="https://ww2.arb.ca.gov/our-work/programs/composite-wood-products-airborne-toxic-control-measure" target="_blank" rel="noopener">California Air Resources Board — Composite Wood Products ATCM (CARB-2)</a></li>
  <li><a href="https://www.epa.gov/formaldehyde/list-third-party-certifiers-recognized-under-tsca-title-vi" target="_blank" rel="noopener">EPA — Recognized Third-Party Certifiers list</a></li>
</ul>
$$,
  true,
  now() - interval '16 days'
),

-- ----------------------------------------------------------------------------
-- 9. Standards — AWI QCP
-- ----------------------------------------------------------------------------
(
  'AWI Quality Certification Program: Is It Worth It For a Custom Shop?',
  'awi-qcp-is-it-worth-it-for-a-custom-shop',
  'Standards',
  'cabinetmaker',
  'The AWI Quality Certification Program — QCP — is a third-party verification program administered by the Architectural Woodwork Institute. Its full program documentation is published at qcp.org. Custom shops bidding any commercial work need to know how it affects bidder eligibility.',
  $$
<p class="lead">The Architectural Woodwork Institute's Quality Certification Program (QCP) is a third-party verification program for architectural-woodwork projects. Full program rules are published at <a href="https://qcp.org" target="_blank" rel="noopener">qcp.org</a>, and the underlying technical reference is the AWI Architectural Woodwork Standards (AWS), published by AWI through <a href="https://www.awinet.org" target="_blank" rel="noopener">awinet.org</a>.</p>

<h2>What QCP actually certifies</h2>
<p>QCP is not a generic "good shop" stamp. It is a specific verification that, on a specific project, the work was produced and installed to the AWS grade level (Premium, Custom, or Economy) called for in the project specifications, with documented inspection by an AWI-credentialed inspector. Two layers of certification exist — licensed company status (the shop is approved to bid QCP-specified projects) and project-by-project certification (the specific project has been inspected and certified at completion).</p>

<h2>AWS grade levels</h2>
<p>The Architectural Woodwork Standards define three grades. The grade specified in the project documents determines tolerances, materials, joinery, finish defects allowed, and inspection criteria:</p>
<ul>
  <li><strong>Economy grade.</strong> Rare in modern architectural specifications. Used on utility and back-of-house work.</li>
  <li><strong>Custom grade.</strong> The vast majority of commercial millwork is specified at Custom. Tighter tolerances than Economy; better materials and joinery; visible defects limited.</li>
  <li><strong>Premium grade.</strong> The highest level. Used on prestige projects — corporate boardrooms, hotel public spaces, judicial chambers, museum casework. Very tight tolerances, top-tier materials, near-flawless finish.</li>
</ul>
<p>The current edition is AWS 9th Edition. AWI sells the standards through awinet.org.</p>

<h2>The cost of certification</h2>
<p>Becoming a QCP-licensed company involves an application fee, an annual licensing fee, and project inspection fees. Current fee schedules are published at qcp.org. The deeper cost is operational — the shop has to demonstrate it can produce work to AWS standards, which often requires quality-control investments (better lumber drying, more rigorous incoming inspection of veneer, tighter shop-drawing standards) the shop did not have before.</p>

<h2>Where QCP is required on bid lists</h2>
<p>Public projects — federal, state, and many municipal — almost universally specify AWI QCP at Custom or Premium grade for architectural casework. The General Services Administration's design and construction standards reference AWI standards directly. Healthcare projects increasingly specify QCP. What has shifted in the last several years is that private commercial projects — corporate headquarters, hospitality, high-end multifamily — are increasingly being specified to QCP standards by the architecture firms doing the design.</p>

<h2>Alternatives</h2>
<p>For shops that do not want to pursue full QCP licensing, two adjacent paths exist. The Woodwork Institute (WI), based on the West Coast, runs a parallel certification program with similar grade structures: <a href="https://woodinstitute.com" target="_blank" rel="noopener">woodinstitute.com</a>. The Architectural Woodwork Manufacturers Association of Canada (AWMAC) publishes a comparable program for Canadian projects: <a href="https://www.awmac.com" target="_blank" rel="noopener">awmac.com</a>.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.awinet.org" target="_blank" rel="noopener">Architectural Woodwork Institute (AWI) — AWS standards</a></li>
  <li><a href="https://qcp.org" target="_blank" rel="noopener">AWI Quality Certification Program (QCP) — full program rules &amp; fee schedule</a></li>
  <li><a href="https://woodinstitute.com" target="_blank" rel="noopener">Woodwork Institute (WI) — alternative West Coast certification</a></li>
  <li><a href="https://www.awmac.com" target="_blank" rel="noopener">Architectural Woodwork Manufacturers Association of Canada (AWMAC)</a></li>
  <li><a href="https://www.gsa.gov/real-estate/design-and-construction" target="_blank" rel="noopener">U.S. General Services Administration — Design &amp; Construction standards</a></li>
</ul>
$$,
  true,
  now() - interval '18 days'
),

-- ----------------------------------------------------------------------------
-- 10. Industry — Small shops vs. cabinet manufacturers
-- ----------------------------------------------------------------------------
(
  'How a Small Custom Shop Beats a Large Cabinet Manufacturer (And Where It Cannot)',
  'how-small-custom-shop-beats-large-cabinet-manufacturer',
  'Industry',
  'cabinetmaker',
  'National cabinet manufacturers have unbeatable unit economics on stock SKUs. But on true custom, complex installs, and designer-relationship work, the small shop wins more bids than spreadsheet math suggests. KCMA member data and NKBA Design Trends research illuminate where the two markets do and do not overlap.',
  $$
<p class="lead">A homeowner walks into a national cabinet retailer and buys a 30-cabinet kitchen for one price with delivery in three weeks. The same homeowner walks into a custom cabinet shop and gets quoted a multiple of that price with a much longer lead time. The custom shop, if it understands what it is selling, wins more of these clients than the spreadsheet math suggests.</p>

<h2>The two products that share a name</h2>
<p>"Kitchen cabinets" sold by a national stock manufacturer and "kitchen cabinets" sold by a custom shop are not the same product. They share a category name — and almost nothing else. National stock manufacturers operate on standardized 3-inch increments, with a finite library of door styles and finishes, melamine particleboard side panels and fillers, and shipping that compresses delivery into a few weeks because the entire system is engineered for speed. The Kitchen Cabinet Manufacturers Association (KCMA) publishes member-facing market data that reflects this segmentation; readers should request KCMA's <em>Trends of the Industry</em> through <a href="https://www.kcma.org" target="_blank" rel="noopener">kcma.org</a>.</p>
<p>A custom shop produces cabinetry to the exact dimensions of the room, with any door style the client chooses, any species, any finish, with assembly methods and hardware grades the client picks, and with a designer or shop owner working with the homeowner for weeks of refinement.</p>

<h2>Where small shops win</h2>
<ul>
  <li><strong>True custom dimensions.</strong> The 23-7/8" wall cabinet that fills the awkward space between window casing and wall does not exist in a stock catalog.</li>
  <li><strong>Material flexibility.</strong> Walnut interior shelves, quarter-sawn white oak doors, a one-off panel veneered to match an antique sideboard — routine in a custom shop, not quoted by a national manufacturer.</li>
  <li><strong>Designer relationships.</strong> Interior designers specify against shops they trust. NKBA Design Trends research consistently identifies designer specification as a leading driver of high-end residential cabinet selection.</li>
  <li><strong>Local installation precision.</strong> The same shop that built the cabinets installs them. Punch-list resolution happens in days, not the multi-week loop of a national supply chain.</li>
  <li><strong>Repair and revision over time.</strong> Five years after install, when the homeowner wants to add a cabinet matching the original, the local custom shop is the obvious answer.</li>
</ul>

<h2>Where small shops lose</h2>
<p>The small shop loses every bid where the client's actual buying criterion is unit price. It loses on tract-housing developer projects where 60 identical kitchens have to ship in 90 days. It loses on multifamily developments where the developer will accept any builder-grade cabinet that meets the spec sheet. It loses on the homeowner whose budget genuinely tops out at the lower end of the residential range.</p>

<h2>The middle-market trap</h2>
<p>The most dangerous segment for a small shop is the middle: projects where the client wants something nicer than stock but is not committed to fully custom. These projects often turn into bidding wars against semi-custom national lines — KraftMaid, Diamond, Schuler, Decora, and others tracked in KCMA membership rosters — which have many of the same features as a true custom kitchen but ship from a factory at lower unit cost.</p>

<h2>Pricing custom honestly</h2>
<p>The single most common pricing mistake in custom shops is benchmarking against semi-custom or stock pricing and arriving at a number that does not cover real cost. The honest custom kitchen — including design time, project management, lumber, sheet goods, hardware, finishing, delivery, and installation, with proper overhead and a real margin — lands in a price range that the bottom of the residential market will not pay. That is fine — those clients are not the right market.</p>

<h2>Designer relationships as the multiplier</h2>
<p>The shops that consistently outgrow their local market do so on the back of two or three productive interior-designer relationships. NKBA's professional membership rolls and the American Society of Interior Designers (ASID) chapter directories are the obvious starting points for shops trying to build that pipeline.</p>

<h2 id="sources">Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.kcma.org" target="_blank" rel="noopener">Kitchen Cabinet Manufacturers Association (KCMA) — <em>Trends of the Industry</em></a></li>
  <li><a href="https://nkba.org/research" target="_blank" rel="noopener">NKBA — Design Trends &amp; market research</a></li>
  <li><a href="https://www.asid.org" target="_blank" rel="noopener">American Society of Interior Designers (ASID)</a></li>
  <li><a href="https://www.census.gov/data/tables/time-series/econ/asm/2018-asm.html" target="_blank" rel="noopener">U.S. Census Bureau — Annual Survey of Manufactures, NAICS 337110 (Wood Kitchen Cabinet &amp; Countertop Manufacturing)</a></li>
  <li><a href="https://www.woodworkingnetwork.com" target="_blank" rel="noopener">Woodworking Network — FDMC, Custom Woodworking Business industry coverage</a></li>
</ul>
$$,
  true,
  now() - interval '20 days'
)

on conflict (slug) do nothing;

-- ============================================================================
-- IMPORTANT NOTES FOR THE OWNER
--
-- These articles are written as original commentary backed by references to
-- primary public-domain sources (BLS, EPA, CFR, Census, USDA) and to named
-- trade associations and publications. They do NOT reproduce text from any
-- copyrighted publication.
--
-- Before publishing publicly, you should:
--   1. Spot-check the URLs in the "Sources & further reading" sections — URL
--      paths shift over time.
--   2. Consider adding "Last reviewed: [date]" footers if you want to signal
--      currency to readers.
--   3. Verify any specific regulatory limit numbers against the live CFR /
--      agency text at the moment of publication, since amendments occur.
--
-- The article body text itself is your original commentary (commissioned
-- through this tool) and is your property to publish, edit, or republish on
-- your site.
-- ============================================================================
