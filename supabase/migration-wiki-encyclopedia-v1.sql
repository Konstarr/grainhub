-- ============================================================
-- migration-wiki-encyclopedia-v1.sql
--
-- Promotes the wiki to encyclopedia-grade content. Replaces the
-- terse seed-wiki-rich.sql articles with long, structured guides
-- using the same wa-* HTML components as the Mortise & Tenon
-- flagship article (without the downloadable-asset block — those
-- come in a follow-up pass for select articles).
--
-- Idempotent: every row uses `on conflict (slug) do update` so
-- re-running the migration overwrites the article in place. The
-- flagship Mortise & Tenon article (different slug) is left alone.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Frameless Cabinet Construction
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'frameless-cabinet-construction',
  'Frameless Cabinet Construction',
  'Cabinet Making',
  'cabinet-making',
  'A complete reference for European-style frameless cabinetry: panel sizing, the 32mm grid, joinery options, exposed-end strategy, and the field reveals that make or break a finished install.',
  '
<p class="wa-lede"><strong>Frameless</strong> — sometimes called <em>European</em>, <em>Eurobox</em>, or <em>32mm system</em> — is the dominant carcass method in modern production cabinet shops. The plywood box <em>is</em> the cabinet; doors mount directly to the front edge with cup hinges. There is no nailed-on face frame.</p>

<h2 id="why-frameless">Why frameless</h2>
<p>The case for frameless rests on three things, each of which compounds the other.</p>
<ul>
  <li><strong>Full access.</strong> A 24&Prime; sink base actually has 23&Prime; of clear opening, not 21&Prime; after stiles steal an inch and a half on each side. Trash pull-outs, sheet-pan organizers, and 24&Prime; appliances that don&rsquo;t fit a face-frame opening fit easily.</li>
  <li><strong>Production speed.</strong> Once the line-borer or CNC has the program, every panel is drilled identically: 5mm shelf-pin holes, 35mm hinge cups, dowel locations. A two-person shop can knock out 20 boxes a day with confidence.</li>
  <li><strong>Predictable reveals.</strong> Doors hang on a 32mm grid. A run of 12 doors lines up within 1/32&Prime; — assuming the boxes themselves are square.</li>
</ul>
<p>The trade-off is unforgiving tolerance. A bored hinge cup 3mm off the line announces itself across an entire kitchen. There is no face frame to hide carcass error.</p>

<div class="wa-callout">
<strong>Frameless is not always faster.</strong> If your shop runs three boxes a week, a face-frame jig and a pocket-screw gun will out-produce a half-trained CNC operator. Frameless rewards volume.
</div>

<h2 id="material">Material selection</h2>
<p>Most production frameless boxes are built from <strong>3/4&Prime; pre-finished maple plywood</strong> (commonly sold as &ldquo;pre-fin maple&rdquo; or &ldquo;UV&Prime;&Prime;). The factory UV finish is hard, light-fast, and means no on-site spraying inside the box.</p>
<table class="wa-table">
  <thead><tr><th>Core</th><th>Typical use</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Pre-finished maple ply</td><td>Box interiors</td><td>Industry default. UV-cured, low VOC. Edges need banding or veneer tape.</td></tr>
    <tr><td>Thermally fused laminate (TFL) on industrial particleboard</td><td>Painted / contemporary</td><td>Hundreds of color options, zero finish work, heavy.</td></tr>
    <tr><td>Veneer-core hardwood ply</td><td>Stain-grade exposed ends</td><td>Lighter, holds screws better, requires finishing.</td></tr>
    <tr><td>MDF core</td><td>Painted slab doors, exposed ends</td><td>Excellent stability, dead-flat, edge-paints well, heavy.</td></tr>
  </tbody>
</table>

<h2 id="grid">The 32mm grid</h2>
<p>All hardware is engineered to a 32mm spacing. You can disagree with the convention but you cannot ignore it: every European hinge, drawer slide, line-bore wedge, and shelf clip in the world assumes it.</p>
<dl class="wa-specs">
  <dt>5mm</dt><dd>Hole diameter for shelf pins and hinge-mount bolts.</dd>
  <dt>32mm</dt><dd>Vertical center-to-center spacing of the system grid.</dd>
  <dt>37mm</dt><dd>Distance from the front edge of the side panel to the first column of holes.</dd>
  <dt>35mm</dt><dd>Standard hinge-cup hole diameter, drilled in the door, not the box.</dd>
  <dt>9.5mm</dt><dd>Standard depth of a hinge cup. Stop your bit precisely.</dd>
</dl>

<div class="wa-callout tip">
<strong>Memorize 37/32/5.</strong> First column at 37mm in from the front edge, every column 32mm apart, every hole 5mm. The whole grid drops out of those three numbers.
</div>

<h2 id="joinery">Carcass joinery</h2>
<p>Three methods dominate.</p>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Confirmat screws</div>
    <div class="wa-variation-when">Production shops, 3/4&Prime; particleboard or ply</div>
    <div class="wa-variation-body">A 7mm shouldered screw with a captive washer. Requires a stepped pilot bit. Pulls hard, doesn&rsquo;t need glue, lets you knock a box down on site if needed.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Dowels + glue</div>
    <div class="wa-variation-when">Exposed-side boxes, premium work</div>
    <div class="wa-variation-body">8mm or 10mm dowels at every panel intersection. Cleanest exterior. Demands tight drilling tolerance — most shops use a doweling machine or CNC with through-the-tool dowel insertion.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Biscuits / Domino + screws</div>
    <div class="wa-variation-when">Smaller shops without a line borer</div>
    <div class="wa-variation-body">A biscuit or 8&times;40mm Domino aligns the joint, screws hold it shut. Slower than confirmats but works with a benchtop tool kit.</div>
  </div>
</div>

<h2 id="exposed-ends">Exposed ends and end panels</h2>
<p>An exposed end is a finished surface — typically the gable next to a fridge, oven, or open kitchen. Three strategies:</p>
<ol>
  <li><strong>Skin it.</strong> Build the box with a regular pre-fin ply gable, then glue and pin a 1/4&Prime; or 1/2&Prime; matching skin to the outside.</li>
  <li><strong>Solid finish gable.</strong> Build the gable from finished material to begin with. Cleaner, but commits you to that color.</li>
  <li><strong>Inset end.</strong> Recess the gable behind a vertical filler so the door swings clear of the wall.</li>
</ol>

<h2 id="reveals">Field reveals and scribes</h2>
<p>Frameless cabinetry has zero forgiveness against an out-of-plumb wall. The reveal between the cabinet edge and the wall <em>is</em> the same reveal between the door and the cabinet edge. Plan for:</p>
<ul>
  <li>A <strong>3/4&Prime; scribe strip</strong> on every end wall to absorb 1&ndash;3 degrees of out-of-plumb.</li>
  <li>A <strong>top scribe rail</strong> at ceiling crown if there is no crown molding to hide the gap.</li>
  <li>A <strong>filler strip</strong> at every inside corner so adjacent doors don&rsquo;t collide when both are open.</li>
  <li>A <strong>toe-kick scribe</strong> if your shop installs separate kicks rather than building them into the box.</li>
</ul>

<h2 id="install">Installation order</h2>
<ol>
  <li>Find the high point of the floor. Snap a level line at finished base height.</li>
  <li>Set wall cabinets first — standing on the floor is easier than reaching over a base run.</li>
  <li>Plumb the first base box to the level line. Shim the back, never the front.</li>
  <li>Screw adjacent boxes to one another <em>before</em> screwing into the wall. Tight reveals are about box-to-box, not box-to-wall.</li>
  <li>Cap with end panels and scribe strips last.</li>
</ol>

<div class="wa-callout">
<strong>Always glue the box.</strong> Confirmat screws will hold a box together for transport and install. Glue is what keeps it together for 30 years.
</div>

<h2 id="pitfalls">Common pitfalls</h2>
<ul>
  <li><strong>Inconsistent overlay.</strong> Mixing 1/2&Prime; and 5/8&Prime; overlay hinges in the same kitchen produces visible reveal differences.</li>
  <li><strong>Thin-door binding.</strong> 5/8&Prime; doors need thin-door hinges. Standard 3/4&Prime; cup hardware will rub against the gable.</li>
  <li><strong>Undersized scribe.</strong> 1/4&Prime; scribe strips snap when an out-of-plumb wall demands more. 3/4&Prime; minimum on end walls.</li>
  <li><strong>Wet-towel pre-fin.</strong> Pre-finished maple is hard but not infinitely so. Don&rsquo;t drag boxes across concrete.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/the-32mm-system">The 32mm System Explained</a></li>
  <li><a href="/wiki/article/european-hinge-selection">European Hinge Selection</a></li>
  <li><a href="/wiki/article/face-frame-construction">Face Frame Construction</a></li>
  <li><a href="/wiki/article/edge-banding">Edge Banding (PVC vs Veneer)</a></li>
</ul>
',
  12, true, now() - interval '60 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 2. The 32mm System
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'the-32mm-system',
  'The 32mm System',
  'Cabinet Making',
  'cabinet-making',
  'Why every European hinge, drawer slide, and shelf pin assumes a 32mm grid — and the small handful of numbers (37, 32, 5, 35) you actually need to memorize to work in it.',
  '
<p class="wa-lede">The <strong>32mm system</strong> is the dimensional language of European cabinetry. Every cup hinge, every drawer slide, every line-bore machine, every connector fitting on the planet assumes that the holes in your panels are spaced at 32mm intervals. Memorize four numbers and you can read any datasheet in the world.</p>

<h2 id="origins">Origins</h2>
<p>The system traces to Hettich and Blum&rsquo;s post-war engineering: machines that drilled cabinet sides could only afford one indexing wheel, and 32mm was a clean compromise between hardware sizes (the cup hinge needed at least 28mm of meat behind it) and the stride length of automated drilling heads. Once the German hardware industry settled on it, every fitting from Italy, Austria, and Switzerland followed. By the 1980s the rest of the world was either compatible or irrelevant.</p>

<div class="wa-callout history">
The system is sometimes called the <em>LBS</em> (line-boring system) or the <em>System 32</em>. They&rsquo;re the same thing.
</div>

<h2 id="four-numbers">The four numbers</h2>
<dl class="wa-specs">
  <dt>37mm</dt><dd>Setback of the first column of holes from the front edge of the side panel. Sometimes 35mm — confirm with your hinge vendor.</dd>
  <dt>32mm</dt><dd>Vertical center-to-center spacing of every hole on the grid. The system constant.</dd>
  <dt>5mm</dt><dd>Hole diameter for shelf pins and hinge-mount bolts. Drill straight, don&rsquo;t blow out the back.</dd>
  <dt>35mm</dt><dd>Hinge cup diameter — drilled in the back of the door, not the side panel.</dd>
</dl>

<h2 id="grid">Reading the grid</h2>
<p>Stand a side panel on edge, front edge facing you. Mark a horizontal line 37mm in from the front. Mark another vertical line at the bottom — your reference height. Every shelf-pin and hardware hole on the panel sits on a 32mm interval from that reference, in a column 37mm from the front.</p>
<p>If a panel needs holes for hardware on the <em>back</em> edge — usually for line-bored connectors at the carcass joint — there&rsquo;s a parallel column 37mm in from the back. Most production drawings show both columns simultaneously.</p>

<table class="wa-table">
  <thead><tr><th>What you&rsquo;re drilling</th><th>Hole</th><th>Depth</th><th>Where</th></tr></thead>
  <tbody>
    <tr><td>Shelf pins</td><td>5mm</td><td>13mm</td><td>Anywhere on the grid (interior side of panel)</td></tr>
    <tr><td>Hinge mount bolt</td><td>5mm</td><td>10mm</td><td>Front column, two holes 32mm apart per hinge</td></tr>
    <tr><td>Hinge cup</td><td>35mm</td><td>11&ndash;13mm</td><td>Back of door, not the panel</td></tr>
    <tr><td>Drawer-slide screw</td><td>5mm pilot or self-drill</td><td>&mdash;</td><td>Drawer slides have their own pre-bored mounting templates that key off the 32mm grid</td></tr>
    <tr><td>Carcass connectors</td><td>5mm or 8mm</td><td>13mm</td><td>Back column, plus a horizontal hole into the end-grain</td></tr>
  </tbody>
</table>

<h2 id="line-borer">Line borers vs CNC</h2>
<p>You can produce a 32mm panel three ways:</p>
<ol>
  <li><strong>Manual line borer.</strong> A multi-spindle drill press with all 21 chucks pre-set to 32mm. You feed the panel against a fence, pull the lever, and 21 holes appear simultaneously. Fast, fool-proof, and the most common solution in mid-sized shops.</li>
  <li><strong>CNC router with a drill bank.</strong> Modern point-to-point routers have an aggregate of 5mm and 35mm drills that can hit any grid coordinate. More flexible, slower per panel.</li>
  <li><strong>Hand-held jig.</strong> Festool&rsquo;s LR 32 sits on a guide rail and uses a fixed-spacing template. Slow, but a one-person shop with a router can work the system without buying a $30k machine.</li>
</ol>

<div class="wa-callout tip">
<strong>Set your line borer once, never again.</strong> Once the chucks are calibrated to 32mm and the front fence is at 37mm, you don&rsquo;t change them. The system only works if every panel in the shop is bored from the same datum.</div>

<h2 id="why-it-matters">Why this isn&rsquo;t optional</h2>
<p>Every European hinge, slide, and connector is engineered to the grid. If you build a box with the columns at 40mm or 36mm, you can&rsquo;t buy hardware for it — every datasheet assumes 37/32/5. If a designer specifies a 35mm setback, double-check before you bore 80 panels: the column has to match the hardware vendor&rsquo;s template, not the other way around.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
  <li><a href="/wiki/article/european-hinge-selection">European Hinge Selection</a></li>
  <li><a href="/wiki/article/drawer-slides">Drawer Slides</a></li>
</ul>
',
  8, true, now() - interval '55 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 3. European Hinge Selection
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'european-hinge-selection',
  'European Hinge Selection',
  'Hardware',
  'cabinet-making',
  'Cup hinges, full-overlay vs half-overlay vs inset, soft-close mechanisms, and how to read a Blum / Hettich / Salice datasheet without getting it wrong on 80 doors.',
  E'
<p class="wa-lede">A <strong>European cup hinge</strong> is a four-bar linkage hidden in a 35mm cup bored into the back of a door. Pick the wrong overlay or the wrong opening angle on a kitchen and you do not find out until 80 doors are hung. This is the cheat sheet.</p>

<h2 id="anatomy">Anatomy</h2>
<dl class="wa-specs">
  <dt>Cup</dt><dd>35mm cylinder pressed into the door. Standard depth 11&ndash;13mm.</dd>
  <dt>Arm</dt><dd>The four-bar mechanism. Determines opening angle (95&deg;, 110&deg;, 165&deg;, etc.).</dd>
  <dt>Mounting plate</dt><dd>Screws or clips to the cabinet side panel on the 32mm grid.</dd>
  <dt>Adjustment screws</dt><dd>Three of them: in/out (depth), up/down (height), and side-to-side (lateral). All accessible without removing the door.</dd>
</dl>

<h2 id="overlay">Full overlay vs half overlay vs inset</h2>
<p>The single decision that drives hardware selection.</p>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Full overlay</div>
    <div class="wa-variation-when">Single door per cabinet, no shared partition</div>
    <div class="wa-variation-body">The door covers the full thickness of the side panel. Clean, modern look. Standard hinge, smallest mounting plate.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Half overlay</div>
    <div class="wa-variation-when">Two doors share a partition (twin cabinets, blind corners)</div>
    <div class="wa-variation-body">Each door covers half the thickness of the partition. Use a half-overlay arm or a higher mounting plate to compensate. Failure to do this is the #1 reason new shops have to remake doors.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Inset</div>
    <div class="wa-variation-when">Traditional / face-frame look, 1/8&Prime; reveal</div>
    <div class="wa-variation-body">Door sits flush within the cabinet opening. Specialty inset hinge with negative arm geometry. Hardest to adjust.</div>
  </div>
</div>

<div class="wa-callout">
<strong>Buy a sample of every overlay type.</strong> Mounting plate height, arm crank, and arm length all change with overlay. Trying to sub one for another at install time will cost you a Saturday.
</div>

<h2 id="angles">Opening angle</h2>
<p>How far the door swings before binding on the cabinet edge.</p>
<table class="wa-table">
  <thead><tr><th>Angle</th><th>Use case</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>95&deg; / 100&deg;</td><td>Default workhorse</td><td>Cheapest. Adequate for most doors except where pull-outs need clear access.</td></tr>
    <tr><td>110&deg;</td><td>Most kitchens</td><td>Recommended default. Costs ~10% more than 95&deg; but always pays for itself.</td></tr>
    <tr><td>120&deg;</td><td>Drawers behind doors</td><td>Roll-out trays need the door fully out of the way. 120&deg; clears most pull-outs.</td></tr>
    <tr><td>155&deg; / 165&deg;</td><td>Blind corners, narrow openings</td><td>The door needs to fold flat against the adjacent cabinet. Special arm geometry.</td></tr>
  </tbody>
</table>

<h2 id="soft-close">Soft close</h2>
<p>Three implementations. They are not interchangeable.</p>
<ol>
  <li><strong>Built-in.</strong> The damper is integrated into the hinge arm (Blum BLUMOTION, Hettich Sensys). Add ~$1.50/hinge. Cleanest and most common in production.</li>
  <li><strong>Snap-on damper.</strong> A separate plastic cylinder clips onto a non-soft-close hinge. Add &lt;$1/hinge but the cylinder can pop off after a couple years.</li>
  <li><strong>Side-mount damper.</strong> Attaches to the side panel separately from the hinge. Used on retrofit jobs where you cannot replace the hinges.</li>
</ol>

<h2 id="brand">Choosing a brand</h2>
<p>Three vendors dominate North American cabinetry: <strong>Blum</strong> (Austria), <strong>Hettich</strong> (Germany), and <strong>Salice</strong> (Italy). All three are dimensionally compatible &mdash; their cups, mounting plates, and grids all conform to the 32mm system, so you can interchange them on a single panel as long as you keep the overlay logic consistent.</p>
<table class="wa-table">
  <thead><tr><th>Brand</th><th>Strengths</th><th>Weak points</th></tr></thead>
  <tbody>
    <tr><td>Blum</td><td>Premium feel, BLUMOTION soft close, fastest tool-free clip-on, deep distribution</td><td>Most expensive ~$8&ndash;14/hinge for soft-close.</td></tr>
    <tr><td>Hettich</td><td>Sensys is the smoothest soft-close on the market, German precision</td><td>Distributor coverage thinner outside major metros.</td></tr>
    <tr><td>Salice</td><td>Best price-to-quality ratio, big variety of specialty arms</td><td>Datasheets denser; harder to navigate as a beginner.</td></tr>
  </tbody>
</table>

<h2 id="pitfalls">Common pitfalls</h2>
<ul>
  <li><strong>Wrong mounting-plate height.</strong> 0mm, 3mm, and 6mm plates all exist. Mixing them in a kitchen produces visible reveal differences. Pick one and stick to it.</li>
  <li><strong>Door too thin.</strong> 5/8&Prime; doors need a thin-door hinge. Standard 3/4&Prime; cup hardware will rub against the gable.</li>
  <li><strong>Cup blowout.</strong> Drilling 13mm into a 19mm door panel leaves only 6mm of meat. Use a 35mm Forstner with a sharp center spur and a depth stop.</li>
  <li><strong>Forgetting hinge count.</strong> Doors over 36&Prime; tall need three hinges. Doors over 48&Prime; need four.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/the-32mm-system">The 32mm System</a></li>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
  <li><a href="/wiki/article/drawer-slides">Drawer Slides</a></li>
</ul>
',
  9, true, now() - interval '50 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 4. AWI Quality Grades
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'awi-quality-grades',
  'AWI Quality Grades',
  'Standards',
  'cabinet-making',
  'Economy / Custom / Premium — what each grade actually requires for joinery, veneer matching, edge banding, hardware, and finish quality, and which one to bid against.',
  E'
<p class="wa-lede">The Architectural Woodwork Institute (AWI) Quality Standards define three grades for architectural millwork: <strong>Economy</strong>, <strong>Custom</strong>, and <strong>Premium</strong>. Most commercial spec sheets call out one of the three. If you do not know what each grade requires, you will either bid too low and lose money, or too high and lose the job.</p>

<h2 id="standards">Where the grades come from</h2>
<p>The standards were merged in 2014 from three predecessor documents (AWI, AWMAC, WI) into the <strong>AWS</strong> &mdash; the <em>Architectural Woodwork Standards</em>. Most architects still call out &ldquo;AWI grades&rdquo; out of habit; what they mean is the AWS edition currently in force. The three grades cover roughly twenty topics: face frames, doors, casework, paneling, stair rails, etc. We focus here on casework, the most common spec.</p>

<h2 id="overview">Grade overview</h2>
<table class="wa-table">
  <thead><tr><th>Grade</th><th>When specified</th><th>Bid premium</th></tr></thead>
  <tbody>
    <tr><td>Economy</td><td>Closets, garages, utility rooms, anywhere users do not see joinery up close</td><td>Baseline.</td></tr>
    <tr><td>Custom</td><td>Default for commercial offices, schools, hotels, restaurants. ~80% of commercial spec.</td><td>+15&ndash;25% over economy.</td></tr>
    <tr><td>Premium</td><td>High-end residential, executive offices, courtrooms, conference rooms</td><td>+40&ndash;75% over economy.</td></tr>
  </tbody>
</table>

<h2 id="joinery">Joinery requirements</h2>
<table class="wa-table">
  <thead><tr><th>Item</th><th>Economy</th><th>Custom</th><th>Premium</th></tr></thead>
  <tbody>
    <tr><td>Carcass corners</td><td>Stapled / nailed</td><td>Glued + screwed or doweled</td><td>Doweled or biscuited; glue mandatory</td></tr>
    <tr><td>Face frame</td><td>Pocket screw OK</td><td>Pocket screw OK if hidden</td><td>Mortise &amp; tenon or doweled, glue mandatory</td></tr>
    <tr><td>Drawer construction</td><td>Stapled corner</td><td>Locking joint, dovetail, or French dovetail</td><td>English dovetail, hand or machine</td></tr>
    <tr><td>Door joinery</td><td>Cope &amp; stick OK</td><td>Cope &amp; stick or M&amp;T</td><td>M&amp;T mandatory (or doweled with glue) on stile-and-rail</td></tr>
  </tbody>
</table>

<h2 id="veneer">Veneer matching</h2>
<p>The grade tells you which veneer match the architect can specify <em>by default</em>. Anything fancier than the default is paid extra.</p>
<dl class="wa-specs">
  <dt>Economy</dt><dd>No matching required between sheets. Knots permitted up to 3/4&Prime;.</dd>
  <dt>Custom</dt><dd>Slip-matched or book-matched within a panel. Sequence-matched across paneled walls only when called out.</dd>
  <dt>Premium</dt><dd>Book-matched and end-matched within a panel; sequence-matched across all panels in a room. Logs flitch-numbered and tracked.</dd>
</dl>

<div class="wa-callout">
<strong>Sequence matching is the silent budget killer.</strong> A &ldquo;sequence-matched conference room paneling&rdquo; spec means you have to keep one whole flitch of veneer for that room and lay leaves out in order. If the architect later changes a panel size, you may not have enough flitch.
</div>

<h2 id="edge-banding">Edge banding</h2>
<dl class="wa-specs">
  <dt>Economy</dt><dd>0.5mm PVC tape acceptable. Slight chip-out at corners permitted.</dd>
  <dt>Custom</dt><dd>2mm or 3mm PVC, ABS, or wood veneer band. Edges sharp, no chip-out.</dd>
  <dt>Premium</dt><dd>3mm matching wood band on all exposed edges, mitered at outside corners. Hot-melt adhesive only; PUR adhesive preferred for moisture resistance.</dd>
</dl>

<h2 id="finish">Finish quality</h2>
<p>The standard specifies sheen consistency, sand-through tolerance, and orange-peel limits.</p>
<table class="wa-table">
  <thead><tr><th>Item</th><th>Economy</th><th>Custom</th><th>Premium</th></tr></thead>
  <tbody>
    <tr><td>Sand grit before topcoat</td><td>180</td><td>220</td><td>240</td></tr>
    <tr><td>Coats of topcoat</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><td>Sand-through tolerance</td><td>3% of surface</td><td>1%</td><td>None permitted</td></tr>
    <tr><td>Sheen variation</td><td>+/- 10 units</td><td>+/- 5 units</td><td>+/- 2 units</td></tr>
  </tbody>
</table>

<h2 id="bidding">Bidding implications</h2>
<ul>
  <li><strong>Read the spec, not the cover sheet.</strong> The cover sheet says &ldquo;Custom&rdquo;; the cabinet section says &ldquo;Premium grade where exposed&rdquo;. The cabinet section governs.</li>
  <li><strong>Premium veneer almost always means flitch tracking.</strong> Add 8&ndash;15% to the veneer line item.</li>
  <li><strong>Premium drawer boxes mean dovetailed boxes from a vendor like Walzcraft, not in-house stapled boxes.</strong> Add the per-box premium at the bid stage.</li>
  <li><strong>Submit a QCP (Quality Certified Program) certificate</strong> if the spec demands it. Not all shops are QCP-certified; bidding a QCP-required job without certification is a bid you cannot honor.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/veneer-matching">Veneer Matching</a></li>
  <li><a href="/wiki/article/edge-banding">Edge Banding</a></li>
  <li><a href="/wiki/article/conversion-varnish-vs-waterborne">Conversion Varnish vs Waterborne Finishes</a></li>
</ul>
',
  10, true, now() - interval '48 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 5. Conversion Varnish vs Waterborne Finishes
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'conversion-varnish-vs-waterborne',
  'Conversion Varnish vs Waterborne Finishes',
  'Finishing',
  'finisher',
  'Two-component conversion varnish is the workhorse of cabinet finishing. Waterborne is closing the gap fast. Here is how each chemistry actually behaves on the gun, on the wood, and on the schedule.',
  E'
<p class="wa-lede">For thirty years <strong>conversion varnish (CV)</strong> was the unquestioned standard finish for kitchen and bath cabinets. Its hardness, chemical resistance, and clarity made it the default. Modern <strong>waterborne (WB)</strong> finishes have closed enough of the performance gap that many production shops are switching &mdash; and many regulators are forcing the issue with VOC limits.</p>

<h2 id="chemistry">The chemistry</h2>
<dl class="wa-specs">
  <dt>Conversion varnish</dt><dd>An amino-formaldehyde resin (urea or melamine) cross-linked at spray time with an acid catalyst. Once catalyzed, the pot life is 4&ndash;8 hours; cure is chemical, not solvent-evaporation.</dd>
  <dt>Waterborne</dt><dd>Acrylic, polyurethane, or hybrid resin dispersed in water with co-solvents (glycol ethers, etc.). Cure is by water/solvent evaporation plus, for crosslinkable WBs, a second component that triggers a similar amino reaction.</dd>
</dl>

<h2 id="comparison">Side-by-side</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Conversion Varnish</th><th>Waterborne 2K</th></tr></thead>
  <tbody>
    <tr><td>VOC content</td><td>~550 g/L (high)</td><td>&lt;250 g/L (low)</td></tr>
    <tr><td>Pot life after catalyzing</td><td>4&ndash;8 hours</td><td>2&ndash;6 hours (or unlimited if 1K)</td></tr>
    <tr><td>Recoat window</td><td>30&ndash;60 minutes between coats</td><td>30&ndash;90 minutes</td></tr>
    <tr><td>Full cure</td><td>5&ndash;10 days</td><td>7&ndash;14 days</td></tr>
    <tr><td>Hardness (Konig)</td><td>120&ndash;150 sec</td><td>90&ndash;130 sec</td></tr>
    <tr><td>Chemical resistance</td><td>Excellent (wine, citrus, household cleaners)</td><td>Good but vulnerable to ammonia and bleach if uncured</td></tr>
    <tr><td>Yellowing</td><td>Yellows visibly over 5&ndash;10 yrs on whites</td><td>Stays water-clear</td></tr>
    <tr><td>Build per coat</td><td>2&ndash;3 mils dry</td><td>1.5&ndash;2.5 mils dry</td></tr>
    <tr><td>Cleanup</td><td>Lacquer thinner / acetone</td><td>Water + soap</td></tr>
  </tbody>
</table>

<h2 id="when-cv">When CV still wins</h2>
<ul>
  <li>Stain-grade dark woods. CV&rsquo;s amber tone enriches walnut and cherry; WB looks pale by comparison without a tinted seal coat.</li>
  <li>High-touch hospitality work. CV&rsquo;s ten-day cured chemical resistance is still the benchmark for commercial bar tops and restaurant millwork.</li>
  <li>Existing CV system. If your booth, pumps, and lines are all dialed for CV, switching is a multi-month project.</li>
</ul>

<h2 id="when-wb">When WB wins</h2>
<ul>
  <li>White and off-white painted cabinetry. WB&rsquo;s non-yellowing nature is decisive on whites; CV starts yellowing in 18 months.</li>
  <li>VOC-restricted regions. California (SCAQMD), Colorado (Front Range), parts of NJ/NY have VOC caps that effectively ban CV.</li>
  <li>Health-sensitive customers. Formaldehyde off-gassing from CV is real for the first 30 days.</li>
  <li>Smaller booths without high-volume air. WB does not need 100 fpm of cross-draft; CV does.</li>
</ul>

<div class="wa-callout">
<strong>Test on the species you sell.</strong> WB sealers raise the grain on red oak and ash dramatically. CV sealers do not. Adjust your sanding schedule accordingly &mdash; one extra grit-step is usually enough.
</div>

<h2 id="application">Application notes</h2>
<dl class="wa-specs">
  <dt>Spray pressure (HVLP)</dt><dd>CV: 8&ndash;12 psi at the cap. WB: 10&ndash;15 psi at the cap (more atomization needed).</dd>
  <dt>Tip size</dt><dd>CV: 1.3&ndash;1.4mm. WB: 1.5&ndash;1.8mm.</dd>
  <dt>Booth temperature</dt><dd>CV: 65&ndash;85&deg;F. WB: 65&ndash;75&deg;F (above 80&deg;F WB skins fast and traps solvent).</dd>
  <dt>Humidity</dt><dd>CV: tolerant 30&ndash;70% RH. WB: critical, 40&ndash;60% RH.</dd>
</dl>

<h2 id="pitfalls">Common pitfalls</h2>
<ul>
  <li><strong>Over-catalyzing CV.</strong> 5% by volume, not by weight. Over-catalyzed CV cures fast and brittle.</li>
  <li><strong>Spraying WB too cold.</strong> Below 60&deg;F WB will not coalesce. The film stays milky.</li>
  <li><strong>Skipping the WB seal coat on raw wood.</strong> Without sealer the WB topcoat raises grain badly.</li>
  <li><strong>Running CV in an enclosed shop without makeup air.</strong> Formaldehyde concentrations climb fast. Get a real cross-draft booth.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/spray-booth-setup">Spray Booth Setup</a></li>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
</ul>
',
  10, true, now() - interval '42 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 6. CNC Nesting
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'cnc-nesting',
  'CNC Nesting',
  'Production',
  'cabinet-making',
  'Nest-based machining 101: how a sheet becomes a cut list, the difference between point-to-point and nested base, and the small handful of decisions that determine your yield.',
  E'
<p class="wa-lede"><strong>Nesting</strong> means arranging every part you need on a sheet of material, cutting them all in one program, and labeling the pieces as the spindle finishes. A modern nested-base CNC turns a stack of 4&times;8 sheets into a labeled stack of cabinet parts in roughly four minutes per sheet.</p>

<h2 id="vs-p2p">Nested base vs point-to-point</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Nested base</th><th>Point-to-point</th></tr></thead>
  <tbody>
    <tr><td>Material flow</td><td>Full sheet on bed; cut all parts in one pass</td><td>Pre-cut blank loaded; route holes, dadoes, profiles</td></tr>
    <tr><td>Best for</td><td>High-volume cabinet boxes, repetitive part libraries</td><td>Doors, custom shapes, long-grain edge profiles</td></tr>
    <tr><td>Yield</td><td>78&ndash;88% of sheet</td><td>N/A (blanks pre-cut)</td></tr>
    <tr><td>Bed type</td><td>Spoilboard with vacuum hold-down</td><td>Pod-and-rail</td></tr>
  </tbody>
</table>

<h2 id="workflow">Workflow</h2>
<ol>
  <li>Engineering ouputs a flat-pack list (every part as a 2D rectangle with tooling instructions).</li>
  <li>Nesting software (Cabinet Vision, Microvellum, AlphaCAM, eCabinets) packs the parts onto sheets.</li>
  <li>Tool paths are generated &mdash; pockets, dadoes, dowel holes, hinge cups, then through-cuts last.</li>
  <li>The CNC runs the nest. Labels print as parts are cut so the operator can sticker them while clamping the next sheet.</li>
  <li>Onion-skin or tabs hold parts in place until the program finishes.</li>
</ol>

<h2 id="yield">Yield optimization</h2>
<p>A 4% yield improvement on a 200-sheet job pays for the nesting software for the year.</p>
<ul>
  <li><strong>Allow grain rotation</strong> on parts where grain direction does not matter (interior gables, bottoms). Locked-grain parts cost yield.</li>
  <li><strong>Group similar thicknesses.</strong> Mixing 5/8&Prime; and 3/4&Prime; on the same sheet means the spindle has to step every cut.</li>
  <li><strong>Use shared cuts.</strong> Two 3/4&Prime; parts back-to-back share one kerf instead of two. Adjust your nester to enable shared cuts where the part edges allow.</li>
  <li><strong>Save remnants</strong> with a remnant tracker. A 600&times;1200 piece left over from sheet 12 becomes the first piece of sheet 13.</li>
</ul>

<h2 id="tools">Tooling</h2>
<dl class="wa-specs">
  <dt>3/8&Prime; compression bit</dt><dd>Default for through-cuts on melamine and pre-fin ply. Up-cut at top, down-cut at bottom. Clean both faces.</dd>
  <dt>1/4&Prime; straight-flute</dt><dd>For dadoes and pockets where you need a flat bottom.</dd>
  <dt>5mm drill bit</dt><dd>System holes (the 32mm grid) and shelf pins.</dd>
  <dt>35mm Forstner-style</dt><dd>Hinge cup bores. Most CNCs have a separate 35mm aggregate.</dd>
  <dt>V-groove or 60&deg; chamfer</dt><dd>Edge bevels and hinge ramps.</dd>
</dl>

<div class="wa-callout tip">
<strong>Replace the 3/8&Prime; bit at 100&ndash;150 sheets.</strong> A dull bit chips melamine, blows out pre-fin, and burns the spoilboard. A new bit is $35; a remade door is $300.
</div>

<h2 id="spoilboard">Spoilboard maintenance</h2>
<p>The MDF spoilboard underneath the sheet is the bed&rsquo;s vacuum gasket. It wears, scores, and fills with cuts.</p>
<ul>
  <li>Resurface every 80&ndash;100 sheets &mdash; skim with a 1/2&Prime; surfacing bit at 0.5mm pass.</li>
  <li>Replace when total thickness drops below 12mm.</li>
  <li>Vacuum the bed between every sheet. Chips trapped under the next sheet bow it and ruin a part.</li>
</ul>

<h2 id="pitfalls">Common pitfalls</h2>
<ul>
  <li><strong>Vacuum hold-down failure.</strong> Small parts (face frame stiles &lt;100mm) sometimes lift mid-cut. Use onion-skin or tabs.</li>
  <li><strong>Wrong cut direction.</strong> Climb-cut on a delicate edge produces a clean face but can grab small parts.</li>
  <li><strong>Bad part labels.</strong> If the labeler is offline, a 30-sheet nest becomes a guessing game. Run a backup labeler.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cabinet-vision-vs-microvellum">Cabinet Vision vs Microvellum</a></li>
  <li><a href="/wiki/article/dust-collection">Dust Collection</a></li>
  <li><a href="/wiki/article/edge-banding">Edge Banding</a></li>
</ul>
',
  9, true, now() - interval '40 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 7. Dust Collection
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'dust-collection',
  'Dust Collection for the Millwork Shop',
  'Workshop',
  'cabinet-making',
  'CFM, static pressure, ductwork sizing, single-stage vs cyclone, and the OSHA / NFPA rules that turn a shop dust system from optional to required.',
  E'
<p class="wa-lede">A modern <strong>dust collection system</strong> is not optional. Wood dust is an OSHA-regulated airborne hazard, an explosion hazard at high concentrations, and the leading cause of long-term respiratory disease in cabinetmakers. This is the framework for sizing one correctly.</p>

<h2 id="cfm">CFM and static pressure</h2>
<dl class="wa-specs">
  <dt>CFM</dt><dd>Cubic feet per minute &mdash; the air volume the system moves. Each tool has a minimum requirement.</dd>
  <dt>Static pressure (SP)</dt><dd>Resistance the system has to overcome. Inches of water column. Long ducts, sharp elbows, and small pipes raise SP and drop CFM.</dd>
  <dt>FPM</dt><dd>Feet per minute &mdash; air velocity. 4000 FPM in mains, 3500 FPM in branches keeps dust suspended.</dd>
</dl>

<table class="wa-table">
  <thead><tr><th>Tool</th><th>Required CFM</th><th>Hood size</th></tr></thead>
  <tbody>
    <tr><td>Table saw</td><td>350&ndash;450</td><td>4&Prime; under-cabinet + 4&Prime; blade guard</td></tr>
    <tr><td>Jointer (8&Prime;)</td><td>400</td><td>4&Prime;</td></tr>
    <tr><td>Planer (15&Prime;)</td><td>700&ndash;900</td><td>5&Prime; or 6&Prime;</td></tr>
    <tr><td>Edge sander</td><td>500&ndash;700</td><td>5&Prime;</td></tr>
    <tr><td>Wide-belt sander (37&Prime;)</td><td>1500&ndash;2000</td><td>8&Prime;</td></tr>
    <tr><td>CNC router</td><td>800&ndash;1200</td><td>5&Prime; or 6&Prime; on the dust shoe</td></tr>
    <tr><td>Shaper</td><td>500&ndash;700</td><td>4&Prime; or 5&Prime;</td></tr>
  </tbody>
</table>

<h2 id="single-vs-cyclone">Single-stage vs cyclone</h2>
<p>A <strong>single-stage</strong> bag collector pulls air and chips into one chamber, then through a filter. Cheap, loud, and the impeller wears fast on long chips.</p>
<p>A <strong>cyclone</strong> separates 99% of the chips before they reach the filter via centrifugal action. Filter stays cleaner, impeller stays sharper, system maintains CFM longer between bag changes.</p>
<p>Anything 3 HP or larger should be a cyclone. Below that, single-stage is acceptable for a single-tool shop.</p>

<div class="wa-callout">
<strong>HEPA does not mean what you think.</strong> A &ldquo;HEPA-rated bag&rdquo; on a single-stage collector still passes the fine dust at the filter media if velocity drops. Real respirable-dust capture requires a true cartridge filter (MERV 16 / 0.5&micro;m) or a separate ambient air cleaner.
</div>

<h2 id="ductwork">Ductwork</h2>
<p>The single biggest mistake hobby/small-shop owners make is undersizing duct.</p>
<ul>
  <li><strong>4&Prime; PVC</strong> handles ~400 CFM at 11 fpm/ft loss. Fine for one tool at a time.</li>
  <li><strong>6&Prime; spiral metal</strong> handles ~900 CFM. Industry default for shops with 2&ndash;3 tools running.</li>
  <li><strong>8&Prime; spiral metal</strong> for the main on a wide-belt or whole-shop system.</li>
  <li>Use sweep ells (long-radius), not 90s. Each sharp 90 costs ~10 ft of equivalent pipe length.</li>
  <li>Keep verticals short, runs to tools as straight as possible.</li>
</ul>

<h2 id="osha">OSHA and NFPA</h2>
<dl class="wa-specs">
  <dt>OSHA wood-dust PEL</dt><dd>5 mg/m&sup3; total, 1 mg/m&sup3; respirable, time-weighted 8-hour average.</dd>
  <dt>NFPA 664</dt><dd>Standard for the Prevention of Fires and Explosions in Wood Processing and Woodworking Facilities. Applies to any shop with collected dust quantities &gt; 1/32&Prime; deposit on 5% of floor area.</dd>
  <dt>NFPA 68 / 69</dt><dd>Explosion venting/protection. Cyclones &gt; 5,000 CFM typically need explosion vents on the bin or filter.</dd>
</dl>

<h2 id="ambient">Ambient air cleaner</h2>
<p>Even a perfect under-tool capture system misses 10&ndash;20% of dust at the source. An ambient cleaner (a ceiling-mounted unit pulling 1,000&ndash;1,500 CFM through a 1&micro;m filter) catches what the collector misses. Run it during work and 30 minutes after.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cnc-nesting">CNC Nesting</a></li>
  <li><a href="/wiki/article/spray-booth-setup">Spray Booth Setup</a></li>
</ul>
',
  8, true, now() - interval '38 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 8. Hard Maple
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'hard-maple',
  'Hard Maple — Species Reference',
  'Materials',
  'cabinet-making',
  'Sugar maple (Acer saccharum) is the workhorse painted-cabinet wood: hard, light, predictable, but it burns under dull cutters and rejects oil-based stains badly. The full reference.',
  E'
<p class="wa-lede"><strong>Hard maple</strong> &mdash; properly <em>Acer saccharum</em>, the sugar maple &mdash; is the default North American hardwood for painted cabinetry, butcher block tops, and any application where toughness and a near-white starting color matter. It is a small minority of the maple genus by volume and the entire reason &ldquo;maple&rdquo; means what it does in cabinet shops.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,450 lbf. ~30% harder than red oak.</dd>
  <dt>Specific gravity</dt><dd>0.63 air-dry. Heavy enough to feel substantial.</dd>
  <dt>Modulus of rupture</dt><dd>15,800 psi.</dd>
  <dt>Shrinkage</dt><dd>Tangential 9.9%, radial 4.8%. Moderate; cup risk on plain-sawn boards if humidity swings.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood pale tan with a pink cast.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li><strong>Cutters dull fast.</strong> Maple&rsquo;s tight grain and density burnish steel. Carbide is mandatory; new carbide is dramatic.</li>
  <li><strong>Burns under dull cutters.</strong> A dull router bit on hard maple leaves dark scorch marks that no amount of sanding removes.</li>
  <li><strong>Rejects oil stain.</strong> Pigmented oil stain blotches badly. Use a pre-stain conditioner, dye, or gel stain.</li>
  <li><strong>Glues clean.</strong> Type I PVA holds well in normal interior service.</li>
  <li><strong>Sands flat.</strong> Tight grain means no grain-raise after sealer; an excellent paint substrate.</li>
</ul>

<h2 id="grades">Grades and figure</h2>
<dl class="wa-specs">
  <dt>FAS / 1 Common</dt><dd>Standard NHLA grades. FAS for face frames and exposed work.</dd>
  <dt>Curly maple</dt><dd>Wavy-grain figure caused by stress in the growing tree. Premium-priced.</dd>
  <dt>Birdseye</dt><dd>Tiny conical &ldquo;eyes&rdquo; from undeveloped buds. Rare and expensive.</dd>
  <dt>Quartersawn</dt><dd>Stable, ribbon-figured. Use for door panels in humidity-prone applications.</dd>
</dl>

<h2 id="finishing">Finishing strategy</h2>
<table class="wa-table">
  <thead><tr><th>Goal</th><th>Recommended schedule</th></tr></thead>
  <tbody>
    <tr><td>Painted</td><td>Sand to 220, prime with WB primer or shellac, topcoat with WB or CV.</td></tr>
    <tr><td>Clear / natural</td><td>Sand to 180, dye if uniform color desired, vinyl sealer, two coats CV or WB.</td></tr>
    <tr><td>Stained dark</td><td>Pre-stain conditioner mandatory. Dye stain first, then pigment glaze for depth.</td></tr>
    <tr><td>Bleached / very white</td><td>2-part wood bleach (A then B), dry 24 hr, neutralize, sand, white-tinted sealer.</td></tr>
  </tbody>
</table>

<div class="wa-callout">
<strong>Hard maple yellows under CV.</strong> A pure-white painted maple cabinet topcoated with conversion varnish will show a measurable yellow shift in 18 months. Use a non-yellowing waterborne topcoat over white pigment.
</div>

<h2 id="sourcing">Sourcing notes</h2>
<ul>
  <li>Northern (NY, MI, Ontario) hard maple is whiter and tighter-grained than southern.</li>
  <li>Dimension stock comes 4/4 through 12/4. Most cabinet shops buy 4/4 S2S.</li>
  <li>Plywood: ApplePly, Columbia Forest, States Industries are typical premium veneer-core sources. White faces dominate; rotary-cut for paint, plain-sliced for stain.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/white-oak">White Oak</a></li>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
  <li><a href="/wiki/article/conversion-varnish-vs-waterborne">Conversion Varnish vs Waterborne</a></li>
</ul>
',
  7, true, now() - interval '36 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 9. White Oak
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'white-oak',
  'White Oak — Species Reference',
  'Materials',
  'cabinet-making',
  'Quercus alba: rot-resistant, ray-figured when quartersawn, the species behind every Mission-style and modern Scandinavian kitchen of the last fifteen years.',
  E'
<p class="wa-lede"><strong>White oak</strong> (<em>Quercus alba</em>) is the dominant trend wood of the late 2010s and 2020s. It is rot-resistant, takes both stain and clear finish well, and shows dramatic ray fleck when quartersawn. It is also the default species for whiskey barrels, ship timbers, and most Mission/Greene &amp; Greene reproduction work.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,360 lbf. Slightly softer than hard maple.</dd>
  <dt>Specific gravity</dt><dd>0.68 air-dry.</dd>
  <dt>Modulus of rupture</dt><dd>15,200 psi.</dd>
  <dt>Shrinkage</dt><dd>Tangential 10.5%, radial 5.6%. High; movement matters.</dd>
  <dt>Color</dt><dd>Sapwood pale yellow; heartwood pale brown with olive overtones.</dd>
</dl>

<h2 id="vs-red-oak">White oak vs red oak</h2>
<table class="wa-table">
  <thead><tr><th></th><th>White oak</th><th>Red oak</th></tr></thead>
  <tbody>
    <tr><td>Pore structure</td><td>Tyloses block early-wood pores &mdash; cells are filled, not hollow</td><td>Open early-wood pores &mdash; you can blow air through end grain</td></tr>
    <tr><td>Rot resistance</td><td>Excellent (used for outdoor furniture, ships, barrels)</td><td>Poor; rots quickly outdoors</td></tr>
    <tr><td>Stain uptake</td><td>Tight grain takes stain evenly</td><td>Open grain blotches dark in pores</td></tr>
    <tr><td>Color</td><td>Olive-brown heartwood</td><td>Pinkish-red heartwood</td></tr>
    <tr><td>Price</td><td>~25% premium over red oak</td><td>Cheap commodity hardwood</td></tr>
  </tbody>
</table>

<h2 id="cuts">Plain-sawn vs quartersawn vs rift</h2>
<dl class="wa-specs">
  <dt>Plain-sawn</dt><dd>Cathedral grain pattern. Most common, cheapest. Cabinet doors and run-of-mill work.</dd>
  <dt>Rift-sawn</dt><dd>Straight grain, no fleck. Used for clean modern cabinetry and Scandinavian work. Premium price.</dd>
  <dt>Quartersawn</dt><dd>Visible ray fleck (the &ldquo;tiger stripe&rdquo;). Mission-style, A&amp;C reproduction, and high-end restoration.</dd>
</dl>

<div class="wa-callout">
<strong>The 2020s &ldquo;rift-sawn white oak kitchen&rdquo; trend</strong> drove the price of rift cut up 40% from 2018 to 2023. Sequence-matched rift veneers can hit $35/sq ft on premium logs. Budget accordingly.
</div>

<h2 id="finishing">Finishing white oak</h2>
<ul>
  <li><strong>Fumed.</strong> Ammonia vapor reacts with the tannin to produce a deep, even brown without stain. Period-correct for A&amp;C work. Requires sealed chamber and PPE.</li>
  <li><strong>Cerused / liming.</strong> White paste filler in the open grain produces the &ldquo;limed oak&rdquo; look popular in 1930s Hollywood.</li>
  <li><strong>Black-tinted oil.</strong> A modern Scandinavian look. Rubio Monocoat and Osmo are the two dominant brands.</li>
  <li><strong>Clear oil + waterborne topcoat.</strong> The default for &ldquo;natural&rdquo; modern kitchens. Two coats of WB poly over an oil seal preserves the warm tone.</li>
</ul>

<h2 id="working">Working notes</h2>
<ul>
  <li>Cuts cleanly with sharp carbide. Edge tools should be honed regularly &mdash; oak&rsquo;s ray cells are abrasive.</li>
  <li>Glues fine with PVA but the high tannin content can react with iron-bearing fasteners; use stainless or coated screws or you will see black streaks.</li>
  <li>Bends well with steam &mdash; one of the best species for bent laminations and steam-bent rails.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
  <li><a href="/wiki/article/hard-maple">Hard Maple</a></li>
  <li><a href="/wiki/article/veneer-matching">Veneer Matching</a></li>
</ul>
',
  8, true, now() - interval '34 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 10. Cabinet Vision vs Microvellum
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'cabinet-vision-vs-microvellum',
  'Cabinet Vision vs Microvellum',
  'Software',
  'cabinet-making',
  'The two dominant cabinet-engineering platforms. Different philosophies, different price points, different learning curves &mdash; and one of them is right for your shop.',
  E'
<p class="wa-lede">Two software platforms dominate North American cabinet engineering: <strong>Cabinet Vision</strong> (Hexagon / Vero) and <strong>Microvellum</strong>. Both turn a kitchen design into a CNC-ready cut list, but they take different routes there. Picking wrong costs a year and a six-figure-equivalent cost.</p>

<h2 id="philosophies">Different philosophies</h2>
<dl class="wa-specs">
  <dt>Cabinet Vision</dt><dd>Standalone application with a proprietary cabinet library. You drag pre-engineered cabinets onto a floorplan and adjust parameters. Design data flows through to manufacturing automatically.</dd>
  <dt>Microvellum</dt><dd>An add-on to AutoCAD. Cabinets are AutoCAD blocks driven by formulas in an Excel-like &ldquo;product wizard.&rdquo; You can build any cabinet you can mathematically describe.</dd>
</dl>

<h2 id="comparison">Side-by-side</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Cabinet Vision</th><th>Microvellum</th></tr></thead>
  <tbody>
    <tr><td>Foundation</td><td>Standalone app</td><td>AutoCAD plug-in</td></tr>
    <tr><td>Time to first useful kitchen</td><td>~2 weeks of training</td><td>~6&ndash;12 weeks of training</td></tr>
    <tr><td>Customization ceiling</td><td>Medium &mdash; library cabinets cover ~85% of needs</td><td>Effectively unlimited</td></tr>
    <tr><td>License cost</td><td>~$8&ndash;15k/seat plus subscription</td><td>~$10&ndash;18k/seat plus subscription</td></tr>
    <tr><td>Best for</td><td>Production kitchen shops, repeat product lines</td><td>Custom shops with unusual products, commercial casework, hospitality</td></tr>
    <tr><td>CNC post-processors</td><td>Built-in for major brands (Biesse, Homag, SCM, AXYZ)</td><td>Extensive; supports almost every CNC ever made</td></tr>
  </tbody>
</table>

<h2 id="cv-strengths">Cabinet Vision strengths</h2>
<ul>
  <li>Fast onboarding. A new operator can produce a kitchen in two weeks of full-time training.</li>
  <li>Strong rendering. Photo-realistic kitchen previews close jobs.</li>
  <li>Material optimizer is excellent for nest-yield improvement.</li>
</ul>

<h2 id="mv-strengths">Microvellum strengths</h2>
<ul>
  <li>Anything you can describe in math, you can build. Curved cabinets, conference room casework, parametric library work.</li>
  <li>Native AutoCAD output for architects and GCs.</li>
  <li>Per-product spreadsheets make pricing changes propagate automatically.</li>
</ul>

<div class="wa-callout">
<strong>Cabinet Vision is &ldquo;easier to learn, harder to bend.&rdquo; Microvellum is &ldquo;harder to learn, easier to bend.&rdquo;</strong> Production kitchens prefer the first; custom commercial work needs the second.
</div>

<h2 id="alternatives">Alternatives worth knowing</h2>
<ul>
  <li><strong>2020 Insight</strong> &mdash; design-front, less manufacturing depth.</li>
  <li><strong>eCabinets</strong> &mdash; free, Thermwood-tied; capable but smaller user base.</li>
  <li><strong>SketchList 3D</strong> &mdash; entry-level, hobby/very-small-shop tier.</li>
  <li><strong>imos</strong> &mdash; European Microvellum equivalent, very strong in commercial.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cnc-nesting">CNC Nesting</a></li>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
</ul>
',
  7, true, now() - interval '32 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 11. Drawer Slides
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'drawer-slides',
  'Drawer Slides',
  'Hardware',
  'cabinet-making',
  'Side-mount vs undermount, soft-close mechanics, weight ratings, and how Blum, Hettich, Salice, Grass, and Accuride compare for production cabinet work.',
  E'
<p class="wa-lede">A modern <strong>drawer slide</strong> is a precision-engineered telescoping ball-bearing or roller mechanism rated for tens of thousands of cycles. Picking the wrong type, the wrong length, or the wrong load rating shows up as a stuck drawer, a sagging front, or a slide that fails six months in.</p>

<h2 id="types">Slide types</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Side-mount ball-bearing</div>
    <div class="wa-variation-when">Most cabinets, easiest install, full extension</div>
    <div class="wa-variation-body">Two parallel slides on the sides of the drawer. Visible from inside the box. Workhorse choice. Accuride 3832, Blum Standard, Hettich KA series.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Undermount</div>
    <div class="wa-variation-when">Premium cabinetry, hidden hardware</div>
    <div class="wa-variation-body">Two slides under the drawer box. Invisible from above. Drawer box must have a precise undermount notch and rear hooks. Blum TANDEM, Hettich Quadro.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Center-mount roller</div>
    <div class="wa-variation-when">Traditional / inset face-frame work</div>
    <div class="wa-variation-body">Single roller slide under the drawer center. 3/4 extension typical. Period-correct on traditional pieces, replaced everywhere else.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Heavy-duty side-mount</div>
    <div class="wa-variation-when">Tool drawers, file cabinets, mechanic chests</div>
    <div class="wa-variation-body">100&ndash;500 lb capacity. Accuride 7957, Knape &amp; Vogt 8400. Used where standard 75 lb slides are not enough.</div>
  </div>
</div>

<h2 id="extensions">Extension types</h2>
<dl class="wa-specs">
  <dt>3/4 extension</dt><dd>Drawer pulls out 75% of its length. Cheapest, oldest. Avoid for kitchens.</dd>
  <dt>Full extension</dt><dd>Drawer pulls completely past the cabinet face. Modern default.</dd>
  <dt>Over-travel</dt><dd>Drawer extends ~1&Prime; past the cabinet face. Useful when face frames or pulls would otherwise block the back of the drawer.</dd>
</dl>

<h2 id="ratings">Load ratings</h2>
<table class="wa-table">
  <thead><tr><th>Rating</th><th>Use case</th><th>Typical slide</th></tr></thead>
  <tbody>
    <tr><td>75 lb</td><td>Kitchen utility drawers, dressers</td><td>Blum Standard, Accuride 3832</td></tr>
    <tr><td>100 lb</td><td>Pots/pans drawers, deep kitchen drawers</td><td>Blum TANDEM 569H, Accuride 4034</td></tr>
    <tr><td>150&ndash;200 lb</td><td>File drawers, bar refrigerator pull-outs</td><td>Knape &amp; Vogt 8400</td></tr>
    <tr><td>250+ lb</td><td>Tool chests, server racks</td><td>Accuride 7957, Hettich KA-7000</td></tr>
  </tbody>
</table>

<h2 id="soft-close">Soft close</h2>
<p>Almost universal on premium work in 2025. Implementation:</p>
<ul>
  <li><strong>Built-in.</strong> Damper integrated into slide (Blum BLUMOTION, Hettich Silent System). Best feel.</li>
  <li><strong>Add-on damper.</strong> Plastic cylinder clips to non-soft-close slides. Cheaper, can pop off.</li>
  <li><strong>Push-to-open.</strong> Mechanical kicker replaces handles. Common on minimalist designs. Rarely combined with soft-close on the same drawer because the geometry conflicts.</li>
</ul>

<h2 id="brands">Brand cheat sheet</h2>
<dl class="wa-specs">
  <dt>Blum (Austria)</dt><dd>Premium feel, BLUMOTION soft close gold standard, TANDEM undermount the industry default.</dd>
  <dt>Hettich (Germany)</dt><dd>Quadro undermount excellent. Slightly cheaper than Blum.</dd>
  <dt>Salice (Italy)</dt><dd>Strong specialty options, slightly less polished feel.</dd>
  <dt>Grass (Austria)</dt><dd>Dynapro undermount challenger. Common in commercial.</dd>
  <dt>Accuride (US)</dt><dd>The default for North American side-mount and heavy-duty applications.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/european-hinge-selection">European Hinge Selection</a></li>
  <li><a href="/wiki/article/the-32mm-system">The 32mm System</a></li>
</ul>
',
  8, true, now() - interval '30 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 12. Veneer Matching
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'veneer-matching',
  'Veneer Matching',
  'Materials',
  'cabinet-making',
  'Slip, book, end, sequence, balance, and random &mdash; the six matches every wall-paneling spec calls out, and what the architect will reject if you get them wrong.',
  E'
<p class="wa-lede"><strong>Veneer matching</strong> is the deliberate arrangement of consecutive veneer leaves to produce a desired figure. The architect specifies the match; the shop has to deliver it. This is the field manual.</p>

<h2 id="leaf-vs-flitch">Leaf vs flitch</h2>
<dl class="wa-specs">
  <dt>Leaf</dt><dd>One sheet of veneer, sliced from a log.</dd>
  <dt>Flitch</dt><dd>The bundle of leaves from one log, kept in slicing order.</dd>
  <dt>Bundle</dt><dd>Subset of a flitch sold to one customer. Leaves stay sequenced.</dd>
</dl>

<h2 id="six-matches">The six standard matches</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Slip match</div>
    <div class="wa-variation-when">Quartersawn, ribbon-figured species</div>
    <div class="wa-variation-body">Each leaf laid in slicing order, all face-up. Produces a uniform repeating pattern. Default for rift / quartered oak.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Book match</div>
    <div class="wa-variation-when">Plain-sliced or rotary species</div>
    <div class="wa-variation-body">Every other leaf flipped face-down. Adjacent leaves mirror each other &mdash; the &ldquo;butterfly&rdquo; pattern. Most common decorative match.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">End match</div>
    <div class="wa-variation-when">Tall panels where one leaf is not long enough</div>
    <div class="wa-variation-body">Leaves stacked end-to-end with the next leaf flipped. Used vertically; rare horizontally.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Sequence match</div>
    <div class="wa-variation-when">Premium AWS, conference rooms</div>
    <div class="wa-variation-body">Every panel in a room uses leaves from the same flitch in slicing order. Demands flitch tracking and tight take-off.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Balance match</div>
    <div class="wa-variation-when">Door fronts, drawer fronts</div>
    <div class="wa-variation-body">Leaves the same width on each panel, balanced left-to-right. Used when you want every door to look like a unit.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Random match</div>
    <div class="wa-variation-when">Rustic, mixed-grain species (knotty alder, hickory)</div>
    <div class="wa-variation-body">Leaves assembled deliberately out of order to celebrate variation. Sometimes called &ldquo;mismatched.&rdquo;</div>
  </div>
</div>

<h2 id="laying-up">Laying up</h2>
<p>Veneer is glued to a substrate with a press. Three common methods:</p>
<ul>
  <li><strong>Vacuum bag press.</strong> Cheapest, slowest. Used by small shops and one-off panels.</li>
  <li><strong>Hot press.</strong> Heated platens cure the glue in 5&ndash;15 minutes per cycle. Production standard.</li>
  <li><strong>Cold press.</strong> Hydraulic platens, cold glue (urea-formaldehyde or PVA). Slower cure, less expensive equipment.</li>
</ul>

<h2 id="balance-back">Balance veneer</h2>
<p>Every veneered panel must have a backing veneer of equal thickness on the opposite face, or the panel will cup. Even if no one will ever see the back, lay up a sacrificial veneer (typically birch or poplar) of comparable thickness.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
  <li><a href="/wiki/article/white-oak">White Oak</a></li>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
</ul>
',
  9, true, now() - interval '28 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 13. Edge Banding (NEW)
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'edge-banding',
  'Edge Banding',
  'Production',
  'cabinet-making',
  'Tape vs PVC vs ABS vs solid wood, hot-melt vs PUR, and the small differences between a cabinet edge that lasts ten years and one that peels in a year.',
  E'
<p class="wa-lede"><strong>Edge banding</strong> is the strip of material applied to the cut edge of a panel to hide the core, protect against moisture, and finish the visible edge. The banding choice and the adhesive determine how long the edge lasts.</p>

<h2 id="materials">Banding materials</h2>
<table class="wa-table">
  <thead><tr><th>Material</th><th>Thickness</th><th>Use case</th></tr></thead>
  <tbody>
    <tr><td>Veneer tape</td><td>0.4&ndash;0.6mm</td><td>Cheapest, sand-flush after application. AWI Economy.</td></tr>
    <tr><td>PVC</td><td>0.4&ndash;3mm</td><td>Most common. Color-matched to TFL or paint. AWI Custom.</td></tr>
    <tr><td>ABS</td><td>1&ndash;3mm</td><td>Like PVC but recyclable. Becoming the EU standard.</td></tr>
    <tr><td>Solid wood lipping</td><td>3&ndash;6mm</td><td>Premium. Glued and trimmed flush. Sands and finishes like solid wood.</td></tr>
    <tr><td>Acrylic / 3D laser</td><td>1&ndash;2mm</td><td>Glossy plastic with depth. Modern European look.</td></tr>
  </tbody>
</table>

<h2 id="adhesives">Hot-melt vs PUR</h2>
<dl class="wa-specs">
  <dt>EVA hot-melt</dt><dd>Standard, cheap, quick. Re-softens around 200&deg;F. Adequate for most kitchen interiors.</dd>
  <dt>PUR (polyurethane reactive)</dt><dd>Cures with moisture; bond is permanent and waterproof once cured. Mandatory for bathroom vanities, dishwasher panels, and any AWI Premium spec. Costs ~3&times; EVA.</dd>
</dl>

<div class="wa-callout">
<strong>PUR for any wet area.</strong> A bathroom vanity edge banded with EVA will peel within 18 months. PUR is non-negotiable.
</div>

<h2 id="machine">The edgebander</h2>
<p>A production edgebander does six things in sequence:</p>
<ol>
  <li>Pre-mill the panel edge true (optional but recommended).</li>
  <li>Apply glue from a heated reservoir.</li>
  <li>Press the band against the edge with a roller.</li>
  <li>End-trim flush with the panel ends.</li>
  <li>Top-and-bottom trim flush with the panel faces.</li>
  <li>Buff or scrape the edge for finish.</li>
</ol>

<h2 id="thickness">Thickness selection</h2>
<ul>
  <li><strong>0.5mm tape</strong> &mdash; cheapest but susceptible to chipping. Acceptable for non-traffic edges.</li>
  <li><strong>1mm</strong> &mdash; default for cabinet interiors. Resists impacts.</li>
  <li><strong>2mm</strong> &mdash; AWI Custom default. Hides minor panel-edge tear-out.</li>
  <li><strong>3mm</strong> &mdash; AWI Premium. Allows a radius bevel on the band, premium feel.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cnc-nesting">CNC Nesting</a></li>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
</ul>
',
  6, true, now() - interval '26 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 14. Walnut (NEW)
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'walnut',
  'Walnut — Species Reference',
  'Materials',
  'cabinet-making',
  'Black walnut (Juglans nigra) is the dominant North American premium cabinet species: stable, easy to finish, and the wood mid-century furniture made famous.',
  E'
<p class="wa-lede"><strong>Black walnut</strong> (<em>Juglans nigra</em>) is the premium North American cabinet hardwood. It is stable, machines beautifully, finishes with a depth few woods match, and was the species behind the entire mid-century modern furniture movement. It also costs roughly 3&times; what white oak does.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,010 lbf. Softer than oak or maple &mdash; a mark to careful hand-tool users.</dd>
  <dt>Specific gravity</dt><dd>0.55 air-dry.</dd>
  <dt>Modulus of rupture</dt><dd>14,600 psi.</dd>
  <dt>Shrinkage</dt><dd>Tangential 7.8%, radial 5.5%. Very stable.</dd>
  <dt>Color</dt><dd>Heartwood deep chocolate brown with purple/grey overtones; sapwood pale yellow.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li>Cuts cleanly with sharp tools. One of the easier hardwoods to plane and joint.</li>
  <li>Glues well; unaffected by tannin issues. Type I or II PVA hold.</li>
  <li>Dust is allergenic to a non-trivial percentage of people. Run dust collection.</li>
  <li><strong>Steam to even color.</strong> Kiln-dried walnut is sometimes steamed in the kiln to migrate color from heartwood to sapwood, producing a more uniform brown. &ldquo;Unsteamed&rdquo; or &ldquo;air-dried&rdquo; walnut shows more contrast.</li>
</ul>

<h2 id="finishing">Finishing strategy</h2>
<p>Walnut is one of the few species where the most beautiful finish is the simplest one: a clear oil + wax, or a sprayed clear topcoat over a sealer. Stain rarely improves it. The wood&rsquo;s natural color depth is what you are paying for.</p>
<table class="wa-table">
  <thead><tr><th>Goal</th><th>Schedule</th></tr></thead>
  <tbody>
    <tr><td>Modern, low sheen</td><td>Sand to 180, hardwax oil (Rubio Monocoat, Osmo). One coat.</td></tr>
    <tr><td>Mid-century classic</td><td>Sand to 220, oil-based wiping varnish, three coats with steel wool between.</td></tr>
    <tr><td>Production / spray</td><td>Sand to 180, vinyl sealer, two coats CV. Use natural CV (not water-clear) to keep the warmth.</td></tr>
    <tr><td>Color-locked</td><td>UV-blocking topcoat. Walnut fades to a lighter, greyer brown in direct sun over years.</td></tr>
  </tbody>
</table>

<div class="wa-callout">
<strong>Walnut is photo-sensitive.</strong> A walnut top in direct sunlight loses 5&ndash;10 ENV units of saturation in the first year. UV-blocking topcoats and curtains are not optional for kitchen islands near windows.
</div>

<h2 id="grades">Grades and figure</h2>
<dl class="wa-specs">
  <dt>FAS</dt><dd>83.3% clear face, defect-free pieces of 6&prime; or longer. Standard for furniture.</dd>
  <dt>1 Common</dt><dd>66.7% clear. Acceptable for cabinet panels, exposed only with knot strategy.</dd>
  <dt>Crotch / Burl</dt><dd>Highly figured cuts from junctions. Premium prices, used as veneer panels.</dd>
  <dt>Live edge / waney</dt><dd>Boards keeping the natural edge. Kitchen islands, dining tables. Stabilize knots and cracks with epoxy.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/white-oak">White Oak</a></li>
  <li><a href="/wiki/article/cherry">Cherry</a></li>
  <li><a href="/wiki/article/veneer-matching">Veneer Matching</a></li>
</ul>
',
  7, true, now() - interval '24 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 15. Cherry (NEW)
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'cherry',
  'Cherry — Species Reference',
  'Materials',
  'cabinet-making',
  'American black cherry (Prunus serotina) is the warm-toned classic American cabinet wood. It darkens dramatically with light, blotches under stain, and rewards a patient finishing schedule.',
  E'
<p class="wa-lede"><strong>American black cherry</strong> (<em>Prunus serotina</em>) is the wood of Shaker furniture, traditional Pennsylvania cabinetry, and a third of all 1990s home offices. It starts a pale pink-tan and matures over years to a deep red-brown. Stain it and you fight that natural progression; finish it clear and patience pays.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>950 lbf. Softer than walnut.</dd>
  <dt>Specific gravity</dt><dd>0.50 air-dry.</dd>
  <dt>Shrinkage</dt><dd>Tangential 7.1%, radial 3.7%. Excellent stability &mdash; one of the most stable hardwoods.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood pink-red maturing to red-brown.</dd>
</dl>

<h2 id="aging">Photo-darkening</h2>
<p>Cherry is the most light-reactive cabinet hardwood. A freshly-finished cherry door is salmon-pink; after six months it is honey-amber; after two years it is the warm red-brown clients expect. <strong>This is unavoidable.</strong> A hidden patch under a hinge plate stays salmon while the rest darkens around it. Before installing hardware on aged cherry, sun-tan the wood for at least a week.</p>

<h2 id="working">Working notes</h2>
<ul>
  <li>Machines very cleanly. One of the most pleasant hardwoods to cut.</li>
  <li><strong>Burns under dull cutters.</strong> Like maple, cherry shows scorch marks vividly.</li>
  <li><strong>Blotches under pigmented stain.</strong> Use a pre-stain conditioner, dye, or skip the stain entirely.</li>
  <li>Glues cleanly. Generally no surprises.</li>
</ul>

<h2 id="finishing">Finishing strategy</h2>
<p>Cherry rewards minimalism. The finish that adds the least and lets the wood do the work usually looks best.</p>
<ul>
  <li><strong>Sand to 220, two coats of WB poly.</strong> The default for production cabinet work. Lets the cherry darken naturally.</li>
  <li><strong>Tung oil + wiping varnish.</strong> Slow, hand-rubbed, traditional. Three to six coats over a couple of weeks.</li>
  <li><strong>Dye + clear.</strong> If the client wants the aged look immediately, dye to the target color before sealer.</li>
</ul>

<div class="wa-callout">
<strong>Avoid pigmented &ldquo;cherry&rdquo; stain.</strong> The factory color labeled &ldquo;cherry&rdquo; on a Minwax can blotches dramatically on real cherry and adds nothing. If a uniform dark color is the goal, dye is always cleaner.
</div>

<h2 id="grades">Grades</h2>
<dl class="wa-specs">
  <dt>FAS / 1 Common</dt><dd>Standard NHLA. Most cabinet stock is 1 Common.</dd>
  <dt>Curly / fiddleback</dt><dd>Wave-grain figure. Premium.</dd>
  <dt>Brown maple sold as &ldquo;cherry&rdquo;</dt><dd>Shop trick: brown maple stained with cherry-toned dye is sold as &ldquo;cherry&rdquo; in entry-level price points. Real cherry costs ~30% more.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
  <li><a href="/wiki/article/hard-maple">Hard Maple</a></li>
</ul>
',
  6, true, now() - interval '22 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 16. Plywood Grades (NEW)
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'plywood-grades',
  'Plywood Grades for Cabinet Work',
  'Materials',
  'cabinet-making',
  'A-1, B-2, shop grade, MR-MDF core, veneer core, combi-core &mdash; how the HPVA grade stamp actually translates to what you can use on which surface.',
  E'
<p class="wa-lede"><strong>Hardwood plywood</strong> is graded under the HPVA standard (HP-1). The grade tells you the appearance of the face veneer and back veneer separately, plus the core construction. Reading the grade stamp is the difference between specifying correctly and getting an unusable sheet.</p>

<h2 id="face-grades">Face grades</h2>
<table class="wa-table">
  <thead><tr><th>Grade</th><th>Defects allowed</th><th>Use</th></tr></thead>
  <tbody>
    <tr><td>AA</td><td>None visible. Premium architectural.</td><td>Boardroom paneling.</td></tr>
    <tr><td>A</td><td>Small repairs allowed. Sound, smooth.</td><td>Cabinet doors, exposed sides.</td></tr>
    <tr><td>B</td><td>Repaired knots, sound knots up to 1&Prime;.</td><td>Cabinet interiors.</td></tr>
    <tr><td>C</td><td>Knots, splits, color streaks.</td><td>Backs, hidden surfaces.</td></tr>
    <tr><td>D</td><td>Anything goes. Open knots permitted.</td><td>Industrial, hidden.</td></tr>
  </tbody>
</table>

<h2 id="grade-pairs">Grade pairs</h2>
<p>HPVA grades plywood as Face/Back. <strong>A-1</strong> is A face / 1 back &mdash; premium both sides. <strong>A-4</strong> is A face / 4 back &mdash; furniture grade face, utility back.</p>
<dl class="wa-specs">
  <dt>A-1</dt><dd>Both faces visible. Cabinet doors, free-standing furniture.</dd>
  <dt>A-2</dt><dd>One face visible, back hidden but sound. Cabinet doors with non-finished back.</dd>
  <dt>A-3 / A-4</dt><dd>Face visible, back fully hidden. Standard for cabinet sides.</dd>
  <dt>B-2 / B-3</dt><dd>Cabinet interiors, drawer parts.</dd>
  <dt>Shop grade</dt><dd>Off-spec material discounted heavily. Useful for jigs, prototypes.</dd>
</dl>

<h2 id="cores">Core construction</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Veneer core (VC)</div>
    <div class="wa-variation-when">Default cabinet ply</div>
    <div class="wa-variation-body">5, 7, 9, or 11 layers of softwood veneer alternating grain. Light, holds screws, slight surface telegraph through thin face veneers.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">MDF core</div>
    <div class="wa-variation-when">Painted slab doors, dead-flat panels</div>
    <div class="wa-variation-body">MDF middle, hardwood veneer faces. Heavy, dead-flat, no telegraph. Edges paint cleanly.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Particle core</div>
    <div class="wa-variation-when">Industrial, lowest cost</div>
    <div class="wa-variation-body">Particleboard middle. Heavy, doesn&rsquo;t hold screws as well as VC. Used in commercial casework where weight is OK.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Combi core</div>
    <div class="wa-variation-when">Premium cabinet work</div>
    <div class="wa-variation-body">Veneer core with MDF crossbands. Best of both: light + flat. ApplePly, Europly, ClassicCore.</div>
  </div>
</div>

<h2 id="moisture">Moisture resistance</h2>
<p>Standard urea-formaldehyde glue plywood is <em>interior</em>-only. For wet areas:</p>
<ul>
  <li><strong>MR-rated MDF core</strong> &mdash; moisture-resistant urea-melamine glue. Bath vanities, mudrooms.</li>
  <li><strong>Marine ply</strong> &mdash; phenolic glue, voids filled, exterior-rated. Boatbuilding, exterior millwork.</li>
  <li><strong>HDO / MDO</strong> &mdash; high/medium-density overlay, paint-grade exterior plywood. Sign panels, exterior cabinet ends.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
  <li><a href="/wiki/article/edge-banding">Edge Banding</a></li>
</ul>
',
  7, true, now() - interval '20 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 17. Face Frame Construction (NEW)
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'face-frame-construction',
  'Face Frame Construction',
  'Cabinet Making',
  'cabinet-making',
  'The North American traditional method: a hardwood frame nailed to the front of a plywood box. Pocket-screw vs M&T joinery, partial vs full overlay vs inset, and the cost trade-offs.',
  E'
<p class="wa-lede">A <strong>face frame</strong> is a hardwood frame &mdash; usually 3/4&Prime; thick &mdash; glued and pinned to the front of a plywood cabinet box. Doors and drawer fronts mount to the frame, not the box. It is the dominant traditional construction in North America and the default for any &ldquo;Shaker,&rdquo; &ldquo;inset,&rdquo; or beaded face-frame style.</p>

<h2 id="vs-frameless">Why face frame</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Face frame</th><th>Frameless</th></tr></thead>
  <tbody>
    <tr><td>Tolerance forgiveness</td><td>High &mdash; frame absorbs box variation</td><td>Low &mdash; box drives reveals</td></tr>
    <tr><td>Visible style</td><td>Traditional, Shaker, beaded inset</td><td>Modern, contemporary</td></tr>
    <tr><td>Inside opening</td><td>Smaller (stiles steal 1.5&Prime; per side)</td><td>Full panel width</td></tr>
    <tr><td>Hardware compatibility</td><td>Face-frame hinges (mortise, partial, or face-frame Euro)</td><td>Standard 32mm Euro</td></tr>
    <tr><td>Production speed</td><td>Slower (joinery and assembly)</td><td>Faster (line-bored panels)</td></tr>
  </tbody>
</table>

<h2 id="joinery">Frame joinery</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Pocket screw</div>
    <div class="wa-variation-when">Production shops, hidden joints</div>
    <div class="wa-variation-body">Drilled with a Kreg or PantoRouter jig. Fast, strong enough, the joint is hidden by the box. Industry default.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Mortise &amp; tenon</div>
    <div class="wa-variation-when">AWI Premium, exposed face frames</div>
    <div class="wa-variation-body">Cleanest, strongest. Required by AWI Premium. Slow without dedicated mortising equipment.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Dowel</div>
    <div class="wa-variation-when">European-influenced shops</div>
    <div class="wa-variation-body">8mm or 10mm dowels with glue. Quick on a doweling machine, hidden joint.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Half-lap</div>
    <div class="wa-variation-when">Beaded face frames</div>
    <div class="wa-variation-body">Stiles and rails halved together where they meet. Allows continuous bead profile through the joint.</div>
  </div>
</div>

<h2 id="overlay">Door overlay options</h2>
<dl class="wa-specs">
  <dt>Inset</dt><dd>Door sits flush within the opening with a 3/32&Prime; reveal. Most demanding to fit. Traditional / Shaker.</dd>
  <dt>Partial overlay</dt><dd>Door covers part of the stile, leaving 1&Prime;&ndash;1-1/4&Prime; of frame visible. Default for face-frame kitchens 1980&ndash;2000s.</dd>
  <dt>Full overlay</dt><dd>Door covers nearly all of the stile, ~1/8&Prime; reveal. Same look as frameless from the front.</dd>
  <dt>Beaded inset</dt><dd>Inset with a continuous bead profile around the opening. Highest-craft traditional look.</dd>
</dl>

<h2 id="dimensions">Standard dimensions</h2>
<dl class="wa-specs">
  <dt>Stile width</dt><dd>1-1/2&Prime; standard, 2&Prime; on premium work.</dd>
  <dt>Top rail</dt><dd>1-1/2&Prime; minimum.</dd>
  <dt>Bottom rail</dt><dd>1-1/2&Prime;&ndash;3&Prime; depending on toe-kick treatment.</dd>
  <dt>Frame thickness</dt><dd>3/4&Prime; standard. 7/8&Prime; for premium.</dd>
</dl>

<h2 id="hinges">Hardware notes</h2>
<p>Face-frame work uses one of three hinge families:</p>
<ul>
  <li><strong>Face-frame Euro hinge.</strong> Uses a special mounting plate that screws to the inside of the stile rather than the side panel. Most common modern choice.</li>
  <li><strong>Concealed inset hinge.</strong> Specialty Euro hinge with negative arm geometry for inset doors.</li>
  <li><strong>Butt / barrel hinge.</strong> Traditional brass hinge mortised into the door edge and stile. Used on high-end inset work.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
  <li><a href="/wiki/article/european-hinge-selection">European Hinge Selection</a></li>
  <li><a href="/wiki/article/mortise-and-tenon-joinery">Mortise &amp; Tenon Joinery</a></li>
</ul>
',
  8, true, now() - interval '18 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 18. Spray Booth Setup (NEW)
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'spray-booth-setup',
  'Spray Booth Setup',
  'Finishing',
  'finisher',
  'Cross-draft vs downdraft, makeup air, filtration, NFPA / OSHA compliance, and the small handful of decisions that separate a finishing operation from a fire hazard.',
  E'
<p class="wa-lede">A <strong>spray booth</strong> is the contained environment where catalyzed coatings get atomized at gun pressure. It is also a Class I Division 1 hazardous location under NFPA 33, an OSHA-regulated workplace, and the most common single source of cabinet-shop fires. Set it up right.</p>

<h2 id="airflow">Airflow types</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Cross-draft</div>
    <div class="wa-variation-when">Most cabinet shops</div>
    <div class="wa-variation-body">Air enters through filtered intake on one wall, sweeps horizontally across the booth, and exits through filtered exhaust on the opposite wall. Cheapest, simplest. Acceptable for most finishing.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Semi-downdraft</div>
    <div class="wa-variation-when">Production shops with floor space</div>
    <div class="wa-variation-body">Intake at ceiling near the front; exhaust at the back wall low. Air flows down and back, away from the finisher. Cleaner finish than cross-draft.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Full downdraft</div>
    <div class="wa-variation-when">Automotive, AWI Premium</div>
    <div class="wa-variation-body">Ceiling intake, floor exhaust through pit grates. Best dust control, most expensive. Requires a pit or raised platform.</div>
  </div>
</div>

<h2 id="airflow-rate">Required airflow</h2>
<dl class="wa-specs">
  <dt>OSHA minimum (1910.107)</dt><dd>100 fpm at the cross-section of the booth.</dd>
  <dt>NFPA 33</dt><dd>Same 100 fpm minimum, with caveats for vapor density and gun atomization volume.</dd>
  <dt>Practical for CV</dt><dd>120&ndash;150 fpm to keep overspray in front of the finisher and out of the breathing zone.</dd>
</dl>

<p>For an 8&prime; &times; 14&prime; cross-draft booth (cross-section 8 &times; 8 = 64 sq ft), required exhaust = 64 &times; 100 = 6,400 CFM minimum.</p>

<h2 id="makeup-air">Makeup air</h2>
<p>Every cubic foot you exhaust has to be replaced. In summer this means tempered makeup air; in winter, heated. Without makeup air, the booth pulls negative pressure on the building, drags exhaust gases from the furnace through the building, and stalls the booth itself.</p>
<ul>
  <li>Direct-fired makeup air units (MAU) heat incoming air with a gas burner in the airstream. Most common.</li>
  <li>Indirect-fired MAU keeps combustion gases out of the supply stream. Required in some jurisdictions.</li>
  <li>Sizing: MAU CFM = booth exhaust CFM &times; 0.95 (slight negative pressure).</li>
</ul>

<h2 id="filtration">Filtration</h2>
<dl class="wa-specs">
  <dt>Intake filters</dt><dd>2&Prime; pleated MERV 8&ndash;11. Replace every 200&ndash;400 hours of run time.</dd>
  <dt>Exhaust filters</dt><dd>Paint-arrestor pads, multiple stages. Last filter must capture 95%+ of overspray. Replace based on pressure-drop reading, typically every 80&ndash;200 hours.</dd>
  <dt>Pressure differential</dt><dd>A magnehelic gauge across the exhaust filters tells you when to change. Above 0.5&Prime; w.c. means the filter is loaded.</dd>
</dl>

<div class="wa-callout">
<strong>Loaded exhaust filters are a fire risk.</strong> Overspray-saturated paint arrestors can self-ignite. Change them on schedule, and never store used filters inside the building.
</div>

<h2 id="electrical">Electrical and explosion-proof equipment</h2>
<p>Inside the booth and within 3&prime; of any spray operation, all electrical fittings must be Class I Division 1 rated.</p>
<ul>
  <li><strong>Lighting</strong> behind explosion-proof glass, sealed.</li>
  <li><strong>Outlets</strong> outside the booth or rated explosion-proof if inside.</li>
  <li><strong>Motors</strong> on exhaust fans &mdash; either non-sparking (aluminum impeller, brass parts) or remotely mounted with belt drive through a wall.</li>
  <li><strong>No power tools inside the booth during spray.</strong></li>
</ul>

<h2 id="ppe">Operator PPE</h2>
<ul>
  <li><strong>Supplied-air respirator</strong> for all isocyanate or formaldehyde-bearing finishes (CV, 2K WB, 2K poly). Cartridge respirators are insufficient.</li>
  <li>Tyvek suit for full coverage on whites/lacquers.</li>
  <li>Nitrile gloves &mdash; CV catalyst burns skin.</li>
  <li>Eye protection.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/conversion-varnish-vs-waterborne">Conversion Varnish vs Waterborne</a></li>
  <li><a href="/wiki/article/dust-collection">Dust Collection</a></li>
</ul>
',
  9, true, now() - interval '16 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();
