-- ============================================================
-- migration-wiki-encyclopedia-v3-trades.sql
--
-- Fills the gap on installation, estimating, and project management.
-- 10 articles using the same wa-* layout components.
--
-- Idempotent: every row uses on conflict (slug) do update.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 69. Cabinet Installation Sequence
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'cabinet-installation-sequence',
  'Cabinet Installation Sequence',
  'Shop & Business',
  'installer',
  'Order matters. Wall first or base first, why high-spot reference is non-negotiable, and the sequence that a two-person crew can finish in a day instead of three.',
  E'
<p class="wa-lede">A clean cabinet install is mostly about <strong>sequence</strong>. The cabinets are already built; the question is the order in which they go on the wall and how they reference each other. Get the first one wrong and every subsequent box compounds the error.</p>

<h2 id="prep">Site prep before any cabinet touches the wall</h2>
<ol>
  <li><strong>Empty the room.</strong> Drywall finished, painted, primed; floor down or covered.</li>
  <li><strong>Stud-mark every wall</strong> with a 5&prime;-long pencil line at finished base height.</li>
  <li><strong>Check for plumb / square / level.</strong> Every wall, every corner. Out-of-square corners get a filler.</li>
  <li><strong>Find the high spot of the floor.</strong> Snap a chalk line at the base-cabinet height referenced from that high spot. Every base cabinet shims up to this line; nobody shims down.</li>
  <li><strong>Locate appliances, plumbing, electrical.</strong> Sink-base cutouts, fridge cabinet height, dishwasher rough-in.</li>
</ol>

<h2 id="order">The standard sequence</h2>
<ol>
  <li><strong>Wall cabinets first.</strong> Standing on the floor is easier than reaching over a base run. Start with the longest run on the most-visible wall.</li>
  <li><strong>Anchor each upper to studs</strong> with two #10 cabinet screws minimum, three for boxes &gt; 30&Prime; wide.</li>
  <li><strong>Screw adjacent uppers together</strong> at the front face frames or end panels before tightening to the wall.</li>
  <li><strong>Set the first base cabinet</strong> &mdash; the most visible corner, plumbed and level to the chalk line.</li>
  <li><strong>Connect each subsequent base box</strong> to the previous one before screwing to the wall.</li>
  <li><strong>Tall cabinets / pantries last.</strong> They&rsquo;re the easiest to slip in once neighbors are set.</li>
  <li><strong>End panels and scribe strips</strong> after all boxes are anchored.</li>
  <li><strong>Toe kicks and crown</strong> last.</li>
</ol>

<div class="wa-callout">
<strong>Connect boxes to each other before walls.</strong> Tight reveals are about box-to-box, not box-to-wall. Two boxes screwed to each other and shimmed against the wall stay aligned; two boxes independently screwed to walls drift.
</div>

<h2 id="leveling">Leveling the first base</h2>
<ul>
  <li>Set the box on shims to the chalk line.</li>
  <li>Level front-to-back AND side-to-side. Both have to be flat.</li>
  <li>Confirm with a 4&prime; level &mdash; pocket levels lie about flatness over distance.</li>
  <li>Drive shim-anchored screws into studs at the back rail and rear toe-kick rail.</li>
</ul>

<h2 id="appliances">Appliance coordination</h2>
<ul>
  <li>Refrigerator opening: confirm width, depth, and electrical box location before screwing tall cabinets.</li>
  <li>Dishwasher: 24&Prime; opening, water and drain rough-in centered, electrical to one side.</li>
  <li>Range / cooktop: gas vs electric, hood location, ventilation duct path.</li>
  <li>Sink base: cutout to template, plumbing rough-in centered.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/scribing-and-field-fitting">Scribing and Field Fitting</a></li>
  <li><a href="/wiki/article/plumb-level-square">Plumb, Level, Square</a></li>
  <li><a href="/wiki/article/filler-strips-and-end-panels">Filler Strips and End Panels</a></li>
</ul>
',
  7, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 70. Scribing and Field Fitting
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'scribing-and-field-fitting',
  'Scribing and Field Fitting',
  'Shop & Business',
  'installer',
  'How to mark a cabinet end against an out-of-plumb wall and trim it to fit without measuring.',
  E'
<p class="wa-lede"><strong>Scribing</strong> is the technique of transferring a wall&rsquo;s irregularities to the edge of a cabinet so it can be trimmed for a tight fit. No house has perfectly plumb walls, and frameless cabinetry has zero forgiveness against an irregular surface. Every cabinet against an end wall gets scribed.</p>

<h2 id="tools">Tools</h2>
<dl class="wa-specs">
  <dt>Compass / scribe tool</dt><dd>Two metal points, one rides the wall, one marks the cabinet edge. $5 hardware-store tool.</dd>
  <dt>Sharp pencil or fine marker</dt><dd>Pencil reads on natural wood; marker reads on melamine.</dd>
  <dt>Jigsaw or block plane</dt><dd>Jigsaw for fast, plane for clean.</dd>
  <dt>Belt sander</dt><dd>Final cleanup of the scribed edge.</dd>
</dl>

<h2 id="process">The process</h2>
<ol>
  <li><strong>Set the cabinet roughly in place.</strong> Plumb it level and parallel to its neighbor.</li>
  <li><strong>Push the cabinet against the wall</strong> until the leading edge touches.</li>
  <li><strong>Set your scribe gap.</strong> Open the compass to the widest gap between the cabinet and wall.</li>
  <li><strong>Run the compass</strong> along the wall, with the marking leg riding the cabinet edge. The line drawn is parallel to the wall&rsquo;s irregularities.</li>
  <li><strong>Cut to the line</strong> with a jigsaw, slightly inside.</li>
  <li><strong>Refine with a block plane</strong> back to the line.</li>
  <li><strong>Test fit.</strong> If gaps remain, repeat with smaller scribe.</li>
</ol>

<h2 id="scribe-strips">Scribe strips</h2>
<p>A <strong>scribe strip</strong> is a 3/4&Prime; sacrificial board attached to the exposed end of a cabinet that gets scribed instead of the cabinet itself. Most production shops use scribe strips on every end-wall cabinet so the box stays unmodified.</p>

<div class="wa-callout">
<strong>Scribe wider than you think you need.</strong> A 1/4&Prime; scribe gap turns into 1&Prime; on an old plaster wall. 3/4&Prime; minimum, 1&Prime; on plaster.
</div>

<h2 id="filler-vs-scribe">Filler vs scribe</h2>
<p>A <strong>filler</strong> is a strip between cabinets. A <strong>scribe</strong> is a strip cut to fit a wall. Both are common; pick the one that fits the situation.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cabinet-installation-sequence">Cabinet Installation Sequence</a></li>
  <li><a href="/wiki/article/filler-strips-and-end-panels">Filler Strips and End Panels</a></li>
</ul>
',
  5, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 71. Plumb, Level, Square
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'plumb-level-square',
  'Plumb, Level, Square',
  'Shop & Business',
  'installer',
  'The three measurements that determine whether the rest of the install goes well or fights you for three days.',
  E'
<p class="wa-lede">Three checks, in this order, made before any cabinet touches a wall: <strong>plumb</strong> (vertical), <strong>level</strong> (horizontal), <strong>square</strong> (90&deg;). Any deviation has to be absorbed by fillers, scribes, or shims; finding it before the install is the difference between a one-day job and three days of fighting reveals.</p>

<h2 id="plumb">Checking plumb</h2>
<dl class="wa-specs">
  <dt>Tool</dt><dd>4&prime; or 6&prime; level on every exposed wall.</dd>
  <dt>Acceptable</dt><dd>1/8&Prime; out over 8&prime; (~0.07&deg;).</dd>
  <dt>Marginal</dt><dd>1/4&Prime; out over 8&prime; (0.15&deg;) &mdash; absorb in scribe strip.</dd>
  <dt>Problem</dt><dd>3/8&Prime;+ out &mdash; tall cabinet rocks at top, doors swing crooked. Need 3/4&Prime; scribe minimum or remove drywall.</dd>
</dl>

<h2 id="level">Checking level</h2>
<dl class="wa-specs">
  <dt>Tool</dt><dd>Laser level set to base-cabinet height.</dd>
  <dt>Method</dt><dd>Find the high point of the floor along the cabinet run. Mark a level line on the wall from that point.</dd>
  <dt>Acceptable</dt><dd>1/4&Prime; variance over 10&prime; (1/40&Prime; per foot).</dd>
  <dt>Problem</dt><dd>1/2&Prime;+ over 10&prime; &mdash; toe-kick gap shows. Plan for adjustable feet or scribe the toe.</dd>
</dl>

<h2 id="square">Checking square</h2>
<dl class="wa-specs">
  <dt>Tool</dt><dd>3-4-5 method or framing square.</dd>
  <dt>Method</dt><dd>Mark 3&prime; from the corner along one wall, 4&prime; along the other. Diagonal between marks should measure exactly 5&prime;.</dd>
  <dt>Acceptable</dt><dd>5&prime; +/- 1/8&Prime;.</dd>
  <dt>Problem</dt><dd>5&prime;-1/2&Prime;+ &mdash; out of square. Plan for an inside-corner filler that splits the difference.</dd>
</dl>

<h2 id="documentation">Document everything</h2>
<p>Photograph the room, mark a sketch with the measurements, and email it back to the shop before the cabinets are loaded. A shop that finds out about a 1/2&Prime;-out-of-square corner during install has to rebuild a corner; finding out before delivery costs nothing.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cabinet-installation-sequence">Cabinet Installation Sequence</a></li>
  <li><a href="/wiki/article/scribing-and-field-fitting">Scribing and Field Fitting</a></li>
</ul>
',
  5, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 72. Filler Strips and End Panels
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'filler-strips-and-end-panels',
  'Filler Strips and End Panels',
  'Shop & Business',
  'installer',
  'The trim pieces that absorb the difference between perfect cabinet boxes and imperfect rooms — and the rules for sizing them so the kitchen does not look pieced together.',
  E'
<p class="wa-lede"><strong>Fillers</strong> bridge gaps between cabinets and walls. <strong>End panels</strong> finish the exposed sides of cabinets where the box ends. Together they absorb every irregularity in the room and turn a stack of identical boxes into a finished kitchen.</p>

<h2 id="fillers">Fillers</h2>
<dl class="wa-specs">
  <dt>Wall filler</dt><dd>Strip between cabinet and wall. 1&Prime;&ndash;3&Prime; wide, scribed to fit.</dd>
  <dt>Inside-corner filler</dt><dd>Strip at L-corner that prevents adjacent doors from colliding. Width = (door swing clearance) + (face-frame thickness) typically 2-1/2&Prime;&ndash;3&Prime;.</dd>
  <dt>Appliance filler</dt><dd>Strip between cabinet and refrigerator/range. 1/2&Prime;&ndash;1&Prime; for breathing room and door swing.</dd>
  <dt>Top filler</dt><dd>Strip between cabinet top and ceiling, hidden behind crown.</dd>
</dl>

<h2 id="end-panels">End panels</h2>
<dl class="wa-specs">
  <dt>Skin panel</dt><dd>1/4&Prime;&ndash;1/2&Prime; thick veneer or paint-grade panel glued to the exposed side. Thickness matches the rest of the run.</dd>
  <dt>Decorative end</dt><dd>Frame-and-panel or shaker-style applied piece for visual emphasis (island ends, fridge ends).</dd>
  <dt>Stacked end</dt><dd>Box has a sacrificial gable, then a finished end panel laminated over.</dd>
  <dt>Nailed-on shoe / toe kick</dt><dd>Trim that finishes the bottom of an exposed end down to the floor.</dd>
</dl>

<h2 id="sizing-rules">Sizing rules</h2>
<ul>
  <li>End fillers minimum <strong>1/2&Prime;</strong> for adjustable hinge clearance.</li>
  <li>Inside-corner fillers minimum <strong>2-1/2&Prime;</strong> on standard 1-1/8&Prime; door swing.</li>
  <li>Appliance fillers <strong>1/2&Prime; minimum on dishwashers</strong>, 1&Prime; on refrigerators (allow for venting).</li>
  <li>End panels <strong>match cabinet finish</strong> exactly &mdash; veneer face, sequence-matched if a stain-grade kitchen.</li>
</ul>

<div class="wa-callout">
<strong>Order spare end panels at quote.</strong> Shop-finished panels can&rsquo;t be touched up at install. A scratched end panel without a spare delays the entire job.
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/scribing-and-field-fitting">Scribing and Field Fitting</a></li>
  <li><a href="/wiki/article/cabinet-installation-sequence">Cabinet Installation Sequence</a></li>
</ul>
',
  5, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 73. Take-Off from Architectural Drawings
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'takeoff-from-drawings',
  'Take-Off from Architectural Drawings',
  'Shop & Business',
  'cabinet-making',
  'Reading a kitchen plan, counting cabinets accurately, and the small handful of details that distinguish a winning bid from a losing one.',
  E'
<p class="wa-lede">A <strong>take-off</strong> is the process of reading a set of architectural drawings and producing a complete count of every cabinet, panel, hardware piece, and material the shop needs to fabricate. The accuracy of the take-off determines whether the bid is profitable.</p>

<h2 id="drawings">What you receive</h2>
<dl class="wa-specs">
  <dt>Floor plan</dt><dd>Top-down view. Shows cabinet runs, appliance locations, plumbing fixtures.</dd>
  <dt>Elevations</dt><dd>Front views of each cabinet wall. Shows door layout, drawer count, panel sizes.</dd>
  <dt>Sections</dt><dd>Cut-away views. Shows depth, internal organization (drawer rollouts, etc.).</dd>
  <dt>Details</dt><dd>Custom features, banquettes, specialty millwork.</dd>
  <dt>Specifications</dt><dd>Written description: AWI grade, species, finish, hardware brand and model.</dd>
</dl>

<h2 id="counting">The count</h2>
<ol>
  <li>Trace each cabinet on the elevation; assign it a code (B30 = base 30&Prime;, W3036 = wall 30&Prime; wide &times; 36&Prime; tall, etc.).</li>
  <li>Count doors per cabinet.</li>
  <li>Count drawers per cabinet.</li>
  <li>Note specials (lazy susan, pull-out trash, soft-close at appliance).</li>
  <li>Count exposed ends.</li>
  <li>Count crown linear footage.</li>
  <li>Count toe-kick linear footage.</li>
</ol>

<h2 id="material-takeoff">Material take-off</h2>
<p>From the cabinet count, derive sheet count:</p>
<ul>
  <li>~3.5 sheets of 4&times;8 ply per linear foot of base cabinet (frameless).</li>
  <li>~2.5 sheets per linear foot of wall cabinet.</li>
  <li>~1 sheet per pantry / oven cabinet.</li>
  <li>Plus 12&ndash;15% waste factor.</li>
</ul>

<h2 id="redflags">Red flags to look for</h2>
<ul>
  <li><strong>Inconsistent dimensions.</strong> Plan says 30&Prime;, elevation says 27&Prime;. Always confirm.</li>
  <li><strong>Specs that conflict with details.</strong> Cover sheet says &ldquo;Custom AWI&rdquo; but cabinet section says &ldquo;Premium where exposed.&rdquo;</li>
  <li><strong>Missing dimensions.</strong> &ldquo;Equal&rdquo; or &ldquo;align&rdquo; without a number means an RFI.</li>
  <li><strong>Field-verify notes.</strong> &ldquo;FV&rdquo; on a dimension means the architect didn&rsquo;t commit. Add a contingency.</li>
  <li><strong>Out-of-square corners shown as 90&deg;.</strong> Drawings rarely show actual conditions.</li>
</ul>

<div class="wa-callout">
<strong>Issue an RFI for every ambiguity.</strong> Five RFIs upfront cost an hour. A wrong assumption discovered at install costs a week.
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/labor-hour-estimating">Labor Hour Estimating</a></li>
  <li><a href="/wiki/article/bid-documents">Bid Documents</a></li>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
</ul>
',
  6, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 74. Labor Hour Estimating
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'labor-hour-estimating',
  'Labor Hour Estimating',
  'Shop & Business',
  'cabinet-making',
  'Hours per cabinet box, hours per linear foot of crown, hours per door — building a labor estimate that survives contact with the actual job.',
  E'
<p class="wa-lede"><strong>Labor estimating</strong> is the second-largest line item in a cabinet bid (after material) and the one most prone to wishful thinking. The shops that survive in business have a real feedback loop between estimated and actual hours.</p>

<h2 id="benchmarks">Benchmark hours</h2>
<table class="wa-table">
  <thead><tr><th>Operation</th><th>Hours</th></tr></thead>
  <tbody>
    <tr><td>Frameless box (CNC + bander + assembly)</td><td>0.6&ndash;1.0 per cabinet</td></tr>
    <tr><td>Face-frame box</td><td>1.5&ndash;2.5 per cabinet</td></tr>
    <tr><td>Door, painted Shaker, pre-bought</td><td>0.2 per door (install only)</td></tr>
    <tr><td>Door, in-house Shaker, painted</td><td>0.8 per door (rails+stiles+panel+paint)</td></tr>
    <tr><td>Drawer box (assembled, dovetail)</td><td>0.4 per box (in-house) or 0.1 (purchased)</td></tr>
    <tr><td>Hinge install</td><td>0.05 per hinge</td></tr>
    <tr><td>Drawer slide install</td><td>0.15 per pair</td></tr>
    <tr><td>Pull / knob install (with jig)</td><td>0.05 per pull</td></tr>
    <tr><td>Crown molding fabrication+install</td><td>0.5 per LF</td></tr>
    <tr><td>Site install (per cabinet, average)</td><td>1.0&ndash;1.5</td></tr>
    <tr><td>Finish: paint Shaker door (3 coats)</td><td>0.4 per door</td></tr>
    <tr><td>Finish: stain + CV (3 coats)</td><td>0.7 per door</td></tr>
  </tbody>
</table>

<h2 id="multipliers">Complexity multipliers</h2>
<dl class="wa-specs">
  <dt>Standard frameless</dt><dd>1.0x baseline.</dd>
  <dt>Inset face frame</dt><dd>1.4x (more fitting time).</dd>
  <dt>Stain-grade with sequence-matched veneer</dt><dd>1.6x.</dd>
  <dt>Furniture-grade hand-cut joinery</dt><dd>3.0x.</dd>
  <dt>Curved or radius work</dt><dd>2.0&ndash;4.0x depending.</dd>
</dl>

<h2 id="contingency">Contingency</h2>
<p>Add 10&ndash;15% to the estimated hours for:</p>
<ul>
  <li>Re-makes from damage in transit or install.</li>
  <li>Field-fitting beyond what the drawings showed.</li>
  <li>Punch list rework.</li>
  <li>Coordination with adjacent trades (countertop installer, electrician).</li>
</ul>

<div class="wa-callout">
<strong>Track every hour against a job code.</strong> Even rough TimeClock data over six months gives you the multipliers your specific shop runs. Generic benchmarks are starting points; your numbers are real.
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/pricing-cabinet-jobs">Pricing Cabinet Jobs</a></li>
  <li><a href="/wiki/article/takeoff-from-drawings">Take-Off from Drawings</a></li>
</ul>
',
  6, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 75. Bid Documents
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'bid-documents',
  'Bid Documents',
  'Shop & Business',
  'cabinet-making',
  'What goes into a quote, what gets left out, and the small handful of paragraphs that protect you when scope changes after the contract.',
  E'
<p class="wa-lede">A <strong>bid</strong> is more than a number. It is the contract that defines what you will deliver and on what terms. The bid documents are what you point at when the client says &ldquo;I thought this was included.&rdquo;</p>

<h2 id="components">Required components</h2>
<ol>
  <li><strong>Cover page</strong> with project name, client, date, total dollar amount, validity (typically 30 days).</li>
  <li><strong>Scope of work</strong> &mdash; what you are building. Cabinet count, door style, species, finish, hardware brand and model.</li>
  <li><strong>Inclusions</strong> &mdash; explicit list of what the bid covers (delivery, installation, hardware, finish, soft-close).</li>
  <li><strong>Exclusions</strong> &mdash; explicit list of what is NOT covered (countertops, electrical, plumbing, drywall repair, paint touch-up of walls).</li>
  <li><strong>Allowances</strong> &mdash; placeholder dollar amounts for items not yet specified (hardware allowance, end-panel allowance).</li>
  <li><strong>Payment schedule</strong> &mdash; deposit, progress, final.</li>
  <li><strong>Timeline</strong> &mdash; lead time from deposit to delivery, install duration.</li>
  <li><strong>Change-order policy</strong> &mdash; how scope changes are priced and approved.</li>
  <li><strong>Warranty</strong> &mdash; what you cover, how long, what voids it.</li>
  <li><strong>Signature blocks</strong> for both parties.</li>
</ol>

<h2 id="payment">Standard payment schedule</h2>
<dl class="wa-specs">
  <dt>Deposit</dt><dd>30&ndash;50% on contract signing &mdash; covers material and engineering.</dd>
  <dt>Progress</dt><dd>30&ndash;40% on delivery to site.</dd>
  <dt>Final</dt><dd>10&ndash;20% on substantial completion (post-punch list).</dd>
</dl>

<h2 id="exclusions">Exclusion examples (use these literally)</h2>
<ul>
  <li>Countertops, sinks, faucets.</li>
  <li>Appliances and appliance installation.</li>
  <li>Plumbing rough-in and final connections.</li>
  <li>Electrical rough-in and final connections.</li>
  <li>Drywall repair, paint, or wallpaper touch-up.</li>
  <li>Floor protection beyond standard rosin paper.</li>
  <li>Demolition or removal of existing cabinetry.</li>
  <li>Permit fees.</li>
  <li>Repairs to subfloor, walls, or ceiling discovered during install.</li>
</ul>

<div class="wa-callout">
<strong>Allowance items are double-edged.</strong> They let you price the bid before specs are finalized but they also commit you to the allowance number. Always note that &ldquo;allowance is for product cost only; install labor billed separately if upgraded.&rdquo;
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/change-orders">Change Orders</a></li>
  <li><a href="/wiki/article/pricing-cabinet-jobs">Pricing Cabinet Jobs</a></li>
</ul>
',
  6, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 76. Production Scheduling
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'production-scheduling',
  'Production Scheduling',
  'Shop & Business',
  'cabinet-making',
  'CNC queue, finish queue, and the sequencing that lets a 3-person shop deliver four kitchens a month without overtime.',
  E'
<p class="wa-lede"><strong>Production scheduling</strong> is the discipline that turns a stack of contracted jobs into a steady stream of completed kitchens. The bottleneck is rarely the CNC or the finish booth in isolation; it is the synchronization between them.</p>

<h2 id="constraints">The two real constraints</h2>
<dl class="wa-specs">
  <dt>CNC capacity</dt><dd>How many sheets per day the router cuts. Typical small-shop CNC: 15&ndash;25 sheets per shift.</dd>
  <dt>Finish capacity</dt><dd>How many doors / drawers / panels can be painted or sprayed per day. Typical: 30&ndash;60 doors per booth-day.</dd>
</dl>

<p>One job pushes about 50&ndash;80 doors and 80&ndash;150 panels through. Two jobs running in parallel always exceed booth capacity unless one is a paint-grade slab and the other is stain-grade.</p>

<h2 id="schedule">Block scheduling</h2>
<p>Most small shops use a weekly Gantt with two parallel swim lanes:</p>
<ul>
  <li><strong>Lane 1: CNC + assembly.</strong> 1&ndash;3 days per kitchen.</li>
  <li><strong>Lane 2: Doors + finish.</strong> 5&ndash;10 days per kitchen (driven by paint cycle times).</li>
  <li><strong>Convergence:</strong> Boxes ready 3&ndash;4 days before doors. Lay them up, scribe, prep for delivery while doors finish.</li>
</ul>

<h2 id="lead-times">Standard lead times</h2>
<table class="wa-table">
  <thead><tr><th>Phase</th><th>Days</th></tr></thead>
  <tbody>
    <tr><td>Engineering / drawing approval</td><td>5&ndash;10</td></tr>
    <tr><td>Material order to arrival</td><td>3&ndash;7</td></tr>
    <tr><td>CNC + assembly</td><td>3&ndash;5</td></tr>
    <tr><td>Door manufacturing (in-house)</td><td>5&ndash;10</td></tr>
    <tr><td>Finish (3 coats)</td><td>5&ndash;7</td></tr>
    <tr><td>Buffer / staging</td><td>2&ndash;3</td></tr>
    <tr><td>Total typical lead time</td><td>23&ndash;42 days from deposit to delivery</td></tr>
  </tbody>
</table>

<h2 id="tools">Tools</h2>
<ul>
  <li>Trello, Asana, or Monday for visual swim lanes.</li>
  <li>ERP systems (Innergy, Allmoxy) for shops with 5+ employees.</li>
  <li>A whiteboard with magnetic job tags works for solo shops.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/shop-layout">Shop Layout</a></li>
  <li><a href="/wiki/article/pricing-cabinet-jobs">Pricing Cabinet Jobs</a></li>
</ul>
',
  5, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 77. Change Orders
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'change-orders',
  'Change Orders',
  'Shop & Business',
  'cabinet-making',
  'How to handle scope changes after contract signing without losing the relationship or the margin. The form, the conversation, and the line that turns "while you''re at it" into a billable item.',
  E'
<p class="wa-lede">A <strong>change order</strong> is the contract amendment that documents any modification to scope, price, or schedule after the original contract is signed. Half of the cabinet shops that fail do so because they did not write change orders. The other half failed because their change-order practice was hostile.</p>

<h2 id="when">When you need one</h2>
<ul>
  <li>Adding or removing cabinets.</li>
  <li>Changing door style, species, or finish.</li>
  <li>Changing hardware specification.</li>
  <li>Field discoveries (out-of-plumb walls beyond expected, hidden plumbing).</li>
  <li>Schedule changes (client delaying delivery, job site not ready).</li>
  <li>Anything the client says &ldquo;while you&rsquo;re at it.&rdquo;</li>
</ul>

<h2 id="form">The form</h2>
<ol>
  <li>Project name, change order number (sequential), date.</li>
  <li>Description of change &mdash; what is being added, removed, or modified.</li>
  <li>Cost of change &mdash; itemized: material delta, labor delta, finish delta, install delta.</li>
  <li>Schedule impact &mdash; days added or saved.</li>
  <li>New contract total.</li>
  <li>Payment terms (typically due with the change-order signature).</li>
  <li>Signature blocks for both parties.</li>
</ol>

<h2 id="pricing">Pricing change orders</h2>
<dl class="wa-specs">
  <dt>Material at retail</dt><dd>Markup as on original bid (typically 1.4&ndash;1.6x cost).</dd>
  <dt>Labor at burdened rate</dt><dd>Plus 10&ndash;20% premium for break in production flow.</dd>
  <dt>Re-engineering fee</dt><dd>$200&ndash;500 if the change requires drawing revisions.</dd>
  <dt>Restocking fee</dt><dd>15&ndash;25% if the original work has to be undone.</dd>
</dl>

<div class="wa-callout">
<strong>Get the signature before doing the work.</strong> A change order signed after the cabinets are remade is a request for retroactive payment. Get the signature, then proceed.
</div>

<h2 id="conversations">The conversation</h2>
<p>Most clients are not trying to take advantage; they don&rsquo;t realize a small change is a real cost. Lead with: &ldquo;Sure, we can do that &mdash; let me write up the change order so we both have it documented.&rdquo; Most clients accept the conversation framing and pay the change without resistance. The few who push back will tell you a lot about how the rest of the project will go.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/bid-documents">Bid Documents</a></li>
</ul>
',
  6, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 78. Punch List Management
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'punch-list-management',
  'Punch List Management',
  'Shop & Business',
  'installer',
  'The final 5% of the project that takes 30% of the time if you do not control it. How to scope, schedule, and close out punch list work.',
  E'
<p class="wa-lede">A <strong>punch list</strong> is the list of small items remaining at substantial completion. Industry rule of thumb: the last 5% of work consumes 30% of the project hours if you do not actively manage the list to closure.</p>

<h2 id="walkthrough">The walkthrough</h2>
<ol>
  <li>Schedule with the client at substantial completion (cabinets installed, doors hung, hardware on, finish complete).</li>
  <li>Walk every cabinet with the client. Open every door, every drawer.</li>
  <li>Mark every item the client identifies on a numbered list.</li>
  <li>Photograph each item.</li>
  <li>Categorize: <strong>install correction</strong> (we caused it), <strong>warranty</strong> (defect in product), <strong>change order</strong> (client wants something different).</li>
  <li>Sign and date the punch list with both parties.</li>
</ol>

<h2 id="standard-items">Common punch items</h2>
<ul>
  <li>Hinge adjustments (every kitchen needs 5&ndash;15).</li>
  <li>Drawer slide adjustments (alignment, soft-close tuning).</li>
  <li>Touch-up paint or finish on field-cut edges.</li>
  <li>Filler/scribe replacements where the original was wrong.</li>
  <li>Missing or damaged hardware.</li>
  <li>Crown miter touch-up.</li>
  <li>Toe kick scribing.</li>
</ul>

<h2 id="closing">Closing out</h2>
<dl class="wa-specs">
  <dt>Warranty items</dt><dd>Order replacement parts immediately. Schedule second visit when parts arrive.</dd>
  <dt>Touch-up</dt><dd>Bring a finish kit to the second visit. Most touch-up is 30 minutes total.</dd>
  <dt>Change-order items</dt><dd>Quoted as a change order, signed, then scheduled.</dd>
  <dt>Out-of-scope items</dt><dd>Politely declined or quoted separately.</dd>
</dl>

<div class="wa-callout">
<strong>Final payment is contingent on punch closure.</strong> A 10&ndash;20% retention is standard. Do not chase the retention without a signed punch list closure document.
</div>

<h2 id="closeout">Closeout package</h2>
<ul>
  <li>Operation and maintenance instructions.</li>
  <li>Touch-up paint cans (labeled with formula).</li>
  <li>Spare hardware.</li>
  <li>Final invoice.</li>
  <li>Lien waiver from your shop.</li>
  <li>Warranty document.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cabinet-installation-sequence">Cabinet Installation Sequence</a></li>
  <li><a href="/wiki/article/change-orders">Change Orders</a></li>
</ul>
',
  5, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();
