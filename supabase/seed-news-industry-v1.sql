-- ============================================================================
-- 10 industry articles for /news — millwork, cabinet, woodworking business.
-- Idempotent: ON CONFLICT (slug) DO NOTHING. Re-running is safe.
-- Bodies are HTML; the public NewsArticle page renders them via
-- dangerouslySetInnerHTML and styles via .article-body in newsArticle.css.
-- ============================================================================

-- Pin published_at to staggered recent dates so the feed has a natural order.
-- Adjust if you want all-current. We use now() - interval offsets per row.

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
  'Cabinetmakers and architectural millwork shops face one of the tightest labor markets in a generation. The smartest operators have stopped waiting for trade schools and started growing their own benchmen.',
  $$
<p class="lead">Walk into any cabinet or architectural millwork shop in the country and the same conversation is happening at the front office: we cannot find skilled people, the people we have are aging out, and the high schools are not sending us anyone. The labor pinch has been the single most discussed problem in the industry for nearly a decade — and the shops that are growing through it are the ones that stopped waiting for someone else to solve it.</p>

<h2>The structural problem</h2>
<p>Two forces collided. First, the recession of 2008 pushed an entire cohort of bench carpenters, finishers, and CNC operators out of the trade and into adjacent industries that paid better at the time. Many never came back. Second, the cultural pipeline that historically fed cabinet shops — high school shop class, regional vocational programs, apprenticeships through small family-owned shops — thinned out dramatically through the 2010s as four-year college became the default expectation.</p>
<p>The result is a workforce that skews older than almost any comparable trade. The median journeyman cabinetmaker in many regions is now in their late forties or early fifties. The bench you have today is the bench you will need to replace in the next ten years, and the trade school you are counting on probably cannot even fill its first-year cohort.</p>

<h2>Why traditional hiring has stalled</h2>
<p>The job postings are not getting fewer applicants because the work is unappealing. They are getting fewer applicants because the talent pool of trained cabinetmakers in any given metro area is finite, and you are competing with every other shop in the region for the same names. Posting on Indeed and waiting is, in 2026, a strategy that returns very few qualified candidates and a lot of resumes from people whose definition of "cabinet experience" is having installed an IKEA kitchen.</p>

<h2>Building an in-house apprentice pipeline</h2>
<p>The shops that are quietly outgrowing their competitors have all converged on the same approach: stop trying to hire experienced cabinetmakers, and start training people from zero who have the right work ethic and aptitude. The hiring criteria become simple — show up on time, follow instructions, ask questions, and have functional manual dexterity. Everything else is teachable on a six-to-eighteen month curve.</p>
<p>This is not a new idea. It is how the trade reproduced itself for two hundred years. What changed is that the formal infrastructure for it largely went dormant. The shops bringing it back tend to do five things in common:</p>
<ul>
  <li>They define a real progression — apprentice, journeyman, lead, foreman — with documented competency milestones for each.</li>
  <li>They pair every new hire with a designated mentor on the floor and protect that pairing from production pressure.</li>
  <li>They pay enough at the apprentice level that the role is not insulting compared to what an entry-level worker can earn at a warehouse or fast-food job.</li>
  <li>They build a curriculum — even an informal one — covering material science, basic geometry, hardware, finishing, and shop math.</li>
  <li>They tie raises to demonstrated competency rather than tenure.</li>
</ul>

<h2>Earn while you learn, on the floor</h2>
<p>The first six weeks of a new apprentice's time should not be spent on the most expensive panel saw you own. The shops that get this right typically run new hires through sanding, edge banding, hardware installation, and basic assembly first. These are tasks where mistakes cost minutes, not thousands of dollars in scrap, and where the new hire gets to see how the parts of a cabinet relate to each other before they ever pull a trigger on a router.</p>

<h2>Registered apprenticeships and tax credits</h2>
<p>The U.S. Department of Labor's Registered Apprenticeship program has been quietly expanded in the last several years to cover specific cabinetmaking and architectural woodworking occupations. Registering your in-house program has three benefits that most shop owners underestimate. It gives the apprentice a portable, federally recognized credential. It often qualifies the shop for state tax credits — the specific amounts vary, but several states offer one to four thousand dollars per registered apprentice per year. And it gives you a documented framework that protects the shop in any future workforce-related compliance question.</p>

<h2>Retention is the silent multiplier</h2>
<p>None of the above matters if the people you train walk out the door at year two. The shops that build durable benches do something else most shops do not: they make the path forward visible. A new apprentice should know on day one what the next five years could look like at your shop, what the lead pay band is, what foreman pay looks like, and what it would take to get there. Vague promises lose to a competing shop that offers a clear ladder.</p>

<p>The skilled labor problem is not going to be solved by an outside party. The shops that figure this out first are going to spend the next decade quietly hiring away the ones that did not.</p>
$$,
  true,
  now() - interval '2 days'
),

-- ----------------------------------------------------------------------------
-- 2. Markets — Healthcare millwork
-- ----------------------------------------------------------------------------
(
  'Healthcare Construction Is Quietly the Best Custom-Millwork Market in America',
  'healthcare-construction-best-custom-millwork-market',
  'Markets',
  'cabinetmaker',
  'While residential cabinet demand swings with mortgage rates, hospitals, surgery centers, and life-sciences labs keep building. For shops that can navigate hospital-grade specs, healthcare is the most predictable revenue line on the books.',
  $$
<p class="lead">Residential cabinet demand moves with mortgage rates. Restaurant millwork moves with consumer confidence. Office tenant improvement moves with vacancy rates. Healthcare construction moves with one thing: an aging population that is not going to stop aging. For shops willing to learn the spec, healthcare millwork is the most predictable, recession-resistant, and well-paying segment available to a custom shop today.</p>

<h2>Why healthcare buys custom</h2>
<p>A general contractor on a hospital project does not buy stock cabinets, and they do not buy from the regional kitchen-and-bath dealer. They buy from architectural millwork shops because every nurse station, every casework run in an exam room, every nurse server, every pharmacy fixture, and every lab bench is shop-drawn from architectural drawings. The room layouts do not repeat — even across the same hospital — because the medical equipment, plumbing rough-ins, and code requirements vary by service line.</p>
<p>That dynamic is what creates the opportunity. The work is genuinely custom, the volumes are large, the schedules are long enough to plan around, and the budgets — because they are funded by hospital systems with capital budgets, not homeowners — clear at numbers that residential rarely sees.</p>

<h2>The specs that scare off the competition</h2>
<p>Healthcare specs are not harder than residential specs in any individual line item. They are just longer, more documented, and more strictly enforced. The most common specifications a cabinetmaker will see on a hospital project include:</p>
<ul>
  <li><strong>High-pressure laminate (HPL) interiors and exteriors</strong>, often Wilsonart, Formica, or Pionite, with PVC edge banding 3mm or thicker for impact resistance.</li>
  <li><strong>AWI Quality Certification Program (QCP) Custom or Premium grade</strong> for casework on most state-funded projects.</li>
  <li><strong>Antimicrobial laminates or copper-infused surfaces</strong> on patient-contact areas.</li>
  <li><strong>Solid surface countertops with integrated coved sinks</strong> for cleanability — Corian, Avonite, LG HI-MACS, or equivalent.</li>
  <li><strong>Phenolic resin or epoxy tops</strong> on chemistry and pathology lab benches.</li>
  <li><strong>Lockable, keyed-alike drawers</strong> with master and grand-master key hierarchy.</li>
  <li><strong>Specific hinge and slide brands</strong> — typically Blum or Hettich — with documented load ratings.</li>
  <li><strong>Coordination with FF&E (furniture, fixtures, and equipment) packages</strong> so casework lands flush with hospital-furnished equipment.</li>
</ul>
<p>None of these are exotic. They are simply specifications a residential shop will not have run before. The shops that can produce a properly tabbed submittal package with cut sheets for every line item are the shops that win the work.</p>

<h2>Surgery centers vs. teaching hospitals</h2>
<p>Not all healthcare projects are equally accessible. Major teaching hospital projects — the new patient towers at academic medical centers — typically require a national or super-regional millwork firm because of bonding capacity, schedule risk, and union requirements. They are not the entry point for most shops.</p>
<p>The accessible entry points are ambulatory surgery centers, medical office buildings, dialysis centers, urgent care clinics, dental specialty offices, and outpatient imaging centers. These are projects in the $200,000 to $1.5 million casework range, with general contractors that are open to qualified regional shops, and with schedules that a 10–25 person shop can absorb.</p>

<h2>Lab casework as the high-margin niche</h2>
<p>Within healthcare, laboratory casework is the highest-margin specialty, and the one with the fewest competitors. Lab benches require phenolic resin or epoxy tops, chemical-resistant finishes, suspended cabinet hangers on slotted standards (so cabinets can be reconfigured without touching the floor), specific reagent shelving, and sometimes integrated fume hood interfaces. The shops that learn this segment will have it largely to themselves in any regional market.</p>

<h2>How to break in</h2>
<p>Two reliable paths exist. The first is to get on the bidder list of one general contractor that specializes in medical work and prove yourself on a small project — a clinic build-out, a single floor renovation. The second is to subcontract under a larger millwork firm on a healthcare project as a feeder shop, learning the spec on someone else's risk before bidding direct.</p>
<p>The shops that ignore healthcare because the spec book scares them are leaving the most stable revenue line in the industry on the table.</p>
$$,
  true,
  now() - interval '4 days'
),

-- ----------------------------------------------------------------------------
-- 3. Materials — Hardwood lumber market
-- ----------------------------------------------------------------------------
(
  'What Is Going On With Hardwood Lumber Prices?',
  'whats-going-on-with-hardwood-lumber-prices',
  'Materials',
  'cabinetmaker',
  'White oak supply is tight, walnut is unpredictable, and FAS grade is a moving target. Here is how shop owners are navigating a hardwood market that no longer behaves like it did before 2020.',
  $$
<p class="lead">Anyone running a cabinet or millwork shop has noticed that hardwood lumber pricing no longer behaves the way it did in the 2010s. White oak is sometimes available, sometimes triple what it was, and FAS grade is increasingly a negotiation. The market has not stabilized so much as it has redefined itself, and the shops navigating it well have changed how they buy.</p>

<h2>The white oak premium</h2>
<p>White oak became the dominant species request for residential casework around 2018, driven by a near-universal aesthetic shift toward light, rift-cut, quarter-sawn, and rift-and-quartered looks. Before that, walnut had a brief run. Before that, alder. The white oak demand wave coincided with strong export demand for North American white oak from European cooperage and flooring buyers, particularly out of France, Italy, and increasingly Vietnam.</p>
<p>The supply side did not match the demand wave. White oak grows slowly, mature trees in the right grades take 60–80 years, and harvest decisions made today will not show up in the supply chain for years. The result has been sustained price elevation, particularly on the rift and quartered specifications that designers want, and intermittent availability problems on FAS 5/4 and 8/4 stock.</p>

<h2>Walnut: trend-driven, not log-driven</h2>
<p>Walnut prices have been considerably more volatile than oak — but the volatility comes from a different source. Walnut supply has not changed dramatically. What has changed is demand: walnut moves in and out of fashion in residential design on roughly five-year cycles, and during the high-demand windows the market gets thin quickly. Black walnut FAS at $9 per board foot one year and $5.50 the next is a normal range, and shops that buy reactively rather than on inventory plans get whipsawed.</p>

<h2>Cherry's slow comeback</h2>
<p>Cherry was the dominant kitchen species through the 1990s and into the early 2000s before being pushed out by maple, then alder, then walnut, then white oak. It is now slowly returning to design specifications, particularly on the East Coast, where the warmer color is being framed as a counterpoint to a decade of cool grays and white oak. Cherry pricing has stayed reasonable through the cycle precisely because it has been unfashionable, and shops that maintain familiarity with cherry have a useful arbitrage when designers come back to it.</p>

<h2>Maple: the workhorse hedge</h2>
<p>Hard maple remains the most useful species in the cabinet shop precisely because it is not trend-driven. It paints well, it stains acceptably (though not as gracefully as cherry or alder), it machines cleanly, it is dimensionally stable, and the supply is deep and consistent across North America. For shops doing painted casework — which has been the dominant residential finish call for nearly a decade — hard maple is the answer. Soft maple is a viable substitute on most painted applications and saves 15–25% per board foot.</p>

<h2>Buying tactics for shops under 25 employees</h2>
<p>The buying behavior that worked in 2015 — call your local hardwood supplier when a job lands, take whatever they have on the truck — does not work in 2026 for shops doing more than two or three custom kitchens a month. The shops that have adapted tend to do three things:</p>
<ul>
  <li><strong>Buy in packs and rough-mill in batches.</strong> A 1,000-board-foot pack of FAS white oak run through the rough mill in one Saturday yields better quality control and lower per-foot cost than buying piecemeal.</li>
  <li><strong>Maintain relationships with two suppliers in different regions.</strong> When one mill cannot fill an order, the second one can. This is increasingly important for white oak.</li>
  <li><strong>Quote with a contingency on hardwood pricing.</strong> A 5–8% material contingency line item in proposals protects the shop on any project that takes more than 60 days from quote to cut.</li>
</ul>

<p>The era of stable, predictable hardwood pricing is over for the foreseeable future. Shops that treat lumber as a strategic input — not as a commodity ordered the day a project hits the floor — will quietly carry better margins than their competitors for the next several years.</p>
$$,
  true,
  now() - interval '6 days'
),

-- ----------------------------------------------------------------------------
-- 4. Machinery — CNC nested-base
-- ----------------------------------------------------------------------------
(
  'Nested-Base Manufacturing Has Quietly Become the Default for Production Cabinet Shops',
  'nested-base-manufacturing-default-cabinet-shops',
  'Machinery',
  'cabinetmaker',
  'The combination of a CNC router, a beam saw or panel saw, and a labeling printer has redefined what a 10-person shop can output. Here is why nested-base eats traditional cabinet construction every time the math is run.',
  $$
<p class="lead">Five years ago a 10-person cabinet shop running a CNC router was unusual. Today it is the median. The transition to nested-base manufacturing has happened so quickly that some shops still building cabinets the way they did in 2018 do not realize how much further behind on cost the math has put them.</p>

<h2>What nested-base actually means</h2>
<p>Nested-base is a manufacturing method where every part for a cabinet — sides, bottom, top, stretchers, back, even shelves — is cut from a single sheet of substrate (typically 3/4" prefinished plywood, melamine, or particleboard) on a CNC router in one pass. The router not only cuts every part to size, it drills every dowel hole, every shelf pin hole, every hinge cup, and every screw assembly hole, and labels each part with a barcode or printed sticker.</p>
<p>The cabinet then assembles dry-fit, no jig required, because every joint location is precisely indexed by the holes the router drilled. A two-person team can assemble a finished kitchen in a fraction of the labor that face-frame, dado-and-rabbet construction required.</p>

<h2>Yield, labor, and the real economics</h2>
<p>The case for nested-base is not primarily about cutting accuracy, although accuracy is better. It is about three things:</p>
<ul>
  <li><strong>Sheet yield.</strong> A nesting algorithm packs parts on the sheet more efficiently than any human cutting workflow. Typical yield improvements are 8–15% on sheet goods, which on a shop running 200 sheets a month at $80/sheet is roughly $1,500–$2,400 a month in pure material savings.</li>
  <li><strong>Assembly labor.</strong> A traditional dado-rabbet European-style box takes a skilled cabinetmaker 30–45 minutes to dry-fit and clamp. A dowel-and-screw nested-base box assembles in under 10 minutes, and the worker doing the assembly does not need to be a journeyman.</li>
  <li><strong>Quality consistency.</strong> Every box is identical because every hole was drilled by the same machine to the same coordinates. Punch-list rework drops dramatically.</li>
</ul>

<h2>The software stack</h2>
<p>The CNC router is the visible part of nested-base. The invisible — and more important — part is the software. The dominant stacks today are:</p>
<ul>
  <li><strong>Cabinet Vision plus S2M Center.</strong> Industry standard for production shops. Comprehensive, expensive, steep learning curve, very capable.</li>
  <li><strong>Microvellum.</strong> Built on AutoCAD, preferred by architectural millwork firms with engineering staff.</li>
  <li><strong>KCDw.</strong> Strong in small to mid-size custom shops. Reasonable price, friendly UI, solid CNC output.</li>
  <li><strong>Mozaik.</strong> The fastest-growing entrant, very strong CNC and nesting integration, attractive pricing model.</li>
</ul>
<p>The software decision is consequential and difficult to reverse. Once your shop's job templates, hardware libraries, and engineering standards are built into one ecosystem, switching costs are real.</p>

<h2>When traditional construction still wins</h2>
<p>Nested-base is not the right answer for every project. High-end residential face-frame work in cherry or walnut, where the visible faces are solid wood and the construction is dado-and-rabbet, does not benefit much from nested-base because the labor savings are smaller and the sheet-goods optimization is less relevant. Truly custom architectural millwork — paneled walls, curved counters, unusual geometry — also lives outside the nested-base envelope.</p>

<h2>The ROI on a $90,000 router</h2>
<p>A capable entry-level production CNC router from a reputable manufacturer (Anderson, AXYM, Biesse, Onsrud, ShopSabre, Thermwood) lands in the $80,000–$130,000 range with software, dust collection, and tooling. For a shop currently producing 8–12 kitchens a month with traditional methods, the ROI math typically pencils in at 18–30 months on a five-year financed deal, driven primarily by labor savings on assembly and yield savings on sheet goods.</p>
<p>The shops that delay this decision because the capital looks scary tend to be the same shops that, three years later, cannot understand why their bid prices are no longer competitive on production work. The math has shifted. Nested-base is not a future trend — it is the present default.</p>
$$,
  true,
  now() - interval '8 days'
),

-- ----------------------------------------------------------------------------
-- 5. Software — Cabinet design software
-- ----------------------------------------------------------------------------
(
  'The Practical Guide to Cabinet Design Software',
  'practical-guide-cabinet-design-software',
  'Software',
  'cabinetmaker',
  'Cabinet Vision, Microvellum, KCDw, Mozaik, AutoCAD with cabinet plug-ins — choosing software is the single highest-leverage decision a shop will make. Here is how to pick one without locking yourself into the wrong tool.',
  $$
<p class="lead">The cabinet design software you choose will shape your shop for the next ten years. It will determine how you bid, how you engineer, how you cut, how you assemble, and how you train new hires. Get it right and the software fades into the background of how the shop works. Get it wrong and you will fight it on every job until you replace it.</p>

<h2>Two questions that decide everything</h2>
<p>Before evaluating any specific package, answer two questions honestly.</p>
<p><strong>What kind of work do you do?</strong> A residential kitchen-and-bath shop has different software needs than an architectural millwork firm doing commercial casework. A 5-person custom shop has different needs than a 50-person production shop. Software optimized for one use case is mediocre at the other.</p>
<p><strong>Who is going to use it?</strong> If your engineering is done by a single owner-operator who already knows AutoCAD, your shortlist looks different from a shop hiring a full-time CAD operator. The learning curve and the depth of capability are inversely correlated; the more powerful packages take longer to train staff on.</p>

<h2>Cabinet Vision</h2>
<p>Cabinet Vision is the production standard. It is the most capable software for shops doing nested-base manufacturing, has the deepest part libraries, and the best integration with a wide range of CNC machinery through its S2M Center module. The user interface is dated and the learning curve is steep — most shops report 6–12 months for a new operator to become productive. The licensing cost is the highest in the category. For shops doing more than 15–20 cabinets a week through a CNC, Cabinet Vision is hard to beat.</p>

<h2>Microvellum</h2>
<p>Microvellum runs on AutoCAD, which is both its strength and its limitation. For shops staffed with traditional CAD operators, the AutoCAD foundation is a soft landing. The library system is powerful, the engineering depth is excellent, and the package is widely used in commercial architectural millwork firms. The licensing model — per seat plus AutoCAD — is expensive. The training curve is significant, but for a firm already comfortable with AutoCAD, less brutal than Cabinet Vision.</p>

<h2>KCDw</h2>
<p>KCDw has been the preferred choice for small to mid-size custom shops for two decades. The interface is approachable, the price point is reasonable, the learning curve is the friendliest in the category, and the CNC output is solid for shops doing nested-base. Its limitations show up at scale — very large engineering libraries and complex commercial millwork are not its strongest territory. For a 3–15 person shop doing residential and light commercial work, KCDw remains a defensible choice.</p>

<h2>Mozaik</h2>
<p>Mozaik has been the fastest-growing entrant in the U.S. market over the last several years. The CNC integration is excellent, the rendering output is unusually attractive for client-facing presentations, the licensing model is friendly to small shops, and the support has a reputation for being responsive. The package is still maturing on the deepest engineering features that very large architectural millwork firms need, but for a shop running residential and small-commercial production through a CNC, Mozaik is genuinely competitive with the established players.</p>

<h2>AutoCAD plus cabinet plug-ins</h2>
<p>For very small custom shops where the owner-operator is doing all engineering personally, AutoCAD with a lightweight plug-in (or even AutoCAD with manual drafting) is still a viable approach. It does not produce CNC output efficiently, it does not optimize sheet yield, and it does not generate proper bills of material — but for a one or two-person shop doing low-volume custom work, it is workable.</p>

<h2>Total cost of ownership beyond the sticker</h2>
<p>The license fee is rarely the largest cost. The real cost components are:</p>
<ul>
  <li><strong>Training time.</strong> Six months of partial productivity from your engineering staff is expensive in real dollars.</li>
  <li><strong>Library setup.</strong> Building out your shop's standard cabinet construction, hardware, and finish libraries inside the new package takes 200–600 hours.</li>
  <li><strong>Annual maintenance.</strong> Most packages now run on subscription or annual maintenance plans in the $1,500–$5,000 per seat per year range.</li>
  <li><strong>Switching costs.</strong> Once your team and your standards are inside one package, moving to another resets two of the above costs to zero.</li>
</ul>

<p>The right software for your shop depends on your work, your team, and your scale. The wrong choice is the one made on price alone, or on the recommendation of a single demo engineer at a trade show. Run any candidate package on three real jobs from your last quarter before signing.</p>
$$,
  true,
  now() - interval '10 days'
),

-- ----------------------------------------------------------------------------
-- 6. Hardware — Soft-close
-- ----------------------------------------------------------------------------
(
  'Why Soft-Close Hardware Is No Longer an Upgrade — It Is the Spec',
  'soft-close-hardware-no-longer-upgrade-its-the-spec',
  'Hardware',
  'cabinetmaker',
  'A decade ago, soft-close drawer slides and hinges were a $200 upcharge per kitchen. Today they are baseline expectation, and shops still spec''ing standard hardware are losing bids on perceived quality alone.',
  $$
<p class="lead">In 2010, soft-close hinges and undermount drawer slides were the upgrade line on a kitchen quote — typically $150 to $300 added on a 30-cabinet job. By 2026, soft-close is what the homeowner expects on the showroom floor at any cabinet retailer, and shops still quoting standard side-mount slides and overlay hinges as the base spec are bidding themselves out of the residential market.</p>

<h2>The market has shifted</h2>
<p>The mass-market kitchen retailers — IKEA, the cabinet lines at Home Depot and Lowe's, every framed-cabinet stock manufacturer — converted their entire base offering to soft-close hardware several years ago. That conversion redefined the consumer's expectation of "normal." A custom cabinet shop showing up with anything less than soft-close in 2026 is signaling, regardless of how nice the box is, that the kitchen is somehow less than the one at the big-box store.</p>
<p>The pricing arithmetic also shifted. Soft-close hardware has come down 30–45% in real cost over the last decade as Blum, Hettich, Salice, Grass, and Hafele all moved volume into the category and Asian-manufactured equivalents flooded the lower end. The premium that justified the upgrade conversation has largely evaporated.</p>

<h2>The hardware brands worth knowing</h2>
<p>The European hardware market is dominated by five names. Knowing what each is good at and where each plays competitively is part of the basic literacy of running a cabinet shop today.</p>
<ul>
  <li><strong>Blum.</strong> Austrian, the gold standard. Movento and Tandem undermount slides are the industry reference. CLIP top hinges are the most widely specified hinge in North America. Premium pricing.</li>
  <li><strong>Hettich.</strong> German, very strong in commercial and architectural millwork applications. Quadro slides compete directly with Blum. Often comes in 5–15% below Blum on equivalent product.</li>
  <li><strong>Salice.</strong> Italian, strong reputation in framed-cabinet hinges and soft-close mechanisms. Common spec in residential.</li>
  <li><strong>Grass.</strong> Austrian, broad product line, common in mid-market residential.</li>
  <li><strong>Hafele.</strong> German, distinctive as a hardware distributor as much as a manufacturer. Carries broad lines including specialty pull-outs, lazy susans, and waste-bin systems.</li>
</ul>

<h2>Undermount versus side-mount</h2>
<p>The functional difference between an undermount slide and a side-mount slide is meaningful. Undermount slides hide entirely beneath the drawer, deliver soft-close action smoothly, support 75-pound or 100-pound load ratings as standard, and present cleaner visual lines. Side-mount slides show on the drawer side, generally support lower loads, and are visually cruder.</p>
<p>The cost difference is no longer dramatic. A 21-inch Blum Tandem undermount slide pair in the soft-close configuration runs roughly $22–$28 to a shop buying at modest volume. A comparable side-mount soft-close from a reputable mid-tier brand runs $9–$13. On a 30-drawer kitchen, the differential is roughly $300–$450, which is well below the marginal price tolerance of a homeowner spending $35,000 on cabinetry.</p>

<h2>Hinge geometry and door overlay</h2>
<p>The shop's hinge spec interacts with the door overlay decision in ways that affect every cabinet drawing. Half-overlay, full-overlay, and inset doors each require different hinge cups, baseplates, and adjustment ranges. The Blum CLIP top, Hettich Sensys, and Salice 700 Series are the dominant hinge platforms; each has slightly different installation logic, screw spacing, and adjustment behavior.</p>
<p>Standardizing on one hinge platform across the shop simplifies bench training, parts inventory, and CNC drilling templates. Mixing platforms across jobs because of price-driven hardware substitution is one of the most common quiet sources of inefficiency in custom shops.</p>

<h2>The gray-market hardware trap</h2>
<p>Hardware that looks like Blum or Hettich at 40% of the price is widely available. Some of it is legitimate Asian-manufactured product to comparable specs. Some of it is counterfeit, mislabeled, or built to specs that fail at year three. The shops that have been burned by this share the same observation: warranty exposure on a kitchen renovation, where a slide fails 30 months in and the homeowner expects a no-charge replacement, dwarfs the upfront savings.</p>

<p>Soft-close hardware in 2026 is not a feature to upsell. It is the floor. The shops adapting first are not the ones quoting it as the upgrade — they are the ones writing it into the base spec and competing on cabinet quality, finish, and design instead.</p>
$$,
  true,
  now() - interval '12 days'
),

-- ----------------------------------------------------------------------------
-- 7. Finishing — Waterborne
-- ----------------------------------------------------------------------------
(
  'The Quiet Conversion: Why Cabinet Shops Are Moving From Solvent To Waterborne Finishes',
  'cabinet-shops-moving-solvent-to-waterborne-finishes',
  'Finishing',
  'finisher',
  'Conversion varnish has been the gold standard for cabinet finishing for thirty years. But waterborne 2K finishes have closed the durability gap, and the regulatory math on solvent-based products is getting harder every year.',
  $$
<p class="lead">For most of the last thirty years, conversion varnish has been the default finish for production cabinet shops. The chemistry is mature, the durability is excellent, and the application is well-understood. But over the last several years, a quiet conversion has been happening: an increasing number of shops are switching to waterborne finishes, and the reasons go well beyond marketing.</p>

<h2>Why the holdout shops are converting</h2>
<p>Conversion varnish, post-catalyzed lacquers, and pre-cat finishes all share a fundamental problem: they release a substantial volume of volatile organic compounds (VOCs) during cure, and the regulatory environment around VOCs has tightened steadily across most of the country. California's SCAQMD Rule 1136, several Northeast state programs, and a growing patchwork of municipal air-quality rules have made high-VOC finishes harder to use, more expensive to permit, and more aggressive to track.</p>
<p>The labor-side argument is even more direct. Waterborne finishes do not produce the same level of solvent vapor in the spray booth, do not require the same level of respiratory PPE compliance, and do not create the same combustible-environment risk profile that solvent-based finishes do. For shops trying to retain finishers — a labor category that is harder to hire than almost any bench position — the working environment matters.</p>

<h2>Where waterborne 2K stands today</h2>
<p>The waterborne finishes available in 2026 are not the products that gave waterborne a poor reputation in the 1990s. The category has matured substantially. The most commonly specified waterborne 2K (two-component) finishes today come from Renner, ICA, Milesi, Sherwin-Williams (Kem Aqua line), Becker Acroma, and a handful of others. These products achieve durability and chemical resistance that meets or, on several measures, exceeds traditional conversion varnish:</p>
<ul>
  <li>Pencil hardness in the 2H–3H range after full cure.</li>
  <li>Chemical resistance to common kitchen contaminants — vinegar, ammonia, alcohols, citrus oils — comparable to CV.</li>
  <li>Block resistance and moisture resistance suitable for kitchen and bath cabinetry.</li>
  <li>Color clarity and depth that, on properly tinted formulations, matches the look of solvent finishes.</li>
</ul>

<h2>The VOC compliance picture</h2>
<p>Conversion varnish typically runs 550–680 grams of VOC per liter. Waterborne 2K typically runs 100–250 g/L. In any jurisdiction with a regional VOC limit at 275 g/L or below — increasingly common — conversion varnish is functionally unusable without exemption permitting. Even where the regulatory limits are higher, the trend line is clearly downward, and shops planning capital investments in new spray booths are increasingly making the conversion as part of those projects.</p>

<h2>Spray-booth implications</h2>
<p>Switching to waterborne is not free. The application equipment is different. HVLP guns are the dominant choice for waterborne finishes; the air-to-fluid ratios are different than solvent application; the gun cleaning protocols are different; the booth airflow requirements are different (waterborne has lower flammability concerns but higher humidity sensitivity). Cure times are also different — waterborne finishes generally need more controlled humidity and temperature for predictable dry times than CV does.</p>
<p>Shops that have done the conversion well typically report 2–6 weeks of operational disruption while the finishing team rebuilds their muscle memory and the shop dials in the spray parameters for the new product. Shops that have done the conversion poorly typically tried to do it on top of an unchanged process and produced a quarter of damaged work before figuring out the differences.</p>

<h2>The shops that should not switch (yet)</h2>
<p>Waterborne is not the right answer for every shop. Shops in jurisdictions where VOC compliance is still loose, with deep operator familiarity in CV, with capital tied up in solvent-rated booth equipment, and with no near-term workforce or insurance pressure pushing them to convert, are reasonable in continuing with CV. The argument is not that waterborne is universally better. The argument is that the relative position has shifted enough that anyone planning a 5-year capital and operations roadmap should run the numbers honestly.</p>

<p>The era when waterborne was a compromise finish is over. The shops switching now are not making a green-marketing decision — they are making an operations decision that lines up with where the regulatory and workforce environment is headed.</p>
$$,
  true,
  now() - interval '14 days'
),

-- ----------------------------------------------------------------------------
-- 8. Regulatory — TSCA Title VI
-- ----------------------------------------------------------------------------
(
  'TSCA Title VI Compliance: What Every Cabinet Shop Needs To Document',
  'tsca-title-vi-compliance-cabinet-shop-documentation',
  'Regulatory',
  'cabinetmaker',
  'The federal formaldehyde standard for composite wood products is fully in force, and the EPA is enforcing it. If your shop builds with particleboard, MDF, or hardwood plywood, here is the paperwork chain you must be able to produce.',
  $$
<p class="lead">If your cabinet or millwork shop uses particleboard, MDF, or hardwood plywood — and almost every shop does — you are subject to the federal Formaldehyde Emission Standards for Composite Wood Products under TSCA Title VI. The rule has been fully in force since 2018, the EPA enforces it, and the documentation chain is more involved than most shop owners realize.</p>

<h2>The rule in one paragraph</h2>
<p>TSCA Title VI sets formaldehyde emission limits for hardwood plywood, medium-density fiberboard (MDF), thin MDF, and particleboard sold or used in the United States. The limits — 0.05 ppm for hardwood plywood, 0.11 ppm for MDF, 0.13 ppm for thin MDF, and 0.09 ppm for particleboard — are functionally equivalent to California's CARB Phase 2 (CARB-2) standard. Composite wood products manufactured or imported into the U.S. must be tested and certified by an EPA-recognized Third Party Certifier (TPC), and the certified status must be documented through the entire supply chain from manufacturer to the end user that incorporates the panel into a finished product.</p>

<h2>The compliance chain</h2>
<p>The labeling and documentation chain is the practical compliance burden. Each composite panel has to come from a TSCA-compliant manufacturer, with proper labeling on the bundle. Distributors and fabricators must keep records that establish, for any panel they sell or incorporate, that the panel was certified by a recognized TPC.</p>
<p>For a cabinet shop, the practical implication is straightforward. Every shipment of plywood, MDF, or particleboard into your shop must arrive with documentation that the product is TSCA Title VI compliant — typically through stamps on the panel itself, labels on the bundle, or invoice line-item certifications from the supplier. You then need to keep those records for three years.</p>

<h2>What a fabricator (your shop) is actually responsible for</h2>
<p>The full set of obligations on a "fabricator" — which is what your shop is in TSCA Title VI terminology — comes down to:</p>
<ul>
  <li>Buying composite wood products only from sources that supply TSCA Title VI compliant material.</li>
  <li>Maintaining records that document the compliant status of received material for at least three years.</li>
  <li>Labeling the finished products you sell, where required, with information that allows downstream parties to identify the compliant materials used.</li>
  <li>Not importing or specifying non-compliant composite wood material.</li>
</ul>
<p>Notably, you do not have to test your finished cabinets. The compliance lives at the panel manufacturer level; your job is to source from compliant suppliers and keep records that prove it.</p>

<h2>Audit-ready documentation</h2>
<p>What does an EPA inspection actually look like in a small cabinet shop? In practice, an inspector — usually responding to a complaint or as part of a regional sweep — asks for invoices on recent composite panel purchases, asks to see the supplier's compliance certifications, and walks through your shop checking the labeling on stocked sheet goods.</p>
<p>The shops that fail this kind of inspection do not fail because their materials are non-compliant. Most domestic plywood, MDF, and particleboard manufactured for U.S. distribution today is compliant by default. The shops that fail are the ones who cannot produce records — invoices that do not specify TSCA compliance, supplier certifications that are not on file, panels in the rack with no visible labeling and no way to trace the source.</p>

<h2>The CARB-2 confusion</h2>
<p>Many panel suppliers continue to label their products "CARB-2 compliant" rather than "TSCA Title VI compliant." For practical purposes, panels meeting CARB-2 generally also meet TSCA Title VI because the emission limits are functionally identical. However, the EPA will look for documentation that specifically establishes TSCA Title VI compliance — not just CARB-2 — so suppliers should be able to confirm both.</p>

<h2>Penalties</h2>
<p>The civil penalties for TSCA violations can be substantial — into the tens of thousands of dollars per violation per day for serious or willful cases. Most enforcement actions, however, target panel manufacturers and importers rather than small fabricators. The realistic risk for a small cabinet shop is not a six-figure penalty; it is reputational damage and supply-chain disruption if your material source is found non-compliant.</p>

<p>The compliance posture for a cabinet shop is straightforward. Buy from reputable suppliers. Keep your invoices. Look at the labeling on the sheet stock as it comes in. File the supplier certifications somewhere you can find them on 24 hours notice. That is, almost entirely, the job.</p>
$$,
  true,
  now() - interval '16 days'
),

-- ----------------------------------------------------------------------------
-- 9. Standards — AWI QCP
-- ----------------------------------------------------------------------------
(
  'Is the AWI Quality Certification Program Worth It for a Custom Shop?',
  'awi-quality-certification-program-worth-it-custom-shop',
  'Standards',
  'cabinetmaker',
  'AWI Quality Certification Program (QCP) sounds like a stamp for institutional projects only. But more architects are spec''ing it on private commercial work, and shops that ignore certification are quietly being cut from bid lists.',
  $$
<p class="lead">The Architectural Woodwork Institute's Quality Certification Program — QCP — is one of those credentials that sounds optional until the day you bid a project where the spec book requires it and you find out you are not eligible. For shops doing any commercial millwork, the question of whether to pursue QCP certification is no longer rhetorical.</p>

<h2>What QCP actually certifies</h2>
<p>QCP is a third-party verification program administered by AWI that certifies a shop's ability to produce architectural woodwork to the grade level (Premium, Custom, or Economy) called for in the AWI Architectural Woodwork Standards (AWS). It is not a generic "good shop" stamp. It is a specific verification that, on a specific project, the work was produced and installed to specific tolerances with specific materials and joinery practices, and was inspected by an AWI inspector.</p>
<p>Two kinds of certification exist: licensed company status (the shop is approved to work on QCP projects in general) and project-by-project certification (the specific project carries a QCP stamp and was inspected). On most institutional projects, the spec book calls out both — the bidding shop must be licensed, and the specific project must be inspected and certified at completion.</p>

<h2>Premium grade vs. Custom grade</h2>
<p>The AWS defines three grade levels. The grade level called out in the project spec determines tolerances, materials, finish defects allowed, joinery details, and inspection criteria.</p>
<ul>
  <li><strong>Economy grade.</strong> Rare in modern architectural specifications. Acceptable for utility applications, back-of-house, and unseen work.</li>
  <li><strong>Custom grade.</strong> The vast majority of commercial millwork is specified at Custom grade. Tolerances are tighter than economy, materials and joinery are higher quality, and visible defects are limited.</li>
  <li><strong>Premium grade.</strong> The highest level. Used on prestige projects — corporate boardrooms, hotel public spaces, judicial chambers, museum casework. Tolerances are extremely tight, materials are top-tier, finish quality is essentially flawless.</li>
</ul>
<p>The price differential between Custom and Premium on the same project can be substantial — often 20–35% — driven by labor on inspection, defect rejection rates, and material grade requirements.</p>

<h2>The real cost of certification</h2>
<p>Becoming a QCP-licensed company is not free. The application fee, annual licensing fee, and project inspection fees together typically run several thousand dollars per year for an active shop, plus the per-project inspection costs. The deeper cost, however, is operational: the shop has to demonstrate it can produce work to AWS standards, which often requires quality-control investments — better drying for lumber, more rigorous incoming inspection of veneer, more discipline in shop drawings and submittals — that the shop did not have before.</p>
<p>For shops that do mostly residential work and one or two commercial projects a year, the math rarely justifies the cost. For shops that do regular commercial work and want access to the larger institutional bid lists, certification pays for itself on the first major project that would otherwise have been out of reach.</p>

<h2>Bid lists that quietly require it</h2>
<p>Public projects — federal, state, and municipal — almost universally specify AWI QCP at Custom or Premium grade for architectural casework. Healthcare projects increasingly do as well. What has changed in the last several years is that private commercial projects — corporate headquarters, large hospitality projects, high-end multifamily — are increasingly being specified to QCP standards by the architecture firms doing the design. A shop without certification is quietly being filtered out of those bid invitations even on work that would historically have been wide-open.</p>

<h2>The AWS 9th edition refresher</h2>
<p>The Architectural Woodwork Standards is on its 9th edition. Any shop pursuing certification should keep a current copy in the office, and any project manager bidding QCP work should be functionally fluent in the relevant sections — the casework section, the standing and running trim section, the wall paneling section, and the sections on materials and finishes. Submitting a bid on a QCP-specified project without understanding what is being asked for is a reliable way to underestimate cost.</p>

<h2>Alternatives</h2>
<p>For shops that do not want to pursue full QCP licensing, two adjacent paths exist. The Woodwork Manufacturers Association (WI) has a parallel certification program in the Western U.S. that is broadly equivalent. Some regional millwork associations operate informal certification networks that carry weight on local bid lists. Neither is as widely recognized as QCP, but for a shop with a regional focus, they may be sufficient.</p>

<p>The shops ignoring QCP in 2026 are largely the shops that have decided to compete on price-driven residential and small-commercial work where certification is irrelevant. That is a defensible business strategy. But for any shop with growth plans into commercial millwork, certification has shifted from an optional credential to a price-of-entry requirement on a meaningful fraction of the bid market.</p>
$$,
  true,
  now() - interval '18 days'
),

-- ----------------------------------------------------------------------------
-- 10. Industry — Small shops vs. cabinet manufacturers
-- ----------------------------------------------------------------------------
(
  'How a 10-Person Custom Shop Beats a 200-Employee Cabinet Manufacturer (And Where It Cannot)',
  'how-small-custom-shop-beats-large-cabinet-manufacturer',
  'Industry',
  'cabinetmaker',
  'National cabinet manufacturers have unbeatable unit economics on stock SKUs. But on the work that actually pays — true custom, complex installs, designer relationships — the small shop wins more bids than people think. Here is why.',
  $$
<p class="lead">A homeowner walks into a national cabinet retailer and buys a 30-cabinet kitchen for $14,000 with delivery in three weeks. The same homeowner walks into a custom cabinet shop and gets quoted $42,000 with a 14-week lead time. On its face, the math seems impossible to compete with — and yet the custom shop, if it understands what it is selling, wins this client more often than the spreadsheet suggests.</p>

<h2>The two products that share a name</h2>
<p>The most important thing to understand about the cabinet market is that "kitchen cabinets" sold by a national stock manufacturer and "kitchen cabinets" sold by a custom shop are not the same product. They share a category name and a general appearance. Almost nothing else about them — material specification, assembly method, finish quality, fit to the space, design service, installation precision, hardware quality, post-installation support — is the same.</p>
<p>National stock manufacturers operate on standardized 3-inch increments, with a finite library of door styles, a finite list of standard finishes, side panels and fillers cut from melamine particleboard, MDF doors with painted finishes, and shipping that compresses the delivery into a few weeks because the entire system is engineered for speed.</p>
<p>A custom shop produces cabinetry to the exact dimensions of the specific room, with any door style the client chooses, any species, any finish, with assembly methods and hardware grades the client picks, and with a designer or shop owner working directly with the homeowner for weeks of refinement. The fact that both fit on the same wall does not make them the same product.</p>

<h2>Where small shops win</h2>
<p>The small custom shop has structural advantages a national manufacturer cannot replicate, and clients who recognize them will pay for them.</p>
<ul>
  <li><strong>True custom dimensions.</strong> The 23-7/8" wall cabinet that fills the awkward space between the window casing and the wall does not exist in a stock catalog. It exists in a custom shop's CAD file.</li>
  <li><strong>Material flexibility.</strong> Walnut interior shelves, quarter-sawn white oak doors, a single one-off panel veneered to match an antique sideboard — all routine in a custom shop, none of which a national manufacturer will quote.</li>
  <li><strong>Designer relationships.</strong> Interior designers do not specify their reputation against a stock manufacturer's standard offering. They specify against a shop they trust to execute their vision. This is the single most reliable demand channel a custom shop can develop.</li>
  <li><strong>Local installation precision.</strong> The same shop that built the cabinets installs them. Punch-list resolution happens in days, not the multi-week loop required when boxes were trucked from out of state.</li>
  <li><strong>Repair and revision over time.</strong> Five years after install, when the homeowner wants to add a wine column or a new cabinet matching the original, the local custom shop is the obvious answer. The national manufacturer, often, is not.</li>
</ul>

<h2>Where small shops lose</h2>
<p>The small shop loses every bid where the client's actual buying criterion is unit price. It loses on tract housing developer projects where 60 identical kitchens have to ship in 90 days. It loses on multifamily developments where the developer will accept any builder-grade cabinet that meets the spec sheet. It loses on the homeowner whose budget genuinely tops out at $14,000 and who is honest about it.</p>
<p>Trying to compete in those segments is a losing strategy for a shop with custom-shop overhead. The right move is to stop bidding them, and to stop framing the conversation in dollars per linear foot — a metric on which a custom shop will always look expensive.</p>

<h2>The middle market trap</h2>
<p>The most dangerous segment for a small shop is the middle: projects where the client wants something nicer than stock but is not committed to fully custom. These projects often turn into bidding wars against semi-custom national lines (KraftMaid, Diamond, Schuler, Decora), which have many of the same features as a true custom kitchen but ship from a factory at lower cost.</p>
<p>The shops that thrive in this segment do so by reframing the conversation away from feature parity ("we also offer soft-close") and onto execution quality ("we will measure your room three times, draw it twice, and the cabinets will fit"). The shops that try to win on price in this segment lose money every time.</p>

<h2>Pricing custom honestly</h2>
<p>The single most common pricing mistake in custom shops is benchmarking against semi-custom or stock pricing and arriving at a number that does not cover real cost. The honest custom kitchen, including design time, project management, lumber, sheet goods, hardware, finishing, delivery, and installation, with proper overhead and a real margin, lands in a price range that the bottom of the residential market will not pay. That is fine — those clients are not the right market.</p>

<h2>The designer relationship multiplier</h2>
<p>The shops that consistently outgrow their local market do so on the back of two or three productive interior designer relationships. A designer placing one to two custom projects a quarter through a single shop creates a steady, high-margin revenue line that does not depend on consumer-facing marketing. Earning those relationships takes time, requires consistent execution, and pays for itself many times over.</p>

<p>The small custom shop is not in the same business as the national cabinet manufacturer. It only loses if it tries to be.</p>
$$,
  true,
  now() - interval '20 days'
)

on conflict (slug) do nothing;

-- ============================================================================
-- Verify count after running:
-- select category, count(*) from public.news_articles
-- where slug in (
--   'skilled-labor-squeeze-millwork-apprentice-pipelines',
--   'healthcare-construction-best-custom-millwork-market',
--   'whats-going-on-with-hardwood-lumber-prices',
--   'nested-base-manufacturing-default-cabinet-shops',
--   'practical-guide-cabinet-design-software',
--   'soft-close-hardware-no-longer-upgrade-its-the-spec',
--   'cabinet-shops-moving-solvent-to-waterborne-finishes',
--   'tsca-title-vi-compliance-cabinet-shop-documentation',
--   'awi-quality-certification-program-worth-it-custom-shop',
--   'how-small-custom-shop-beats-large-cabinet-manufacturer'
-- )
-- group by category;
-- ============================================================================
