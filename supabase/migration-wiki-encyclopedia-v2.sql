-- ============================================================
-- migration-wiki-encyclopedia-v2.sql
--
-- 50 additional encyclopedia-grade wiki articles, written with the
-- same wa-* layout components as the v1 batch. No downloadable
-- assets — those come per-article in a follow-up pass.
--
-- Idempotent: every row uses on conflict (slug) do update. Safe to
-- re-run.
--
-- Categories use the cluster keys from src/pages/Wiki.jsx so every
-- article lands in a real subtopic on the wiki landing.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 19. Dovetail Joinery
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'dovetail-joinery',
  'Dovetail Joinery',
  'Joinery',
  'cabinetmaker',
  'Through, half-blind, sliding, secret-mitered — the canonical wood joint, why it works mechanically, and the proportions that distinguish a furniture-maker from a hobbyist.',
  E'
<p class="wa-lede">The <strong>dovetail</strong> is the canonical drawer joint and the visual signature of fine cabinetry. Wedge-shaped pins on one board interlock with matching tails on the other, producing a joint that resists pull-apart in one direction without any hardware. Three thousand years of furniture-making is built on it.</p>

<h2 id="anatomy">Anatomy</h2>
<dl class="wa-specs">
  <dt>Tail board</dt><dd>The board with the wedge-shaped projections (the &ldquo;tails&rdquo;).</dd>
  <dt>Pin board</dt><dd>The board with the matching cut-outs (the &ldquo;pins&rdquo;) between which the tails fit.</dd>
  <dt>Half-pin</dt><dd>The narrower outer pin at the top and bottom of the joint &mdash; only one face is shown.</dd>
  <dt>Slope</dt><dd>The angle of the dovetail, expressed as a ratio (1:6 for softwoods, 1:8 for hardwoods).</dd>
  <dt>Baseline</dt><dd>The depth-of-cut line on both boards.</dd>
</dl>

<h2 id="variations">Five variations to know</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Through dovetail</div>
    <div class="wa-variation-when">Drawer backs, blanket chests, anywhere both faces show</div>
    <div class="wa-variation-body">Visible from both sides. The strongest variation and the easiest to mark out. The default of the apprentice exam.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Half-blind dovetail</div>
    <div class="wa-variation-when">Drawer fronts on traditional cabinetry</div>
    <div class="wa-variation-body">Hidden from the front. Pin board has stopped sockets so the tails do not pierce the face.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Sliding dovetail</div>
    <div class="wa-variation-when">Shelves into bookcase sides, drawer dividers</div>
    <div class="wa-variation-body">A long groove cut at a dovetail angle; a matching tongue slides into it. Excellent for cross-grain joints.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Secret mitered dovetail</div>
    <div class="wa-variation-when">High-end casework with no visible joinery</div>
    <div class="wa-variation-body">Both faces appear as a clean miter; the dovetails hide inside. The connoisseur&rsquo;s joint.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Lapped (rabbeted) dovetail</div>
    <div class="wa-variation-when">Drawer fronts where a face thicker than the side is needed</div>
    <div class="wa-variation-body">A rabbet on the pin board allows a thick drawer face with a thin side, half-blind.</div>
  </div>
</div>

<h2 id="proportions">Proportions and slope</h2>
<table class="wa-table">
  <thead><tr><th>Material</th><th>Slope</th><th>Why</th></tr></thead>
  <tbody>
    <tr><td>Softwoods (pine, fir)</td><td>1:6</td><td>Steeper angle compensates for crushable fibers.</td></tr>
    <tr><td>Hardwoods (oak, maple)</td><td>1:8</td><td>Standard furniture proportion. Shallower means cleaner shadow line.</td></tr>
    <tr><td>Cabinet-quality hardwoods</td><td>1:9 or 1:10</td><td>Used in fine furniture for the most refined look.</td></tr>
  </tbody>
</table>

<div class="wa-callout tip">
<strong>Tails first or pins first?</strong> Either works. Most hand-cut shops cut tails first (faster to mark off the saw), most machine shops cut pins first (jig orientation). Pick one and practice it; switching back and forth slows everyone down.
</div>

<h2 id="methods">Cutting methods</h2>
<ol>
  <li><strong>Hand cut.</strong> Marking gauge, dovetail saw, chisel. The traditional method. ~15&ndash;30 minutes per joint with practice.</li>
  <li><strong>Router jig.</strong> Leigh, Akeda, Porter-Cable. Variable spacing in 30&ndash;90 seconds per joint.</li>
  <li><strong>CNC.</strong> Programmed pin-and-tail patterns cut on a CNC router with a dovetail bit. Production-grade drawer makers run thousands per day.</li>
  <li><strong>Rotary cutter (machine dovetailer).</strong> Industrial machines like Maka or Hoffmann cut purpose-built drawer dovetails on production lines.</li>
</ol>

<h2 id="pitfalls">Common pitfalls</h2>
<ul>
  <li><strong>Wrong baseline depth.</strong> Cutting past the baseline shows as a gap on the show face. Always cut <em>just shy</em> and pare to the line.</li>
  <li><strong>Reversed pins/tails.</strong> Mark with a knife before sawing. A dovetail saw cut on the wrong side of the line is firewood.</li>
  <li><strong>Compression at fit.</strong> Hammering the joint together with a metal hammer crushes wood fibers and causes long-term loosening. Use a deadblow or a wooden mallet through a sacrificial board.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/mortise-and-tenon-joinery">Mortise &amp; Tenon Joinery</a></li>
  <li><a href="/wiki/article/box-finger-joints">Box and Finger Joints</a></li>
  <li><a href="/wiki/article/drawer-box-construction">Drawer Box Construction</a></li>
</ul>
',
  9, true, now() - interval '14 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 20. Box and Finger Joints
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'box-finger-joints',
  'Box and Finger Joints',
  'Joinery',
  'cabinetmaker',
  'Square-fingered cousins of the dovetail. Easier to set up on the table saw, equally strong, and a defining look in modern cabinetry.',
  E'
<p class="wa-lede">A <strong>box joint</strong> (sometimes called a <em>finger joint</em>) is a series of square interlocking fingers on the ends of two boards. Mechanically equivalent to a through dovetail in shear strength, easier to set up on a table saw, and visually distinct &mdash; a defining look in mid-century and modern cabinetry.</p>

<h2 id="vs-dovetail">Vs the dovetail</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Box joint</th><th>Through dovetail</th></tr></thead>
  <tbody>
    <tr><td>Pull-apart resistance</td><td>None without glue</td><td>Excellent (mechanical wedge)</td></tr>
    <tr><td>Shear / shock strength</td><td>Equal</td><td>Equal</td></tr>
    <tr><td>Setup time</td><td>~5 minutes (table saw jig)</td><td>~20 minutes (dovetail jig)</td></tr>
    <tr><td>Visual character</td><td>Square, geometric, modern</td><td>Wedged, traditional, refined</td></tr>
    <tr><td>Glue surface area</td><td>Larger (more long-grain contact)</td><td>Smaller</td></tr>
  </tbody>
</table>

<h2 id="proportions">Proportions</h2>
<dl class="wa-specs">
  <dt>Finger width</dt><dd>1/4&Prime;&ndash;3/4&Prime; for cabinet work; 3/8&Prime; or 1/2&Prime; is the visual sweet spot for drawer boxes.</dd>
  <dt>Finger depth</dt><dd>Equal to the thickness of the mating board.</dd>
  <dt>Tolerance</dt><dd>0.002&Prime;&ndash;0.005&Prime; loose. Tight box joints will not seat with glue.</dd>
</dl>

<h2 id="methods">Cutting methods</h2>
<ol>
  <li><strong>Table saw with dado stack and box-joint jig.</strong> The default. A pin and slot in a sled register each cut. INCRA and Rockler make refined sleds; a shop-made jig works equally well.</li>
  <li><strong>Router table with straight bit and jig.</strong> Same registration principle, smaller bites per cut, used when you need wider boards than your dado stack handles.</li>
  <li><strong>CNC router.</strong> Programmable for any spacing. Production drawer shops use this almost exclusively.</li>
  <li><strong>Hand cut with backsaw and chisel.</strong> Possible but rarely done. Dovetails are easier to mark by hand.</li>
</ol>

<div class="wa-callout">
<strong>Glue every box joint.</strong> Without mechanical wedging, the joint relies entirely on glue. Use Type I PVA, clamp lightly, and wipe squeeze-out before it skins.
</div>

<h2 id="finger-joint-confusion">Finger joint vs box joint</h2>
<p>The terms are used interchangeably in most shops, but lumber yards use &ldquo;finger joint&rdquo; for a different thing: end-to-end joinery in dimension lumber, where boards are spliced length-wise with a comb-like finger profile cut on a horizontal shaper. That is finger-jointed <em>lumber</em>, not a finger-jointed <em>corner</em>. Context tells you which.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/dovetail-joinery">Dovetail Joinery</a></li>
  <li><a href="/wiki/article/drawer-box-construction">Drawer Box Construction</a></li>
</ul>
',
  6, true, now() - interval '13 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 21. Pocket Screw Joinery
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'pocket-screw-joinery',
  'Pocket Screw Joinery',
  'Joinery',
  'cabinet-making',
  'The dominant face-frame joint of the modern American cabinet shop. Where it works, where it fails, and the small handful of decisions that keep pocket screws from showing.',
  E'
<p class="wa-lede"><strong>Pocket screw joinery</strong> &mdash; an angled hole drilled into one workpiece, a self-tapping screw driving into the second &mdash; is the dominant face-frame joint in the modern American cabinet shop. It is fast, hidden inside finished cabinetry, and strong enough for any normal frame application.</p>

<h2 id="how">How it works</h2>
<p>A stepped drill bit cuts a 15&deg; angled pilot hole that exits through the edge of one board. A coarse-thread, self-tapping screw drives through the pilot, into the second board, pulling the two together. The angled approach gives mechanical lock and the self-tapping tip means no pre-drill on the receiving board.</p>

<dl class="wa-specs">
  <dt>Angle</dt><dd>15&deg; from the face. Built into the jig, not adjustable.</dd>
  <dt>Screw length (3/4&Prime; stock)</dt><dd>1-1/4&Prime; coarse-thread.</dd>
  <dt>Screw length (1-1/2&Prime; stock)</dt><dd>2-1/2&Prime; coarse-thread.</dd>
  <dt>Coarse vs fine</dt><dd>Coarse for softwoods and ply; fine for hardwoods (oak, maple, walnut).</dd>
</dl>

<h2 id="where">Where pocket screws work</h2>
<ul>
  <li><strong>Face frames.</strong> The original use case. Joint hidden behind the cabinet box.</li>
  <li><strong>Cabinet box assembly.</strong> Acceptable for utility boxes (shop, garage, basement). Visible inside; covered by shelves and contents.</li>
  <li><strong>Edge banding solid wood lipping.</strong> Strong enough to pull a 1/4&Prime;&ndash;1/2&Prime; lipping tight while the glue cures.</li>
  <li><strong>Repairs.</strong> Pocket screw makes a strong joint in a board that has already been finished.</li>
</ul>

<h2 id="where-not">Where pocket screws fail</h2>
<ul>
  <li><strong>Visible joints.</strong> The pocket is ugly. Plug it (Kreg sells matching plugs) or hide it.</li>
  <li><strong>End-grain receiving the screw.</strong> Threads pull out of end grain in 6 months under cyclical load. Use a tenon, dowel, or domino instead.</li>
  <li><strong>Long-grain pull-apart.</strong> A pocket-screwed door rail will eventually crack along the screw line if the panel inside swells.</li>
  <li><strong>AWI Premium spec.</strong> Pocket screws are explicitly disallowed for visible joinery in AWS Premium.</li>
</ul>

<div class="wa-callout">
<strong>Hide the pocket.</strong> A wood plug drives in flush, gets sanded, and disappears under finish. On commercial work where speed matters, a slightly oversized plug pre-finished to match works.
</div>

<h2 id="brands">Jigs</h2>
<dl class="wa-specs">
  <dt>Kreg K5 / K4</dt><dd>The benchtop standard. Adjustable for stock thickness.</dd>
  <dt>Kreg Foreman</dt><dd>Production tool with a foot pedal &mdash; hands-free clamping. Used in commercial face-frame shops.</dd>
  <dt>Kreg PantoRouter / 720</dt><dd>Programmable, multi-station; production face-frame work.</dd>
  <dt>Castle TSM-12</dt><dd>22&deg; pocket-screw jig (different angle, different jig). Some traditional shops prefer it.</dd>
  <dt>Massca</dt><dd>Cheap import alternative. Acceptable for hobby use.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/face-frame-construction">Face Frame Construction</a></li>
  <li><a href="/wiki/article/mortise-and-tenon-joinery">Mortise &amp; Tenon Joinery</a></li>
</ul>
',
  6, true, now() - interval '12 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 22. Domino and Biscuit Joinery
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'domino-biscuit-joinery',
  'Domino and Biscuit Joinery',
  'Joinery',
  'cabinet-making',
  'Loose-tenon systems that bridged hand-cut joinery and CNC-driven dowels. The Festool Domino, the Lamello biscuit, and the cases each one wins.',
  E'
<p class="wa-lede"><strong>Loose-tenon joinery</strong> &mdash; a separate tongue glued into matching mortises in both pieces &mdash; is the modern bench-shop replacement for hand-cut mortise-and-tenon. The two dominant systems are the Festool <strong>Domino</strong> and the Lamello <strong>biscuit</strong> (and biscuit-like clamping fittings).</p>

<h2 id="domino">The Festool Domino</h2>
<p>A handheld plunge-mortising tool that cuts oval pockets matching the supplied beech tenons. The Domino is the most consequential bench-shop tool of the last 20 years &mdash; it lets a one-person shop produce mortise-and-tenon joinery at production speed.</p>
<dl class="wa-specs">
  <dt>DF 500 (small)</dt><dd>4mm&ndash;10mm tenons; cabinet doors, drawer fronts, face frames.</dd>
  <dt>DF 700 (XL)</dt><dd>8mm&ndash;14mm tenons; tables, beds, large casework.</dd>
  <dt>Tenon material</dt><dd>Beech, sipo, or domino-spec stock. Larger sizes available on cards.</dd>
  <dt>Joint strength</dt><dd>Comparable to a hand-cut M&amp;T of equal cross-section.</dd>
</dl>

<h2 id="biscuit">The Lamello biscuit</h2>
<p>A football-shaped piece of compressed beech that swells when it absorbs water from PVA glue. The slot is cut with a small horizontal blade in a biscuit joiner. Older than the Domino &mdash; introduced in 1956.</p>
<ul>
  <li>Three sizes: 0, 10, 20 (smallest to largest).</li>
  <li>Best as an alignment aid &mdash; the swelling locks alignment but adds little real shear strength.</li>
  <li>Excellent for edge joining boards (panel glue-ups), face-frame pre-alignment, miter joints.</li>
</ul>

<h2 id="comparison">Side-by-side</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Domino</th><th>Biscuit</th></tr></thead>
  <tbody>
    <tr><td>Joint strength</td><td>Structural &mdash; replaces M&amp;T</td><td>Alignment-only &mdash; not structural</td></tr>
    <tr><td>Tool cost</td><td>$1,200&ndash;1,800</td><td>$200&ndash;500</td></tr>
    <tr><td>Setup speed</td><td>Fast (depth + width fence)</td><td>Faster (just register and plunge)</td></tr>
    <tr><td>Repeatability</td><td>Excellent</td><td>Excellent</td></tr>
    <tr><td>Tenon cost</td><td>~$0.20 each</td><td>~$0.05 each</td></tr>
  </tbody>
</table>

<h2 id="lamello-pro">Lamello Clamex / Tenso / Cabineo</h2>
<p>Lamello expanded the biscuit slot into a family of mechanical fittings:</p>
<dl class="wa-specs">
  <dt>Clamex P</dt><dd>Permanent or knock-down connector that locks two parts together with a quarter-turn cam.</dd>
  <dt>Tenso P</dt><dd>Self-clamping fitting that pulls a glued joint tight without external clamps.</dd>
  <dt>Cabineo</dt><dd>One-piece connector specifically for case construction. CNC-routable; popular in commercial casework where flat-pack delivery matters.</dd>
</dl>

<div class="wa-callout">
<strong>Domino is for joinery; Cabineo is for assembly.</strong> If you are joining frame stock at a corner, use a Domino. If you are knocking down a flat-pack cabinet on a job site, use a Cabineo.
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/mortise-and-tenon-joinery">Mortise &amp; Tenon Joinery</a></li>
  <li><a href="/wiki/article/pocket-screw-joinery">Pocket Screw Joinery</a></li>
</ul>
',
  6, true, now() - interval '11 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 23. Drawer Box Construction
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'drawer-box-construction',
  'Drawer Box Construction',
  'Cabinetmaking & Millwork',
  'cabinet-making',
  'Dovetailed solid wood, doweled ply, melamine-and-staple, and metal-sided systems compared. What each grade actually costs, and what the AWI grades require.',
  E'
<p class="wa-lede">A <strong>drawer box</strong> is a small case in its own right &mdash; four sides, a bottom, and the joinery that holds them together. The construction grade you pick determines cost, durability, and whether the spec sheet calls your cabinets &ldquo;Custom&rdquo; or &ldquo;Premium.&rdquo;</p>

<h2 id="grades">Construction grades</h2>
<table class="wa-table">
  <thead><tr><th>Grade</th><th>Construction</th><th>Cost / box</th><th>AWI</th></tr></thead>
  <tbody>
    <tr><td>Stapled / nailed melamine</td><td>White melamine, stapled corners, glued bottom</td><td>$8&ndash;14</td><td>Economy</td></tr>
    <tr><td>Doweled hardwood ply</td><td>Pre-finished maple ply, glued dowel corners</td><td>$22&ndash;38</td><td>Custom</td></tr>
    <tr><td>French dovetailed solid maple</td><td>Solid maple, machine-cut dovetail corners</td><td>$45&ndash;75</td><td>Custom / Premium</td></tr>
    <tr><td>English dovetailed solid maple</td><td>Solid maple, hand-cut or premium machine dovetails, finished interior</td><td>$80&ndash;140</td><td>Premium</td></tr>
    <tr><td>Metal-sided (Blum LEGRABOX, Hettich AvanTech)</td><td>Steel side panels with wood front/back/bottom</td><td>$95&ndash;180</td><td>European premium</td></tr>
  </tbody>
</table>

<h2 id="materials">Materials</h2>
<dl class="wa-specs">
  <dt>Solid hard maple</dt><dd>Standard for dovetailed boxes. Hard, light, takes finish well, no off-gassing.</dd>
  <dt>Pre-finished maple plywood</dt><dd>Workhorse of doweled boxes. UV-finish interior means no field finishing.</dd>
  <dt>Industrial melamine particleboard</dt><dd>Cheapest. Edges chip easily; do not use under wet sink areas.</dd>
  <dt>Steel</dt><dd>European metal-sided systems (LEGRABOX) integrate the box and slide.</dd>
</dl>

<h2 id="bottom">Bottom panel</h2>
<ul>
  <li><strong>1/4&Prime; ply or 1/4&Prime; HDF</strong> in a groove, captured 8&ndash;10mm above the bottom edge of the sides.</li>
  <li><strong>1/2&Prime; ply</strong> for heavy-load drawers (file cabinets, tool drawers).</li>
  <li><strong>Glued and stapled</strong> at the back rail, floating in the groove on the other three sides to allow seasonal movement of solid-wood sides.</li>
</ul>

<h2 id="dimensions">Sizing rules</h2>
<dl class="wa-specs">
  <dt>Width</dt><dd>Cabinet opening minus 1&Prime; (1/2&Prime; per side for slide clearance). Confirm against your slide datasheet.</dd>
  <dt>Depth</dt><dd>Cabinet inside depth minus 1&Prime; clear at the front and back.</dd>
  <dt>Height</dt><dd>Drawer side ~3/4&Prime; lower than the drawer face to clear the cabinet face frame on inset work, equal on overlay.</dd>
  <dt>Bottom thickness</dt><dd>1/4&Prime; rabbeted into a 1/4&Prime;&times;1/4&Prime; groove on all four sides, 10mm up from the bottom.</dd>
</dl>

<h2 id="undermount">Undermount-slide compatibility</h2>
<p>Undermount slides (Blum TANDEM, Hettich Quadro) require a precise notch on the bottom rear corners and matching hooks on the back panel. The drawer must be built to the slide vendor&rsquo;s template, not the other way around. Adjust your shop&rsquo;s drawer-box drawing to the slide manufacturer you use.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/drawer-slides">Drawer Slides</a></li>
  <li><a href="/wiki/article/dovetail-joinery">Dovetail Joinery</a></li>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
</ul>
',
  7, true, now() - interval '10 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 24. Frame and Panel Construction
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'frame-and-panel-construction',
  'Frame and Panel Construction',
  'Cabinetmaking & Millwork',
  'cabinet-making',
  'Stiles, rails, and a floating panel — the joinery system that lets wide solid-wood doors and casework survive seasonal humidity without splitting.',
  E'
<p class="wa-lede"><strong>Frame and panel</strong> is the answer to wood movement. A wide solid-wood panel held captive on all four sides will split when humidity changes; the same panel allowed to float inside a frame will move freely and remain crack-free for centuries. Every solid-wood cabinet door, wainscot, and traditional case-side back uses this principle.</p>

<h2 id="anatomy">Anatomy</h2>
<dl class="wa-specs">
  <dt>Stile</dt><dd>Vertical frame member.</dd>
  <dt>Rail</dt><dd>Horizontal frame member, joined to stiles at top and bottom.</dd>
  <dt>Mullion / muntin</dt><dd>Intermediate vertical or horizontal divider.</dd>
  <dt>Panel</dt><dd>Wide board (or plywood) floating in the frame&rsquo;s grooves.</dd>
  <dt>Stile groove</dt><dd>Continuous slot on the inside edge of every frame member that captures the panel.</dd>
</dl>

<h2 id="movement">Allowing for movement</h2>
<p>Solid wood moves across the grain. A 12&Prime; wide oak panel can swell or shrink 1/8&Prime; over a year. The panel groove must be deep enough to absorb that movement without ever bottoming out:</p>
<ul>
  <li><strong>Groove depth:</strong> 3/8&Prime; minimum, 1/2&Prime; preferred for panels &gt; 12&Prime; wide.</li>
  <li><strong>Panel undersize:</strong> Cut the panel 1/4&Prime; smaller than the inside-of-groove dimension. This gap is the buffer.</li>
  <li><strong>Centering:</strong> Use space balls (foam beads) at the top, bottom, and sides to keep the panel centered while still allowing movement.</li>
  <li><strong>No glue.</strong> Never glue the panel to the frame. Glue only the stile-to-rail joinery.</li>
</ul>

<h2 id="profiles">Common profiles</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Cope and stick</div>
    <div class="wa-variation-when">Production cabinet doors, Shaker, modern</div>
    <div class="wa-variation-body">Matching router bits cut a profile on the inside edge of every frame member; rails are coped to fit. Two passes per piece.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Mortise and tenon with applied molding</div>
    <div class="wa-variation-when">Premium and traditional work</div>
    <div class="wa-variation-body">Frame joined with M&amp;T; a separate molding strip is mitered around the panel after assembly. Cleanest miters, more labor.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Shaker (square inner edge)</div>
    <div class="wa-variation-when">Most common modern style</div>
    <div class="wa-variation-body">Square groove, flat panel, no profile. The plain-spoken default.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Raised panel</div>
    <div class="wa-variation-when">Traditional, formal cabinetry</div>
    <div class="wa-variation-body">The panel field is left thick; the edges are raised on a shaper or router table to fit the frame groove.</div>
  </div>
</div>

<h2 id="ply-vs-solid">Plywood vs solid panel</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Solid panel</th><th>Plywood panel</th></tr></thead>
  <tbody>
    <tr><td>Stability</td><td>Moves with humidity</td><td>Effectively stable</td></tr>
    <tr><td>Cost</td><td>Higher</td><td>Lower</td></tr>
    <tr><td>Visual character</td><td>Real wood grain, glue lines visible if jointed</td><td>Veneer face, no glue lines, no movement</td></tr>
    <tr><td>Allowed in AWI Premium</td><td>Yes</td><td>Yes (veneer face required)</td></tr>
  </tbody>
</table>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/mortise-and-tenon-joinery">Mortise &amp; Tenon Joinery</a></li>
  <li><a href="/wiki/article/cabinet-door-styles">Cabinet Door Styles</a></li>
</ul>
',
  6, true, now() - interval '9 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 25. Cabinet Door Styles
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'cabinet-door-styles',
  'Cabinet Door Styles',
  'Cabinetmaking & Millwork',
  'cabinet-making',
  'Shaker, slab, raised panel, beadboard, mullion, and the dozen modifiers that turn each one into a unique kitchen. The cabinet-shop language guide.',
  E'
<p class="wa-lede">A <strong>cabinet door style</strong> is the architectural decision that drives the entire visual language of a kitchen. Doors are the largest single surface in any room of cabinets, and what they look like sets the price point.</p>

<h2 id="canonical">Five canonical styles</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Slab</div>
    <div class="wa-variation-when">Modern, contemporary, IKEA</div>
    <div class="wa-variation-body">A flat panel with no frame. Made from MDF (paint-grade), veneered ply, or solid edge-glued panels. The dominant modern style.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Shaker</div>
    <div class="wa-variation-when">Transitional, farmhouse, the 2010&ndash;2025 default</div>
    <div class="wa-variation-body">Square frame around a flat recessed panel. Painted white, painted color, or stained. The single most common cabinet door style of the last 15 years.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Raised panel</div>
    <div class="wa-variation-when">Traditional, formal</div>
    <div class="wa-variation-body">Frame around a beveled panel that rises proud of the frame. Common cathedral and arch-top variations. Slowing in popularity since 2015.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Beadboard</div>
    <div class="wa-variation-when">Cottage, coastal, farmhouse</div>
    <div class="wa-variation-body">Frame around a panel of vertical bead profiles. Common on island ends and bath vanities.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Mullion / glass-front</div>
    <div class="wa-variation-when">Display cabinets, upper cabinets</div>
    <div class="wa-variation-body">Frame divided by mullions into glass panes. Often combined with a primary slab or shaker style elsewhere.</div>
  </div>
</div>

<h2 id="modifiers">Modifiers that change everything</h2>
<dl class="wa-specs">
  <dt>Edge profile</dt><dd>Square, eased (1/16&Prime; round-over), 1/4&Prime; round-over, ogee, chamfer. Subtle but visible.</dd>
  <dt>Reveal</dt><dd>Inset (3/32&Prime; reveal at the box edge), partial overlay (1&Prime; frame visible), full overlay (1/8&Prime; reveal).</dd>
  <dt>Stile width</dt><dd>2&Prime; standard. 1-1/2&Prime; for narrow modern doors. 2-1/2&Prime;&ndash;3&Prime; on traditional/heavy looks.</dd>
  <dt>Top rail width</dt><dd>Match stile or wider for visual weight; never narrower than the stile.</dd>
  <dt>Hardware</dt><dd>Knob in upper corner of door, pull centered horizontally on drawers. Or no hardware (push-to-open). The decision constrains every other choice.</dd>
</dl>

<div class="wa-callout">
<strong>Slab doors are unforgiving.</strong> Every defect, panel join, and scratch shows. MDF is the safe substrate; veneered ply demands sequence-matched leaves; solid wood demands stable, quartersawn material to avoid cupping.
</div>

<h2 id="cost">Cost ranking</h2>
<ol>
  <li>Slab MDF, painted &mdash; cheapest. ~$40&ndash;70/sq ft retail.</li>
  <li>Shaker MDF, painted &mdash; the modern standard. ~$70&ndash;110/sq ft.</li>
  <li>Slab solid wood &mdash; risk of movement. ~$110&ndash;180/sq ft.</li>
  <li>Shaker solid wood &mdash; furniture-quality. ~$140&ndash;220/sq ft.</li>
  <li>Raised panel solid wood &mdash; traditional. ~$160&ndash;260/sq ft.</li>
  <li>Custom species + matched veneer slab &mdash; ~$280+/sq ft.</li>
</ol>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frame-and-panel-construction">Frame and Panel Construction</a></li>
  <li><a href="/wiki/article/face-frame-construction">Face Frame Construction</a></li>
  <li><a href="/wiki/article/pulls-and-knobs">Pulls and Knobs</a></li>
</ul>
',
  6, true, now() - interval '8 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 26. Pulls and Knobs
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'pulls-and-knobs',
  'Pulls and Knobs',
  'Hardware & Adhesives',
  'cabinet-making',
  'Bar pulls, cup pulls, knobs, edge pulls, and the precise placement rules that separate a finished kitchen from a sloppy one.',
  E'
<p class="wa-lede"><strong>Pulls and knobs</strong> are the smallest hardware decision and one of the most visible. The shape, finish, and placement of the pulls is the kitchen&rsquo;s jewelry. Get it wrong and even great cabinets look amateur.</p>

<h2 id="types">Types</h2>
<dl class="wa-specs">
  <dt>Knob</dt><dd>Single-screw pull, typically 1&Prime;&ndash;1-1/2&Prime; diameter. Traditional, farmhouse, transitional. Use on doors, never on drawers wider than 12&Prime;.</dd>
  <dt>Bar pull</dt><dd>Two-screw horizontal handle, 3&Prime;&ndash;18&Prime; long. Modern. The dominant pull type since 2010.</dd>
  <dt>Cup pull</dt><dd>Recessed half-cup grasped from below. Traditional, English / French country. Use on drawers; sometimes on faux-drawer fronts.</dd>
  <dt>Edge pull</dt><dd>Strip mounted to the top edge of a drawer or door. Minimalist, no exposed hardware face.</dd>
  <dt>Finger pull / J-channel</dt><dd>Profile cut into the door edge itself. No hardware at all.</dd>
  <dt>Push-to-open</dt><dd>Mechanical kicker, no visible hardware. Requires soft-close-compatible push fittings.</dd>
</dl>

<h2 id="sizing">Sizing rules</h2>
<table class="wa-table">
  <thead><tr><th>Drawer width</th><th>Recommended pull length (center-to-center)</th></tr></thead>
  <tbody>
    <tr><td>Up to 12&Prime;</td><td>3&Prime; or 4&Prime;</td></tr>
    <tr><td>12&Prime;&ndash;18&Prime;</td><td>5&Prime; or 6&Prime;</td></tr>
    <tr><td>18&Prime;&ndash;24&Prime;</td><td>6&Prime; or 8&Prime;</td></tr>
    <tr><td>24&Prime;&ndash;30&Prime;</td><td>8&Prime; or 10&Prime;</td></tr>
    <tr><td>30&Prime;&ndash;36&Prime;</td><td>10&Prime; or 12&Prime;</td></tr>
    <tr><td>36&Prime;+</td><td>Two pulls or 18&Prime;+ continuous</td></tr>
  </tbody>
</table>

<h2 id="placement">Placement</h2>
<dl class="wa-specs">
  <dt>Door knob</dt><dd>Upper inside corner of base cabinets, lower inside corner of upper cabinets. Inset 2-1/2&Prime;&ndash;3&Prime; from each edge.</dd>
  <dt>Drawer pull</dt><dd>Centered horizontally and vertically on the drawer face. Some shops center on the upper third for tall drawers.</dd>
  <dt>Vertical bar pull on doors</dt><dd>Center horizontally with the upper or lower edge 2-1/2&Prime; from the corner, depending on door height.</dd>
</dl>

<div class="wa-callout">
<strong>Use a jig.</strong> A pull-mounting jig with a center-punch ensures every pull lands within 1/32&Prime; of design. Eyeballed pulls are visible across a kitchen.
</div>

<h2 id="finishes">Finishes</h2>
<ul>
  <li>Polished chrome &mdash; bright, traditional.</li>
  <li>Brushed nickel &mdash; warm grey, transitional.</li>
  <li>Matte black &mdash; modern default.</li>
  <li>Unlacquered brass &mdash; warm, ages with patina.</li>
  <li>Antique brass / bronze &mdash; traditional, heavier.</li>
  <li>Champagne / warm gold &mdash; recent trend (2020+).</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/european-hinge-selection">European Hinge Selection</a></li>
  <li><a href="/wiki/article/cabinet-door-styles">Cabinet Door Styles</a></li>
</ul>
',
  6, true, now() - interval '7 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 27. Crown Molding Installation
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'crown-molding-installation',
  'Crown Molding Installation',
  'Cabinetmaking & Millwork',
  'installer',
  'Coping vs mitering, sprung-angle setups, and the math that lets a profile that should fit between 89° and 91° corners survive a real-world job site.',
  E'
<p class="wa-lede"><strong>Crown molding</strong> is the trim that hides the joint between cabinet top and ceiling. Installed correctly it makes a kitchen look architecturally finished; installed incorrectly it announces &ldquo;contractor grade&rdquo; from across the room.</p>

<h2 id="profiles">Profiles</h2>
<dl class="wa-specs">
  <dt>Sprung crown</dt><dd>Profile is at an angle when installed (typically 38&deg; or 45&deg; from horizontal). The dominant cabinet crown.</dd>
  <dt>Flat (lay-flat) crown</dt><dd>Mounted flat to a soffit or wall above the cabinet. Easier to cut, less traditional.</dd>
  <dt>Stacked crown</dt><dd>A primary sprung crown plus a smaller cap or shoe molding. Used to fill larger gaps between cabinet and ceiling.</dd>
  <dt>Light rail</dt><dd>Small flat trim under the cabinet bottom that hides under-cabinet lighting wiring.</dd>
</dl>

<h2 id="coping">Coping vs mitering</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Mitered</th><th>Coped</th></tr></thead>
  <tbody>
    <tr><td>Inside corners</td><td>Joint opens as the wood moves</td><td>Stays tight indefinitely</td></tr>
    <tr><td>Outside corners</td><td>Standard 45&deg; miter</td><td>Cannot cope outside corners</td></tr>
    <tr><td>Difficulty</td><td>Easy</td><td>Hard, requires coping saw or jig</td></tr>
    <tr><td>Recommended for</td><td>Outside corners, paint-grade where caulk hides movement</td><td>All inside corners on stain-grade work</td></tr>
  </tbody>
</table>

<h2 id="sprung-angle">Sprung-angle setups</h2>
<p>The two most common spring angles are 38&deg; and 45&deg;. The chop saw bevel and miter must be set to match.</p>
<dl class="wa-specs">
  <dt>38&deg; spring (most US cabinet crown)</dt><dd>Inside miter: 31.62&deg; bevel, 33.86&deg; miter. Outside miter: same. Coping cut: 33.86&deg; miter, then back-relief with coping saw.</dd>
  <dt>45&deg; spring (European, larger crown)</dt><dd>Inside miter: 30&deg; bevel, 35.26&deg; miter. Outside miter: same.</dd>
</dl>

<div class="wa-callout tip">
<strong>Mark a sample stick.</strong> Cut a 6&Prime; piece labeled &ldquo;38&deg; SPRING&rdquo; and tape it to the saw fence. Saves you re-deriving the angle every install.
</div>

<h2 id="install">Installation order</h2>
<ol>
  <li>Run a backing strip along the cabinet top &mdash; gives the crown something to nail to.</li>
  <li>Start with the longest run on the most-visible wall.</li>
  <li>Cut and cope inside corners; cut outside corners with a 45&deg; miter.</li>
  <li>Glue all coped joints, pin with 18-gauge brads.</li>
  <li>Caulk paint-grade only. Stain-grade should be tight enough to skip caulk.</li>
</ol>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
  <li><a href="/wiki/article/face-frame-construction">Face Frame Construction</a></li>
</ul>
',
  6, true, now() - interval '6 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 28. Closet System Design
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'closet-system-design',
  'Closet System Design',
  'Cabinetmaking & Millwork',
  'cabinet-making',
  'Hanging heights, double-hang vs single-hang, drawer banks, shoe shelves, and the standard module dimensions that make a closet build out fast.',
  E'
<p class="wa-lede"><strong>Closet systems</strong> are cabinetry minus the doors. The same boxes, the same hardware, the same finish &mdash; but configured around the user&rsquo;s clothing rather than dishes. A growing share of cabinet shop revenue comes from closets.</p>

<h2 id="standards">Standard heights</h2>
<dl class="wa-specs">
  <dt>Long hang</dt><dd>72&Prime; clear from rod to floor. Dresses, coats.</dd>
  <dt>Medium hang</dt><dd>48&Prime; clear. Pants folded over a hanger, blouses.</dd>
  <dt>Double hang (upper rod)</dt><dd>83&Prime; AFF.</dd>
  <dt>Double hang (lower rod)</dt><dd>42&Prime; AFF, 41&Prime; clear.</dd>
  <dt>Shoe shelves (women&rsquo;s)</dt><dd>10&Prime; deep, 8&Prime; vertical between shelves.</dd>
  <dt>Shoe shelves (men&rsquo;s)</dt><dd>12&Prime; deep, 9&Prime; vertical.</dd>
  <dt>Folded shelf</dt><dd>14&Prime; deep, 12&Prime; vertical between shelves.</dd>
</dl>

<h2 id="modules">Standard modules</h2>
<table class="wa-table">
  <thead><tr><th>Module</th><th>Width</th><th>Use</th></tr></thead>
  <tbody>
    <tr><td>Hang section</td><td>24&Prime;&ndash;36&Prime;</td><td>Single or double hanging.</td></tr>
    <tr><td>Shelf tower</td><td>16&Prime;&ndash;24&Prime;</td><td>Folded clothes, shoe storage.</td></tr>
    <tr><td>Drawer bank</td><td>18&Prime;&ndash;30&Prime;</td><td>Small items, jewelry, accessories.</td></tr>
    <tr><td>Hamper / pull-out</td><td>16&Prime;&ndash;20&Prime;</td><td>Laundry, ironing board.</td></tr>
  </tbody>
</table>

<h2 id="construction">Construction</h2>
<p>Closets are typically built from <strong>3/4&Prime; melamine on industrial particleboard</strong> with edges banded in matching 1mm or 2mm PVC. Cheaper than cabinet pre-fin ply, weighs more but it does not matter because the boxes are wall-hung at most points.</p>
<ul>
  <li>Wall-hung mounting cleats (also called &ldquo;rail and tooth&rdquo; or &ldquo;Z-clips&rdquo;) carry the load.</li>
  <li>Fixed shelves pinned with confirmats and dowels.</li>
  <li>Adjustable shelves on 5mm shelf-pin holes drilled on a 32mm grid (same system as cabinets).</li>
  <li>Hanging rods on flange brackets at the ends of each section.</li>
</ul>

<h2 id="walk-in-vs-reach-in">Walk-in vs reach-in</h2>
<dl class="wa-specs">
  <dt>Reach-in</dt><dd>One wall of cabinetry. 24&Prime;&ndash;26&Prime; deep modules. Most common in master bedrooms.</dd>
  <dt>Walk-in (small)</dt><dd>U-shaped run, 5&prime;&times;7&prime;&ndash;6&prime;&times;8&prime;. Hang on three walls; central island optional.</dd>
  <dt>Walk-in (large)</dt><dd>Boutique-style islands, dressing benches, full mirrors. Closer to furniture-grade cabinet work.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frameless-cabinet-construction">Frameless Cabinet Construction</a></li>
  <li><a href="/wiki/article/the-32mm-system">The 32mm System</a></li>
</ul>
',
  6, true, now() - interval '5 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 29. Red Oak
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'red-oak',
  'Red Oak — Species Reference',
  'Wood Species',
  'cabinet-making',
  'Quercus rubra: cheap, abundant, predictable, with the open pore structure that defines a generation of American kitchens.',
  E'
<p class="wa-lede"><strong>Red oak</strong> (<em>Quercus rubra</em>) is the workhorse American hardwood. It is cheap, abundant, takes stain in dramatic contrast, and was the dominant cabinet species for the 1980s and 1990s. It is now out of fashion in residential design but remains the default for rental builds, commercial casework, and budget kitchens.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,290 lbf.</dd>
  <dt>Specific gravity</dt><dd>0.63 air-dry.</dd>
  <dt>Shrinkage</dt><dd>Tangential 8.6%, radial 4.0%.</dd>
  <dt>Color</dt><dd>Heartwood pinkish-red to medium brown, sapwood near-white.</dd>
  <dt>Pore structure</dt><dd>Open early-wood pores. Air can be blown through end grain &mdash; the simple test that distinguishes red from white.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li>Cuts and machines easily with carbide. Less abrasive than white oak.</li>
  <li><strong>Stains dramatically.</strong> Open pores absorb pigment unevenly &mdash; pores go very dark, surrounding wood lighter. The classic &ldquo;oak look.&rdquo;</li>
  <li><strong>Not for outdoor use.</strong> Open pores wick water; rots within a few seasons outside.</li>
  <li>Glues and finishes without surprises.</li>
</ul>

<h2 id="finishing">Finishing strategy</h2>
<p>Red oak rewards minimal, contrasting finishes. The signature look is a medium-brown stain with the pores reading darker.</p>
<table class="wa-table">
  <thead><tr><th>Finish</th><th>Result</th></tr></thead>
  <tbody>
    <tr><td>Pigment stain alone</td><td>Heavy pore contrast, traditional &ldquo;oak&rdquo; look.</td></tr>
    <tr><td>Pore filler + clear</td><td>Smooth, modern, hides the open grain. Use water-based pore filler.</td></tr>
    <tr><td>Dye + clear</td><td>Even color without pore emphasis; lets you tint without the heavy contrast.</td></tr>
    <tr><td>Limed / pickled</td><td>White paste filler in pores, top-coated clear. 1990s look.</td></tr>
  </tbody>
</table>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/white-oak">White Oak</a></li>
  <li><a href="/wiki/article/veneer-matching">Veneer Matching</a></li>
</ul>
',
  5, true, now() - interval '4 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 30. Birch
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'birch',
  'Birch — Species Reference',
  'Wood Species',
  'cabinet-making',
  'Yellow birch and Baltic birch — the two cabinet species that share a name and almost nothing else. One is a hardwood, one is a multi-ply panel.',
  E'
<p class="wa-lede"><strong>Birch</strong> in the cabinet shop refers to two completely different things: <em>yellow birch</em> (<em>Betula alleghaniensis</em>) the hardwood, and <em>Baltic birch</em> the imported multi-ply panel from Russia, Finland, and Latvia. Both are workshop staples; they share a name and almost nothing else.</p>

<h2 id="yellow-birch">Yellow birch (the hardwood)</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,260 lbf.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood pale red-brown. Often sold rotary-cut to maximize sapwood face.</dd>
  <dt>Use</dt><dd>Painted cabinetry where maple is cost-prohibitive; flooring; commercial casework backs.</dd>
  <dt>Working notes</dt><dd>Sands flat. Stains poorly &mdash; pigment goes blotchy. Use as a paint substrate or sub for hard maple.</dd>
</dl>

<h2 id="baltic-birch">Baltic birch (the panel)</h2>
<p>Baltic birch is a void-free multi-ply panel made entirely of birch veneers. Sold in 5&prime;&times;5&prime; (1525&times;1525mm) sheets in 1/4&Prime; through 3/4&Prime; thicknesses. Supply has been disrupted by Russia sanctions since 2022; Finnish and Latvian sources have absorbed most of the demand at higher prices.</p>
<dl class="wa-specs">
  <dt>Layer count (3/4&Prime;)</dt><dd>13 layers of ~1.5mm veneer.</dd>
  <dt>Edge appearance</dt><dd>Fine alternating light/dark layers &mdash; a feature, not a defect. Often left exposed.</dd>
  <dt>Strength</dt><dd>Extremely high in shear; jigs, drawers, and shop fixtures.</dd>
  <dt>Glue type</dt><dd>Phenolic (BB/BB grade) is the standard. Type II water-resistant.</dd>
  <dt>Substitutes</dt><dd>ApplePly, Europly, Chinese &ldquo;Baltic&rdquo; (lower quality).</dd>
</dl>

<div class="wa-callout">
<strong>Confirm grade.</strong> &ldquo;BB/BB&rdquo; is the standard cabinet face/back grade. &ldquo;B/BB&rdquo; is one tier nicer. &ldquo;CP/CP&rdquo; is utility grade with plugs allowed. Substitutes labeled &ldquo;Baltic-style&rdquo; from China use birch face on softer cores and behave differently.
</div>

<h2 id="uses">Common uses</h2>
<ul>
  <li>Drawer boxes (showing the layered edge).</li>
  <li>Shop jigs and fixtures &mdash; flat, stable, holds screws everywhere.</li>
  <li>Modern cabinet boxes where the edge is left exposed (no banding).</li>
  <li>CNC sled fixtures and zero-clearance inserts.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/plywood-grades">Plywood Grades for Cabinet Work</a></li>
  <li><a href="/wiki/article/hard-maple">Hard Maple</a></li>
</ul>
',
  5, true, now() - interval '3 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 31. Hickory
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'hickory',
  'Hickory — Species Reference',
  'Wood Species',
  'cabinet-making',
  'The hardest commonly available domestic hardwood, with a sapwood-heartwood color contrast that defines rustic and lodge cabinet aesthetics.',
  E'
<p class="wa-lede"><strong>Hickory</strong> (<em>Carya</em> spp.) is the hardest commonly available domestic North American hardwood. Its dramatic sapwood-heartwood color contrast (near-white sapwood, dark walnut-brown heartwood, often in the same board) defines rustic, lodge, and Western cabinet aesthetics.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,820 lbf. ~25% harder than hard maple, ~40% harder than red oak.</dd>
  <dt>Specific gravity</dt><dd>0.72 air-dry. Heavy.</dd>
  <dt>Shock resistance</dt><dd>Excellent &mdash; the species behind tool handles, drumsticks, and Major League baseball bats.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood deep walnut brown with reddish overtones. Often sold &ldquo;calico&rdquo; with both colors in every board.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li>Hard on cutters. Carbide mandatory; high-end shops use shear-cut helical heads on jointers and planers.</li>
  <li><strong>Splinters viciously.</strong> Tear-out is a constant risk. Climb-cut or use a reverse-spiral router bit on figured boards.</li>
  <li>Glues fine but the density slows penetration; let glue tack longer before clamping.</li>
  <li>Excellent for steam bending if you can find clear stock.</li>
</ul>

<h2 id="grades">Grades and selection</h2>
<dl class="wa-specs">
  <dt>Calico (mixed sap and heart)</dt><dd>The default for rustic cabinetry. ~$5&ndash;7/bf.</dd>
  <dt>Heartwood-only</dt><dd>Premium. Rare. ~$9&ndash;12/bf.</dd>
  <dt>Sapwood-only</dt><dd>Even rarer. Used by guitar makers and tool-handle factories.</dd>
</dl>

<h2 id="finishing">Finishing strategy</h2>
<p>Hickory does not need stain. The natural color contrast is the entire visual story. Apply a clear penetrating finish (oil + WB topcoat) and let the color do the work.</p>
<ul>
  <li>For uniform color: a tinted seal coat can mute the contrast slightly.</li>
  <li>For maximum contrast: penetrating oil only, no toner.</li>
  <li>Avoid pigmented stain &mdash; pigment lodges in the porous sapwood and looks blotchy.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
  <li><a href="/wiki/article/white-oak">White Oak</a></li>
</ul>
',
  5, true, now() - interval '3 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 32. Mahogany
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'mahogany',
  'Mahogany — Species Reference',
  'Wood Species',
  'cabinet-making',
  'Honduran, African, and Sapele — three woods sold under one name. Which is the real mahogany, which is CITES-restricted, and which is the modern substitute.',
  E'
<p class="wa-lede"><strong>Mahogany</strong> in 2025 is three different woods. Genuine Honduran mahogany (<em>Swietenia macrophylla</em>) is CITES-restricted and effectively unavailable. African mahogany (<em>Khaya</em> spp.) is the most common substitute. Sapele (<em>Entandrophragma cylindricum</em>) is technically not mahogany but sold as &ldquo;mahogany&rdquo; in retail.</p>

<h2 id="three-woods">The three woods</h2>
<table class="wa-table">
  <thead><tr><th>Common name</th><th>Botanical</th><th>Status</th><th>Where used</th></tr></thead>
  <tbody>
    <tr><td>Honduran / Genuine mahogany</td><td>Swietenia macrophylla</td><td>CITES Appendix II; effectively unavailable for commercial cabinetwork</td><td>Antique restoration only</td></tr>
    <tr><td>African mahogany / Khaya</td><td>Khaya ivorensis, K. anthotheca</td><td>Available; sustainability mixed</td><td>Cabinet substitute, marine work</td></tr>
    <tr><td>Sapele</td><td>Entandrophragma cylindricum</td><td>Available; ribbon-figured quartersawn highly prized</td><td>Premium &ldquo;mahogany-look&rdquo; cabinetry</td></tr>
    <tr><td>Spanish cedar</td><td>Cedrela odorata</td><td>Available, common</td><td>Humidor interiors, exterior shutters</td></tr>
  </tbody>
</table>

<h2 id="properties">Mechanical (African Mahogany / Khaya)</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>830 lbf. Soft for a hardwood.</dd>
  <dt>Specific gravity</dt><dd>0.49 air-dry.</dd>
  <dt>Shrinkage</dt><dd>Tangential 4.5%, radial 3.0%. Excellent stability.</dd>
  <dt>Color</dt><dd>Pink-red when freshly cut, deepening to red-brown over months. UV-fades back over years if unprotected.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li>Cuts cleanly. The trade favorite for hand-cut joinery because it pares like cheese.</li>
  <li>Watch for interlocked grain &mdash; planing in one direction tears, planing the opposite is glassy. Test on a scrap before committing.</li>
  <li>Glues, sands, and finishes without surprises.</li>
  <li><strong>Sapele has aggressive ribbon figure.</strong> Quartersawn sapele is the most dramatic figured wood in common use.</li>
</ul>

<h2 id="finishing">Finishing</h2>
<p>Mahogany rewards traditional film finishes. French polish, hand-rubbed varnish, and conversion varnish all show off the chatoyance.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
  <li><a href="/wiki/article/cherry">Cherry</a></li>
</ul>
',
  5, true, now() - interval '3 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 33. Eastern White Pine
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'eastern-white-pine',
  'Eastern White Pine — Species Reference',
  'Wood Species',
  'cabinetmaker',
  'Pinus strobus: the lightest, easiest-to-work commercial softwood, the species behind colonial American furniture, paneling, and traditional millwork.',
  E'
<p class="wa-lede"><strong>Eastern white pine</strong> (<em>Pinus strobus</em>) is the lightest, easiest-to-work softwood in North American cabinet shops. It built colonial furniture, ship masts, paneling, and the modular cabinet styles of New England. Today it remains the species of choice for traditional reproductions, knotty paint-grade work, and rustic interiors.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>380 lbf. Soft enough that a fingernail dents it.</dd>
  <dt>Specific gravity</dt><dd>0.35 air-dry. Very light.</dd>
  <dt>Shrinkage</dt><dd>Tangential 6.1%, radial 2.1%. Stable.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood pale yellow-tan, deepening to amber with age and UV.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li>Pares like a vegetable. Hand-tool friendly.</li>
  <li>Soft &mdash; dents easily. Not suitable for high-traffic work surfaces.</li>
  <li>Resin pockets bleed through paint and clear finish if not sealed. Use shellac or BIN primer to lock them.</li>
  <li>Stains blotchily; use conditioner or skip stain entirely.</li>
</ul>

<h2 id="grades">Grades</h2>
<dl class="wa-specs">
  <dt>Pumpkin pine</dt><dd>Old-growth white pine with fine grain and amber color. Reclaimed only.</dd>
  <dt>D-Select</dt><dd>Best modern grade. Few small knots.</dd>
  <dt>Standard / #2 Common</dt><dd>Knotty pine. Small tight knots throughout.</dd>
  <dt>#3 / Knotty</dt><dd>Larger and looser knots. Cabin and rustic work.</dd>
</dl>

<h2 id="finishing">Finishing</h2>
<ul>
  <li>Knotty paint grade: prime with shellac or BIN to seal knots, then any topcoat.</li>
  <li>Clear: shellac sealer, then waterborne or oil-based clear. Expect amber deepening over years.</li>
  <li>Traditional Colonial: milk paint, optional rub-through, beeswax topcoat.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cherry">Cherry</a></li>
  <li><a href="/wiki/article/poplar">Poplar</a></li>
</ul>
',
  4, true, now() - interval '3 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 34. Poplar
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'poplar',
  'Poplar — Species Reference',
  'Wood Species',
  'cabinet-making',
  'The cheap paint-grade hardwood that built half the painted millwork in America. Soft, predictable, and sometimes mistaken for a higher-end species after primer.',
  E'
<p class="wa-lede"><strong>Yellow poplar</strong> (<em>Liriodendron tulipifera</em>) is the cheap paint-grade workhorse of American cabinet shops. Botanically it&rsquo;s not a true poplar &mdash; it&rsquo;s a tulip tree &mdash; but every yard sells it under that name. Soft, predictable, and after primer it looks like every other painted hardwood.</p>

<h2 id="properties">Mechanical properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>540 lbf. Softer than red oak by half.</dd>
  <dt>Specific gravity</dt><dd>0.42 air-dry.</dd>
  <dt>Shrinkage</dt><dd>Tangential 8.2%, radial 4.6%. Moderate.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood ranges from yellow-tan to greenish-purple to grey-brown. The variegated heartwood is why poplar is almost always painted.</dd>
</dl>

<h2 id="working">Working notes</h2>
<ul>
  <li>Easy to machine. Sands quickly, joints predictable, glues without surprises.</li>
  <li><strong>Compresses under fasteners.</strong> Pocket screws can bury themselves; back off the clutch.</li>
  <li>Holds paint exceptionally well &mdash; smoother than maple, less porous than oak.</li>
  <li>Stains blotchily and shows blue-green heartwood through any clear finish &mdash; do not use poplar where the wood will be visible.</li>
</ul>

<h2 id="uses">Common uses</h2>
<ul>
  <li>Painted face frames.</li>
  <li>Painted door rails and stiles (with MDF panels).</li>
  <li>Paintable trim and molding.</li>
  <li>Drawer sides on entry-level work (where pre-fin maple is too expensive).</li>
  <li>Hidden shop work &mdash; jig parts, sub-components.</li>
</ul>

<h2 id="finishing">Finishing</h2>
<p>Always paint. The default schedule:</p>
<ol>
  <li>Sand to 220.</li>
  <li>One coat WB primer (Kilz, Zinsser BIN, or PPG Seal Grip).</li>
  <li>Sand 320.</li>
  <li>Two coats WB enamel (Sherwin Emerald Urethane Trim or Benjamin Moore Advance).</li>
</ol>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/hard-maple">Hard Maple</a></li>
  <li><a href="/wiki/article/eastern-white-pine">Eastern White Pine</a></li>
</ul>
',
  5, true, now() - interval '3 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 35. Stain — Dye vs Pigment
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'stain-dye-vs-pigment',
  'Stain — Dye vs Pigment',
  'Finishing',
  'finisher',
  'Two completely different chemistries with the same name on the can. Dye penetrates and colors transparently; pigment lodges in the pores. Knowing which is which is the difference between a great finish and a muddy one.',
  E'
<p class="wa-lede">&ldquo;Wood stain&rdquo; in 2025 means at least three different chemistries sold under one word. <strong>Pigment</strong>, <strong>dye</strong>, and <strong>gel</strong> all behave differently on every species. Picking the wrong one is the most common cause of blotchy finishes.</p>

<h2 id="pigment-vs-dye">The two main families</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Pigment stain</th><th>Dye stain</th></tr></thead>
  <tbody>
    <tr><td>Particle size</td><td>Visible particles, ~5&ndash;25&micro;m</td><td>Molecular &mdash; transparent in solution</td></tr>
    <tr><td>How it colors</td><td>Particles lodge in pores and scratches</td><td>Penetrates wood fiber, dyes the cell walls</td></tr>
    <tr><td>Color uniformity</td><td>Uneven on porous species (oak, ash, walnut)</td><td>Even on every species</td></tr>
    <tr><td>UV stability</td><td>Excellent</td><td>Variable; some dyes fade in 6&ndash;18 months</td></tr>
    <tr><td>Carrier</td><td>Linseed/mineral oil, water, or solvent</td><td>Water, alcohol, or solvent</td></tr>
    <tr><td>Brand examples</td><td>Minwax, Old Masters, General Finishes Pigment</td><td>TransTint, TransFast, Behlen Solar Lux</td></tr>
  </tbody>
</table>

<h2 id="when-pigment">When to use pigment</h2>
<ul>
  <li>Open-pored species where you want pore contrast (red oak, ash).</li>
  <li>Outdoor or sun-exposed work where UV stability matters.</li>
  <li>When the &ldquo;stained oak&rdquo; look is the goal.</li>
</ul>

<h2 id="when-dye">When to use dye</h2>
<ul>
  <li>Tight-grained species (maple, cherry, birch) where pigment blotches.</li>
  <li>When even color uniformity matters (production work, color matching).</li>
  <li>Achieving deep, saturated color that pigment cannot reach.</li>
  <li>Toning between coats to fix small mismatches.</li>
</ul>

<h2 id="combinations">Combining</h2>
<p>The most refined commercial finishes use both:</p>
<ol>
  <li>Apply dye first to set the base color.</li>
  <li>Seal with a wash coat (1-lb-cut shellac or thinned vinyl sealer).</li>
  <li>Apply pigment glaze to add pore contrast and depth.</li>
  <li>Topcoat with clear lacquer, CV, or WB.</li>
</ol>

<div class="wa-callout">
<strong>Test every new combination on the actual species and grit you will use.</strong> Color charts on the can are printed on paper. Real wood ranges from 1.5x to 0.5x the chart depending on species, sanding, and humidity.
</div>

<h2 id="gel-stain">Gel stain</h2>
<p>Gel stain is pigment in a thickened oil base. It sits on the surface rather than penetrating, which makes it the right choice for over-finished work, MDF, and species where regular pigment blotches catastrophically (cherry, maple, pine). Trade-off: shows brush strokes more than penetrating stain.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/conversion-varnish-vs-waterborne">Conversion Varnish vs Waterborne</a></li>
  <li><a href="/wiki/article/cherry">Cherry</a></li>
</ul>
',
  6, true, now() - interval '2 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 36. Oil Finishes
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'oil-finishes',
  'Oil Finishes',
  'Finishing',
  'finisher',
  'Tung, linseed, Danish, hardwax — the penetrating-oil family. What they do (penetrate, harden, deepen color), what they do not (build a film), and the small differences that matter.',
  E'
<p class="wa-lede"><strong>Penetrating oil finishes</strong> soak into wood fiber, polymerize, and harden inside the cells. They do not build a meaningful surface film &mdash; what you feel is the wood itself, sealed but not coated. The look is matte, the touch is wood, the maintenance is occasional re-oiling rather than refinishing.</p>

<h2 id="family">The oil family</h2>
<dl class="wa-specs">
  <dt>Pure tung oil</dt><dd>From the tung tree (China). Slowest curing (~7 days per coat); hardest cure once polymerized. Food-safe per FDA when fully cured.</dd>
  <dt>Boiled linseed oil (BLO)</dt><dd>Linseed with metallic driers. Fast-curing (~24 hr). Yellows over time. Traditional gun-stock and tool-handle finish.</dd>
  <dt>Danish oil</dt><dd>Linseed or tung blended with thinner and varnish. Cures in 4&ndash;8 hr. Adds slight build per coat. Watco is the dominant brand.</dd>
  <dt>Wiping varnish</dt><dd>Thinned varnish (50:50 with mineral spirits). Builds film slowly. Sometimes sold as &ldquo;Danish oil.&rdquo;</dd>
  <dt>Hardwax oil</dt><dd>Modern blend of natural oils and waxes (typically tung + carnauba + candelilla). Rubio Monocoat, Osmo, Saicos. One-coat &ldquo;Monocoat&rdquo; products are the modern Scandinavian default.</dd>
</dl>

<h2 id="application">Application</h2>
<ol>
  <li>Sand to 180&ndash;220.</li>
  <li>Flood the wood with oil, work it in with a clean rag.</li>
  <li>Wait 10&ndash;15 minutes (or per product datasheet).</li>
  <li>Wipe off all surplus thoroughly. Anything left on the surface dries to a tacky skin.</li>
  <li>Dry per the product schedule.</li>
  <li>For multi-coat schedules: lightly buff with synthetic steel wool between coats.</li>
</ol>

<div class="wa-callout">
<strong>Spontaneous combustion is real.</strong> Oil-soaked rags self-heat as the oil polymerizes. Lay them flat to dry outdoors or submerge in water. Bunched oily rags in a trash can have started thousands of shop fires.
</div>

<h2 id="comparison">When to use which</h2>
<table class="wa-table">
  <thead><tr><th>Goal</th><th>Recommended</th></tr></thead>
  <tbody>
    <tr><td>Modern Scandinavian, low maintenance</td><td>Hardwax oil (Rubio, Osmo)</td></tr>
    <tr><td>Period-correct American antique</td><td>BLO + paste wax</td></tr>
    <tr><td>Food-contact (cutting boards, butcher block)</td><td>Pure tung or food-safe mineral oil + beeswax</td></tr>
    <tr><td>Hand-rubbed traditional furniture</td><td>Tung + wiping varnish, multiple coats</td></tr>
    <tr><td>Quick shop project, gun-stocks, tool handles</td><td>BLO</td></tr>
  </tbody>
</table>

<h2 id="topcoat-compatibility">Topcoat compatibility</h2>
<p>Most film finishes do not stick well over uncured oil. If you intend to topcoat with WB poly, CV, or lacquer:</p>
<ul>
  <li>Allow oil to cure fully (7+ days for pure tung, 3+ for BLO/Danish).</li>
  <li>Lightly scuff sand 320 grit.</li>
  <li>Vinyl sealer first to bridge the chemistry, then topcoat.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/conversion-varnish-vs-waterborne">Conversion Varnish vs Waterborne</a></li>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
</ul>
',
  6, true, now() - interval '2 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 37. Lacquer — Nitrocellulose vs Catalyzed
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'lacquer-nc-vs-catalyzed',
  'Lacquer — Nitrocellulose vs Catalyzed',
  'Finishing',
  'finisher',
  'Pre-cat, post-cat, nitrocellulose, and CV are all called "lacquer" in the trade. Knowing which one is on your gun matters for everything from pot life to chemical resistance.',
  E'
<p class="wa-lede">In the cabinet trade, &ldquo;<strong>lacquer</strong>&rdquo; means at least four different products. Nitrocellulose lacquer is one chemistry; pre-catalyzed and post-catalyzed are different again; conversion varnish is sometimes called &ldquo;lacquer&rdquo; in casual conversation. They behave very differently.</p>

<h2 id="four-types">The four chemistries</h2>
<table class="wa-table">
  <thead><tr><th>Type</th><th>Cure</th><th>Chemical resistance</th><th>Where it&rsquo;s used</th></tr></thead>
  <tbody>
    <tr><td>Nitrocellulose (NC)</td><td>Solvent evaporation only</td><td>Poor (re-dissolves in lacquer thinner)</td><td>Guitars, antique restoration, retail furniture</td></tr>
    <tr><td>Pre-catalyzed</td><td>Solvent + slow chemical cross-link from a built-in acid</td><td>Moderate</td><td>Mid-range cabinet shops, the &ldquo;lacquer&rdquo; on most cabinet quotes</td></tr>
    <tr><td>Post-catalyzed</td><td>Same as pre-cat but catalyst added at spray time</td><td>Good</td><td>Production shops with catalyzing pumps</td></tr>
    <tr><td>Conversion varnish (CV)</td><td>Amino + acid cross-link, full cure 5&ndash;10 days</td><td>Excellent</td><td>Premium kitchen, hospitality</td></tr>
  </tbody>
</table>

<h2 id="nc">Nitrocellulose</h2>
<p>Cellulose dissolved in solvent. As solvent evaporates, the resin re-deposits as a film. Re-dissolves in fresh lacquer thinner &mdash; meaning every coat &ldquo;melts into&rdquo; the previous one. This is great for repair (a damaged spot can be re-sprayed and the new finish merges with the old) but bad for chemical resistance (any household solvent damages it).</p>

<h2 id="pre-cat">Pre-catalyzed</h2>
<p>Manufacturer adds a small amount of catalyst at the factory. The product has limited shelf life (typically 6 months). Each coat builds slow chemical cross-links over a couple of weeks, producing better chemical resistance than NC. The dominant cabinet-shop &ldquo;lacquer&rdquo; in 2025.</p>

<h2 id="post-cat">Post-catalyzed</h2>
<p>Catalyst added at the spray gun. Pot life 4&ndash;8 hours after catalyzing. Better cure than pre-cat. Used by shops with twin-pump catalyzing systems.</p>

<h2 id="cv">Conversion varnish (see separate article)</h2>
<p>Different chemistry entirely. Discussed at length in the <a href="/wiki/article/conversion-varnish-vs-waterborne">CV vs Waterborne</a> article.</p>

<div class="wa-callout">
<strong>If a finisher says &ldquo;we use lacquer,&rdquo; ask which one.</strong> Nitrocellulose on a kitchen cabinet is a problem (alcohol from a wine glass eats through it). Pre-cat is the realistic floor for cabinet work today.</div>

<h2 id="vocs">VOC content</h2>
<p>All solvent lacquers run high in VOCs (typically 600&ndash;800 g/L). California, Colorado, and EU regions have effectively banned them in commercial production work. Waterborne lacquer alternatives exist but spray differently and require operator retraining.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/conversion-varnish-vs-waterborne">Conversion Varnish vs Waterborne</a></li>
  <li><a href="/wiki/article/spray-booth-setup">Spray Booth Setup</a></li>
</ul>
',
  6, true, now() - interval '2 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 38. Sanding Schedule
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'sanding-schedule',
  'Sanding Schedule',
  'Finishing',
  'finisher',
  'Grit progression from machine planer to topcoat-ready, the species-specific stops, and the discipline that turns the boring step into the visible difference between OK and great.',
  E'
<p class="wa-lede">A <strong>sanding schedule</strong> is the planned grit progression from rough lumber to topcoat-ready surface. Skipping a grit shows; skipping the wrong one is invisible. Knowing the difference is what separates a clean finish from a muddy one.</p>

<h2 id="why-progression">Why progression matters</h2>
<p>Each grit removes the scratches left by the previous one. Jumping too far up (e.g. 80 directly to 220) leaves 80-grit scratches that the 220 paper does not erase &mdash; they just get filled with sanding dust. The scratches show up dramatically when stain or dye hits them.</p>

<h2 id="standard">Standard schedule</h2>
<table class="wa-table">
  <thead><tr><th>Grit</th><th>Purpose</th><th>Tool</th></tr></thead>
  <tbody>
    <tr><td>80</td><td>Remove planer marks, level glue-ups</td><td>Belt sander or wide-belt</td></tr>
    <tr><td>100</td><td>Refine 80-grit scratches</td><td>Random orbit sander (ROS)</td></tr>
    <tr><td>120</td><td>Final flattening before stain</td><td>ROS</td></tr>
    <tr><td>150</td><td>Stain-grade prep on softwoods, paint-grade prep on hardwoods</td><td>ROS</td></tr>
    <tr><td>180</td><td>Stain-grade prep on most hardwoods</td><td>ROS</td></tr>
    <tr><td>220</td><td>Final pre-stain on tight-grained species (maple, cherry)</td><td>ROS or hand</td></tr>
    <tr><td>320</td><td>Between coats of clear finish (de-nibbing)</td><td>Hand or random orbit with dust extraction</td></tr>
    <tr><td>400&ndash;600</td><td>Final rub-out on French polish, between gloss coats</td><td>Hand only</td></tr>
  </tbody>
</table>

<h2 id="species">Species adjustments</h2>
<dl class="wa-specs">
  <dt>Hard maple, cherry, birch</dt><dd>Stop at 220 before stain. Higher grits burnish and reject stain.</dd>
  <dt>Red oak, ash</dt><dd>Stop at 180 before stain. Higher grits close the open pores too much.</dd>
  <dt>Pine, poplar</dt><dd>Stop at 150 if pigment-staining (need open surface). 220 if painting.</dd>
  <dt>Walnut</dt><dd>180 for clear finish; 220 for hand-rubbed oil.</dd>
  <dt>White oak, sapele</dt><dd>180 before stain or finish.</dd>
</dl>

<div class="wa-callout">
<strong>Use one brand of paper through the whole schedule.</strong> Different manufacturers use different abrasive specs even at the same nominal grit. 220 from Mirka is not 220 from 3M.</div>

<h2 id="techniques">Techniques</h2>
<ul>
  <li><strong>With the grain.</strong> Always finish-sand parallel to the grain on the show face. ROS is &ldquo;random&rdquo; but the swirl marks still telegraph if you skip grits.</li>
  <li><strong>Light pressure.</strong> The sander&rsquo;s weight is enough. Pressing down loads the disc and deposits abrasive into the pores.</li>
  <li><strong>Vacuum the surface between grits.</strong> Trapped 80-grit chips in a 120 disc cuts 80-grit scratches.</li>
  <li><strong>Wet the wood between 180 and 220 (waterborne finishes).</strong> Raises the grain so it can be cut off before topcoat. Skip for solvent finishes.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/stain-dye-vs-pigment">Stain &mdash; Dye vs Pigment</a></li>
  <li><a href="/wiki/article/oil-finishes">Oil Finishes</a></li>
</ul>
',
  6, true, now() - interval '1 days'
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 39. Hand Planes
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'hand-planes',
  'Hand Planes — Selection and Tuning',
  'Hand Tools',
  'cabinetmaker',
  'The bench-plane family, when each one earns its keep in a CNC-equipped shop, and the small handful of adjustments that turn a $200 plane into a working tool.',
  E'
<p class="wa-lede">A <strong>hand plane</strong> is still the fastest way to flatten, smooth, or true a board if it is the right plane and it is set up correctly. In a CNC shop the bench-plane family earns its keep by handling the things machines do clumsily: chamfers, end-grain trimming, glue-up flattening, and final smoothing where sanding scratches would show.</p>

<h2 id="bench-planes">Bench plane family</h2>
<dl class="wa-specs">
  <dt>#3 / #4 (smoother)</dt><dd>9-1/2&Prime; long. The final-pass plane. Set for 0.001&Prime; shavings.</dd>
  <dt>#5 (jack)</dt><dd>14&Prime;. The general-purpose plane. Cambered iron for stock removal; flat iron for general work.</dd>
  <dt>#6 (fore plane)</dt><dd>18&Prime;. Bridge between jack and jointer. Often skipped.</dd>
  <dt>#7 / #8 (jointer)</dt><dd>22&ndash;24&Prime;. For truing edges of long boards before glue-up.</dd>
</dl>

<h2 id="specialty">Specialty planes</h2>
<ul>
  <li><strong>Block plane.</strong> 6&Prime; one-handed plane. End grain, chamfers, casework trimming.</li>
  <li><strong>Shoulder plane.</strong> Trims tenon shoulders and rabbets to fit. Iron extends to the side.</li>
  <li><strong>Scrub plane.</strong> Heavy camber for fast stock removal. Rare in cabinet work.</li>
  <li><strong>Router plane.</strong> Trims tenon cheeks and dado bottoms to consistent depth.</li>
</ul>

<h2 id="tuning">Tuning a new plane</h2>
<ol>
  <li>Flatten the sole. Lap on sandpaper glued to plate glass through 220, 400.</li>
  <li>Square the sides to the sole if you intend to use it on a shooting board.</li>
  <li>Hone the iron through 8000 grit (waterstone or diamond plate).</li>
  <li>Set the chip-breaker 1/32&Prime; from the cutting edge.</li>
  <li>Adjust depth via the brass wheel; lateral with the lever.</li>
  <li>Test on softwood; refine until shavings are translucent.</li>
</ol>

<div class="wa-callout">
<strong>Lie-Nielsen and Veritas tools work out of the box.</strong> Vintage Stanleys often need 30&ndash;60 minutes of fettling. Stanley Sweetheart and Wood River tools are middle ground.
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/sharpening-edge-tools">Sharpening Edge Tools</a></li>
  <li><a href="/wiki/article/bench-chisels">Bench Chisels</a></li>
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
-- 40. Bench Chisels
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'bench-chisels',
  'Bench Chisels',
  'Hand Tools',
  'cabinetmaker',
  'Bevel-edge, butt, mortising, and paring — the four chisel families and the geometry that distinguishes them.',
  E'
<p class="wa-lede">A <strong>bench chisel</strong> is the cabinet shop&rsquo;s most-used hand tool. The basic technique &mdash; pare with the bevel up, chop with the bevel down, never use a hammer on a paring chisel &mdash; is a hundred-year tradition the rest of the kit depends on.</p>

<h2 id="families">The four families</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Bevel edge</div>
    <div class="wa-variation-when">General joinery, dovetails</div>
    <div class="wa-variation-body">Sides are beveled to a thin edge so the chisel can fit into acute corners (dovetails). The default cabinet chisel.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Butt chisel</div>
    <div class="wa-variation-when">Hardware mortising, hinge gains</div>
    <div class="wa-variation-body">Short blade, full handle. Less leverage but easier in tight spots.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Mortising chisel</div>
    <div class="wa-variation-when">Heavy mortise chopping</div>
    <div class="wa-variation-body">Square sides, heavy section, designed for chopping with a mallet.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Paring chisel</div>
    <div class="wa-variation-when">Trimming tenons, fitting joints</div>
    <div class="wa-variation-body">Long thin blade. Used by hand, never struck. Ideal for paring the inside of a dovetail or cleaning a tenon shoulder.</div>
  </div>
</div>

<h2 id="sizes">Standard sizes</h2>
<p>A starter set is 1/4&Prime;, 3/8&Prime;, 1/2&Prime;, 3/4&Prime;, and 1&Prime;. Add 1/8&Prime; and 5/8&Prime; for production cabinet work; add 1-1/4&Prime; and 1-1/2&Prime; for furniture.</p>

<h2 id="brands">Brand cheat sheet</h2>
<dl class="wa-specs">
  <dt>Lie-Nielsen, Veritas, Blue Spruce</dt><dd>Premium, ready to use out of the box.</dd>
  <dt>Narex, Two Cherries</dt><dd>Good European mid-range. Need light fettling.</dd>
  <dt>Marples Blue Chip, Stanley Sweetheart</dt><dd>Workshop bench standards. Steel quality varies by lot.</dd>
  <dt>Japanese laminated chisels (Iyoroi, Tasai)</dt><dd>Hard steel laminated to soft iron back. Sharper than Western, more brittle if abused.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/sharpening-edge-tools">Sharpening Edge Tools</a></li>
  <li><a href="/wiki/article/hand-planes">Hand Planes</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 41. Hand Saws — Western vs Japanese
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'hand-saws',
  'Hand Saws — Western vs Japanese',
  'Hand Tools',
  'cabinetmaker',
  'Push vs pull cut, rip vs crosscut, and the three saws every cabinet shop should keep within reach.',
  E'
<p class="wa-lede"><strong>Hand saws</strong> divide into two families &mdash; <em>Western</em> push-cut and <em>Japanese</em> pull-cut. Both produce excellent joinery. The choice is partly tradition, partly ergonomic preference, partly what fits the work.</p>

<h2 id="comparison">Push vs pull</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Western (push)</th><th>Japanese (pull)</th></tr></thead>
  <tbody>
    <tr><td>Cut direction</td><td>Push stroke</td><td>Pull stroke</td></tr>
    <tr><td>Plate</td><td>Stiff, heavy</td><td>Thin, flexible</td></tr>
    <tr><td>Kerf</td><td>0.030&Prime;&ndash;0.040&Prime;</td><td>0.012&Prime;&ndash;0.020&Prime;</td></tr>
    <tr><td>Feel</td><td>Authoritative, mass-driven</td><td>Light, precise, fast</td></tr>
    <tr><td>Tooth replacement</td><td>Resharpenable forever</td><td>Disposable impulse-hardened (modern)</td></tr>
  </tbody>
</table>

<h2 id="rip-vs-cross">Rip vs crosscut</h2>
<dl class="wa-specs">
  <dt>Rip</dt><dd>Teeth filed to chisel-like geometry. Cuts with the grain.</dd>
  <dt>Crosscut</dt><dd>Teeth filed to knife-edges. Cuts across the grain.</dd>
  <dt>Hybrid (universal)</dt><dd>Compromise tooth geometry. Most modern Japanese saws are hybrid.</dd>
</dl>

<h2 id="three-essentials">Three essentials</h2>
<ol>
  <li><strong>Dovetail saw</strong> &mdash; 6&ndash;9 TPI, ~10&Prime; long, fine kerf. Lie-Nielsen, Veritas, or Japanese dozuki.</li>
  <li><strong>Tenon saw / ryoba</strong> &mdash; 10&ndash;14 TPI, ~12&Prime;. Tenon cheeks and shoulders.</li>
  <li><strong>Flush-cut / kataba</strong> &mdash; flexible plate for trimming dowels and through-tenons.</li>
</ol>

<div class="wa-callout">
<strong>Japanese saws are sharpest right out of the package.</strong> Western sharpening is a craft of its own. Most modern cabinet shops keep one of each.
</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/dovetail-joinery">Dovetail Joinery</a></li>
  <li><a href="/wiki/article/sharpening-edge-tools">Sharpening Edge Tools</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 42. Sharpening Edge Tools
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'sharpening-edge-tools',
  'Sharpening Edge Tools',
  'Hand Tools',
  'cabinetmaker',
  'Waterstones, oilstones, diamond plates, sandpaper-on-glass — the four sharpening systems and the geometry every chisel and plane iron shares.',
  E'
<p class="wa-lede"><strong>Sharpening</strong> is the discipline that makes hand tools work. A dull chisel does not pare; a dull plane tears. Every sharpening system aims at the same outcome: a polished bevel meeting a polished back at zero radius.</p>

<h2 id="systems">The four systems</h2>
<table class="wa-table">
  <thead><tr><th>System</th><th>Speed</th><th>Mess</th><th>Cost</th></tr></thead>
  <tbody>
    <tr><td>Sandpaper on glass (Scary Sharp)</td><td>Slow</td><td>Low</td><td>$30 startup</td></tr>
    <tr><td>Oilstones</td><td>Medium</td><td>Oily</td><td>$80&ndash;200</td></tr>
    <tr><td>Waterstones</td><td>Fast</td><td>Wet, slurry</td><td>$120&ndash;400</td></tr>
    <tr><td>Diamond plates</td><td>Fast</td><td>Low</td><td>$200&ndash;500</td></tr>
  </tbody>
</table>

<h2 id="grit-progression">Grit progression</h2>
<p>Most cabinet shops use three grits:</p>
<ol>
  <li><strong>1000.</strong> Establish the bevel and remove nicks.</li>
  <li><strong>4000&ndash;6000.</strong> Refine the surface.</li>
  <li><strong>8000&ndash;15000.</strong> Polish to mirror.</li>
</ol>

<h2 id="bevels">Single vs hollow vs micro</h2>
<dl class="wa-specs">
  <dt>Single flat bevel</dt><dd>Traditional. Long bevel, slow to sharpen.</dd>
  <dt>Hollow grind</dt><dd>Concave bevel from a grinding wheel. Quick to refresh on a stone.</dd>
  <dt>Micro-bevel</dt><dd>Secondary bevel ~30&deg; on top of the primary 25&deg;. Fast to refresh; what most modern shops use.</dd>
</dl>

<div class="wa-callout">
<strong>The back matters.</strong> The first 1/2&Prime; of the chisel back must be flat and polished. Lap it once when the chisel is new; never grind on it again.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/bench-chisels">Bench Chisels</a></li>
  <li><a href="/wiki/article/hand-planes">Hand Planes</a></li>
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
-- 43. Table Saws
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'table-saws',
  'Table Saws',
  'Stationary Machinery',
  'cabinet-making',
  'Cabinet, hybrid, contractor, and jobsite — the four classes of table saw, the safety systems that distinguish them, and the dust-collection trade-offs.',
  E'
<p class="wa-lede">The <strong>table saw</strong> is the centerpiece of most cabinet shops. Four classes &mdash; cabinet, hybrid, contractor, and jobsite &mdash; differ in motor size, accuracy, dust collection, and price. Choosing right depends on what you actually rip in a week.</p>

<h2 id="classes">The four classes</h2>
<table class="wa-table">
  <thead><tr><th>Class</th><th>Motor</th><th>Use</th><th>Price</th></tr></thead>
  <tbody>
    <tr><td>Cabinet</td><td>3&ndash;5 HP, 240V single or three-phase</td><td>Production cabinet shops, daily ripping</td><td>$3,000&ndash;8,000</td></tr>
    <tr><td>Hybrid</td><td>1.75&ndash;2 HP, 240V</td><td>Small shop, weekend production</td><td>$1,500&ndash;3,000</td></tr>
    <tr><td>Contractor</td><td>1.5&ndash;1.75 HP, 120V</td><td>Light shop work</td><td>$700&ndash;1,500</td></tr>
    <tr><td>Jobsite</td><td>1&ndash;1.5 HP, 120V universal</td><td>Trim carpentry on site</td><td>$400&ndash;900</td></tr>
  </tbody>
</table>

<h2 id="safety">Safety systems</h2>
<dl class="wa-specs">
  <dt>Riving knife</dt><dd>Curved blade behind the saw blade that prevents kickback by holding the kerf open. Mandatory on every saw sold in North America since 2008.</dd>
  <dt>Blade guard</dt><dd>Plastic shroud over the blade. Removable; many woodworkers leave it off, accept the risk.</dd>
  <dt>Anti-kickback pawls</dt><dd>One-way ratchet teeth that prevent the workpiece from shooting backward.</dd>
  <dt>SawStop</dt><dd>Brake cartridge fires when the blade contacts skin (or hot dog). Stops the blade in &lt;5ms. Worth the $1,000 premium for any shop with employees.</dd>
</dl>

<h2 id="features">Features that matter</h2>
<ul>
  <li><strong>Cast-iron top, ground flat.</strong> Anything else twists.</li>
  <li><strong>T-square fence.</strong> Biesemeyer-style, not the rear-bar type.</li>
  <li><strong>Trunnion mount on the cabinet</strong>, not the table. Stronger, more accurate.</li>
  <li><strong>Dust port at the cabinet.</strong> Above-blade pickup is also helpful but cabinet is critical.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/dust-collection">Dust Collection</a></li>
  <li><a href="/wiki/article/jointers">Jointers</a></li>
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
-- 44. Jointers
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'jointers',
  'Jointers',
  'Stationary Machinery',
  'cabinet-making',
  'The flatten-one-face-and-edge machine. Knives vs helical heads, table length, and the small adjustments that determine whether a jointed edge ever closes up.',
  E'
<p class="wa-lede">A <strong>jointer</strong> flattens one face and squares one edge of a board. It is the first machine in any S4S sequence (jointer &rarr; planer &rarr; table saw) and the only tool that produces a true reference surface from rough lumber.</p>

<h2 id="size">Size and capacity</h2>
<dl class="wa-specs">
  <dt>6&Prime;</dt><dd>Hobby/small-shop. Adequate for narrow stock, frustrating for face-jointing wider boards.</dd>
  <dt>8&Prime;</dt><dd>Pro shop minimum. Handles 99% of cabinet stock face-jointed.</dd>
  <dt>12&Prime;&ndash;16&Prime;</dt><dd>Furniture and panel work. Used to face-joint wider stock for table tops and large doors.</dd>
  <dt>Table length</dt><dd>Outfeed table should be at least as long as your longest commonly-jointed stock. Short tables produce convex edges.</dd>
</dl>

<h2 id="cutter-heads">Cutter heads</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Straight knives</th><th>Helical (carbide insert)</th></tr></thead>
  <tbody>
    <tr><td>Cost</td><td>Low</td><td>2&ndash;3&times; higher</td></tr>
    <tr><td>Tear-out</td><td>Bad on figured wood</td><td>Excellent</td></tr>
    <tr><td>Noise</td><td>Loud, screeching</td><td>Whisper-quiet</td></tr>
    <tr><td>Sharpness life</td><td>Sharpen / replace knives every 60&ndash;100 hours</td><td>Rotate inserts every 6&ndash;18 months, replace at 3&ndash;5 yrs</td></tr>
    <tr><td>Replacement after nick</td><td>Whole knife</td><td>Just one carbide insert</td></tr>
  </tbody>
</table>

<h2 id="setup">Setup</h2>
<ol>
  <li>Outfeed table coplanar with the top of the cutter arc. Critical &mdash; if outfeed is below, board snipes; above, board climbs.</li>
  <li>Infeed table set 1/32&Prime;&ndash;1/16&Prime; below cutter for normal cuts.</li>
  <li>Fence square to tables.</li>
</ol>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/table-saws">Table Saws</a></li>
  <li><a href="/wiki/article/planers">Planers</a></li>
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
-- 45. Planers
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'planers',
  'Planers',
  'Stationary Machinery',
  'cabinet-making',
  'Thickness planers turn one flat face into two. Lunchbox, stationary, and combination machines, and the tricks that prevent snipe.',
  E'
<p class="wa-lede">A <strong>thickness planer</strong> takes a board with one flat face (off the jointer) and produces a second face parallel to it. It is the second machine in the S4S sequence and the only way to bring rough lumber to consistent thickness.</p>

<h2 id="classes">Classes</h2>
<dl class="wa-specs">
  <dt>Lunchbox (12&Prime;&ndash;13&Prime;)</dt><dd>Portable, ~$400&ndash;700. DeWalt 735 is the standard.</dd>
  <dt>Stationary 15&Prime;&ndash;20&Prime;</dt><dd>Cast-iron base, 3&ndash;5 HP. ~$1,800&ndash;4,000. Pro shop default.</dd>
  <dt>Industrial 24&Prime;+</dt><dd>5&ndash;15 HP, segmented infeed rollers. Production cabinet and hardwood shops.</dd>
</dl>

<h2 id="snipe">Snipe</h2>
<p>The slight depression at the start and end of every board, where the workpiece is supported by only one set of rollers. Eliminate by:</p>
<ul>
  <li>Adding 4&ndash;6&Prime; sacrificial leaders to the start and end of every board.</li>
  <li>Setting outfeed/infeed roller height to barely below cutter.</li>
  <li>Lifting the board into the head as it enters and exits.</li>
</ul>

<h2 id="figured">Figured wood</h2>
<p>Curly maple and bird&rsquo;s eye tear out catastrophically through a straight-knife planer. Solutions:</p>
<ol>
  <li>Helical/spiral cutter head.</li>
  <li>Light passes (1/64&Prime;).</li>
  <li>Damp the surface lightly with water before the pass.</li>
  <li>Reverse direction every other pass.</li>
</ol>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/jointers">Jointers</a></li>
  <li><a href="/wiki/article/table-saws">Table Saws</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 46. Routers
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'routers',
  'Routers — Hand-held and Table',
  'Power Tools',
  'cabinet-making',
  'Plunge vs fixed base, 1/4 vs 1/2 collet, and the small handful of router decisions that drive every joinery operation in a small shop.',
  E'
<p class="wa-lede">A <strong>router</strong> is the most versatile single tool in a small cabinet shop. Profile edges, cut dadoes, mortise hinges, trim laminate, joint with jigs &mdash; one tool covers a dozen operations the rest of the kit cannot.</p>

<h2 id="types">Types</h2>
<dl class="wa-specs">
  <dt>Fixed base</dt><dd>Set the depth, lock it, run. Best for edge profiling, dado stacks, table-mounted work.</dd>
  <dt>Plunge base</dt><dd>Spring-loaded base lets you plunge into the workpiece. Mortising, stopped dadoes, inlay.</dd>
  <dt>Compact / trim router</dt><dd>1&ndash;1.25 HP, one-handed. Hinge mortising, edge trim, small profile work.</dd>
  <dt>Router table</dt><dd>Large fixed router under a table with a fence. Replaces a shaper for most cabinet work.</dd>
</dl>

<h2 id="collet">Collet size</h2>
<table class="wa-table">
  <thead><tr><th></th><th>1/4&Prime; collet</th><th>1/2&Prime; collet</th></tr></thead>
  <tbody>
    <tr><td>Bit cost</td><td>Lower</td><td>Higher</td></tr>
    <tr><td>Stiffness</td><td>Bits flex on heavy cuts</td><td>Stable on heavy cuts</td></tr>
    <tr><td>Use</td><td>Compact router, light profiles</td><td>Full-size router, panel raisers, large profile</td></tr>
  </tbody>
</table>

<h2 id="bits">Essential bits</h2>
<ul>
  <li>Straight cutters &mdash; 1/4&Prime;, 1/2&Prime;, 3/4&Prime;.</li>
  <li>Pattern bit (top-bearing) &mdash; for template work.</li>
  <li>Flush-trim bit (bottom-bearing) &mdash; for edge banding flush.</li>
  <li>Round-over &mdash; 1/8&Prime;, 1/4&Prime;.</li>
  <li>Chamfer &mdash; 45&deg;.</li>
  <li>Roman ogee &mdash; for traditional profile work.</li>
  <li>Dovetail bit &mdash; pair with a jig.</li>
</ul>

<h2 id="speeds">Bit speed</h2>
<dl class="wa-specs">
  <dt>Bit diameter &lt; 1&Prime;</dt><dd>22,000&ndash;24,000 RPM (max)</dd>
  <dt>1&Prime;&ndash;2&Prime;</dt><dd>16,000&ndash;18,000 RPM</dd>
  <dt>2&Prime;&ndash;3&Prime; (panel raisers)</dt><dd>12,000&ndash;14,000 RPM</dd>
  <dt>&gt; 3&Prime;</dt><dd>8,000&ndash;10,000 RPM &mdash; use a shaper instead</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/cnc-nesting">CNC Nesting</a></li>
  <li><a href="/wiki/article/cabinet-door-styles">Cabinet Door Styles</a></li>
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
-- 47. Bandsaws
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'bandsaws',
  'Bandsaws',
  'Stationary Machinery',
  'cabinet-making',
  'Resaw capacity, blade selection, drift correction, and the few maintenance tasks that keep a bandsaw cutting square.',
  E'
<p class="wa-lede">A <strong>bandsaw</strong> is the second most useful stationary machine in a cabinet shop after the table saw. It resaws thick stock into thinner boards, cuts curves, and handles materials a table saw cannot touch (round stock, pre-finished panels, very small parts).</p>

<h2 id="size">Size and capacity</h2>
<dl class="wa-specs">
  <dt>14&Prime; (Delta / Powermatic class)</dt><dd>Resaw capacity ~12&Prime;. Standard small-shop saw.</dd>
  <dt>17&Prime;&ndash;19&Prime; (Grizzly / Laguna)</dt><dd>Resaw to 12&ndash;14&Prime;. The pro-shop choice.</dd>
  <dt>24&Prime;+ (industrial)</dt><dd>Resaw to 16&Prime;+. Furniture and slab work.</dd>
</dl>

<h2 id="blades">Blade selection</h2>
<table class="wa-table">
  <thead><tr><th>Use</th><th>Width</th><th>TPI</th><th>Set</th></tr></thead>
  <tbody>
    <tr><td>Resawing</td><td>3/4&Prime;&ndash;1&Prime;</td><td>3 hook</td><td>Wide</td></tr>
    <tr><td>Curve work</td><td>1/4&Prime;</td><td>6 skip</td><td>Medium</td></tr>
    <tr><td>Veneer slicing</td><td>1/2&Prime;&ndash;3/4&Prime;</td><td>3&ndash;4 hook</td><td>Narrow</td></tr>
    <tr><td>Tight curves</td><td>1/8&Prime;</td><td>14 reg</td><td>Medium</td></tr>
  </tbody>
</table>

<h2 id="drift">Blade drift</h2>
<p>Most bandsaws cut at a slight angle to the table edge. Find that angle by free-handing a straight rip cut, then set the fence parallel to the line you actually cut, not parallel to the table edge.</p>

<h2 id="setup">Setup essentials</h2>
<ol>
  <li>Tension to the &ldquo;flutter&rdquo; method &mdash; pluck the blade; should ring like a guitar string.</li>
  <li>Track the blade so the gullets are roughly centered on the upper wheel crown.</li>
  <li>Set guides 1/64&Prime; off the blade on both sides of teeth and behind.</li>
  <li>Square the table.</li>
</ol>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/table-saws">Table Saws</a></li>
  <li><a href="/wiki/article/veneer-matching">Veneer Matching</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 48. Random Orbit Sanders
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'random-orbit-sanders',
  'Random Orbit Sanders',
  'Power Tools',
  'finisher',
  'The five-inch hook-and-loop pad that finishes 90% of cabinet sanding. Brand differences, dust collection, and the disc-life math that determines per-cabinet cost.',
  E'
<p class="wa-lede">A <strong>random orbit sander (ROS)</strong> uses a pad that spins and orbits simultaneously, producing a non-directional scratch pattern. It is the workhorse finishing sander in every cabinet shop &mdash; faster than hand sanding, cleaner than belt sanders, less risk of swirl marks.</p>

<h2 id="sizes">Sizes</h2>
<dl class="wa-specs">
  <dt>5&Prime; pad</dt><dd>Standard. 8-hole hook-and-loop. Universal disc supply.</dd>
  <dt>6&Prime; pad</dt><dd>Pro shop. Larger area, faster work, slightly less control on small parts.</dd>
  <dt>3&Prime;&ndash;3-1/4&Prime;</dt><dd>Detail / right-angle. For tight inside corners.</dd>
</dl>

<h2 id="brands">Brand cheat sheet</h2>
<table class="wa-table">
  <thead><tr><th>Brand</th><th>Strength</th><th>Trade-off</th></tr></thead>
  <tbody>
    <tr><td>Festool ETS EC</td><td>Brushless, vibration-balanced, quietest</td><td>~$400; expensive replacement pads</td></tr>
    <tr><td>Mirka Deros</td><td>Pneumatic option, very flat pad</td><td>Needs CFM if pneumatic</td></tr>
    <tr><td>Bosch ROS65</td><td>Multiple orbits, durable</td><td>Larger and heavier</td></tr>
    <tr><td>Makita BO5041</td><td>Cheapest pro option</td><td>Loud, vibrates more</td></tr>
  </tbody>
</table>

<h2 id="dust">Dust collection</h2>
<p>The ROS&rsquo;s dust port is the most-used dust collection point in a cabinet shop. Connect to:</p>
<ul>
  <li>A 1.5&Prime; or 32mm hose to a HEPA vac (Festool CT, Bosch GAS, Mirka 1230).</li>
  <li>Built-in dust bag &mdash; emergency only, fills in 10 minutes.</li>
</ul>

<div class="wa-callout">
<strong>Use 8-hole pads with 8-hole discs.</strong> A discs without matching holes blocks the dust extraction vacuum and reduces collection by 80%.
</div>

<h2 id="discs">Disc life</h2>
<p>A 5&Prime; 220-grit disc lasts ~30&ndash;60 minutes of continuous sanding before clogging or wearing flat. At ~$1.20/disc and $35/hr labor, an extra disc per cabinet door is cheap; pushing a clogged disc costs $15 in labor for $1.20 saved.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/sanding-schedule">Sanding Schedule</a></li>
  <li><a href="/wiki/article/dust-collection">Dust Collection</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 49. PVA Wood Glues
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'pva-wood-glues',
  'PVA Wood Glues — Type I, II, III',
  'Hardware & Adhesives',
  'cabinet-making',
  'Yellow glue, white glue, Titebond II vs III, open time, cure time, and which type passes which water-resistance standard.',
  E'
<p class="wa-lede"><strong>PVA (polyvinyl acetate)</strong> glue is the default wood adhesive in every cabinet shop. The bottle on the bench is almost always one of three Titebond varieties; the small differences between them matter for outdoor work, marine use, and assembly time.</p>

<h2 id="three-types">The three Titebond grades</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Titebond Original</th><th>Titebond II</th><th>Titebond III</th></tr></thead>
  <tbody>
    <tr><td>Color</td><td>Yellow</td><td>Yellow</td><td>Tan</td></tr>
    <tr><td>Open time</td><td>5 min</td><td>5 min</td><td>10 min</td></tr>
    <tr><td>Clamp time</td><td>30 min</td><td>30 min</td><td>30 min</td></tr>
    <tr><td>Full cure</td><td>24 hr</td><td>24 hr</td><td>24 hr</td></tr>
    <tr><td>Water resistance</td><td>None</td><td>Type II (passive water exposure)</td><td>Type I (boiling water cycles)</td></tr>
    <tr><td>FDA food contact</td><td>No</td><td>Yes (cured)</td><td>Yes (cured)</td></tr>
    <tr><td>Min temp</td><td>50&deg;F</td><td>55&deg;F</td><td>47&deg;F</td></tr>
  </tbody>
</table>

<h2 id="usage">Use cases</h2>
<ul>
  <li><strong>Original (yellow).</strong> Indoor cabinet joints, face frames, dowels, mortise &amp; tenon. Cheapest.</li>
  <li><strong>Type II.</strong> Bath vanities, kitchens with dishwashers, anything seeing splashes. Default for cabinet shops.</li>
  <li><strong>Type III.</strong> Exterior work, cutting boards, marine use. Slower set is also useful for complex glue-ups.</li>
</ul>

<h2 id="application">Application</h2>
<ol>
  <li>Surfaces flat, dust-free, both sides.</li>
  <li>Apply glue to both faces. A light coating is enough; squeeze-out should be even, not flooding.</li>
  <li>Bring together within open time.</li>
  <li>Clamp with even pressure; squeeze-out should bead along the joint.</li>
  <li>Wipe squeeze-out with a damp rag before it skins, or let it set 30 min and chisel off.</li>
</ol>

<div class="wa-callout">
<strong>Glue does not fix bad joinery.</strong> A loose mortise filled with PVA produces a joint that fails in a year. Glue assumes the wood-to-wood fit is already there.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/polyurethane-glues">Polyurethane Glues</a></li>
  <li><a href="/wiki/article/epoxy-in-woodworking">Epoxy in Woodworking</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 50. Polyurethane Glues
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'polyurethane-glues',
  'Polyurethane Glues',
  'Hardware & Adhesives',
  'cabinet-making',
  'Gorilla Glue and the moisture-cure poly family. Where the foaming makes them the right answer, and where it makes a mess.',
  E'
<p class="wa-lede"><strong>Polyurethane glue</strong> &mdash; Gorilla Glue, Gorilla Wood Glue Original is actually PVA; the original Gorilla Glue is a polyurethane &mdash; cures by reacting with moisture. It bonds dissimilar materials, fills small gaps, and works on damp wood, but it foams during cure and the foam has no strength.</p>

<h2 id="chemistry">How it works</h2>
<p>Liquid polyurethane reacts with water (from the wood, the air, or moisture you spritz on the joint) and cross-links into a hard polymer. Carbon dioxide is a byproduct &mdash; that&rsquo;s the foam.</p>

<h2 id="properties">Properties</h2>
<dl class="wa-specs">
  <dt>Open time</dt><dd>20&ndash;40 min depending on humidity.</dd>
  <dt>Clamp time</dt><dd>1&ndash;2 hr.</dd>
  <dt>Full cure</dt><dd>24 hr.</dd>
  <dt>Water resistance</dt><dd>Type I &mdash; passes boiling water.</dd>
  <dt>Bonds</dt><dd>Wood, metal, ceramic, plastic, stone. Almost anything.</dd>
  <dt>Color</dt><dd>Pale tan, foam is light brown.</dd>
</dl>

<h2 id="when">When to use poly</h2>
<ul>
  <li>Bonding dissimilar materials (wood to metal, wood to stone).</li>
  <li>Outdoor structural joints.</li>
  <li>Damp or pressure-treated lumber.</li>
  <li>Loose joints where minor gap-filling is OK (the cured foam is weak but visually reads).</li>
</ul>

<h2 id="when-not">When not to use poly</h2>
<ul>
  <li>Tight wood-to-wood joints &mdash; PVA bonds stronger.</li>
  <li>Show faces &mdash; foam squeeze-out is hard to clean and stains the wood permanently.</li>
  <li>Cold environments &mdash; cure stalls below 50&deg;F.</li>
</ul>

<div class="wa-callout">
<strong>Wear gloves and protect surfaces.</strong> Cured polyurethane on skin only comes off with abrasion. On finished wood it is permanent.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/pva-wood-glues">PVA Wood Glues</a></li>
  <li><a href="/wiki/article/epoxy-in-woodworking">Epoxy in Woodworking</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 51. Epoxy in Woodworking
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'epoxy-in-woodworking',
  'Epoxy in Woodworking',
  'Hardware & Adhesives',
  'cabinet-making',
  'West System, Total Boat, deep-pour rivers — three different epoxies for three different jobs. Laminating epoxy vs casting epoxy and the cure heat that ruins the wrong choice.',
  E'
<p class="wa-lede"><strong>Epoxy</strong> is a two-part adhesive that cures by chemical reaction, not solvent evaporation. It bonds nearly anything, fills any gap, and resists water indefinitely. It also costs 5&times;&ndash;10&times; what PVA does, and the wrong epoxy for the job either heats up too fast or never gets hard.</p>

<h2 id="three-classes">The three classes</h2>
<table class="wa-table">
  <thead><tr><th>Class</th><th>Mix ratio</th><th>Pot life</th><th>Use</th></tr></thead>
  <tbody>
    <tr><td>5-minute</td><td>1:1</td><td>5 min</td><td>Quick repairs, jigs, knot fills</td></tr>
    <tr><td>Laminating (West System, Total Boat 5:1)</td><td>5:1 typical</td><td>20&ndash;90 min</td><td>Bent lamination, structural bonding, knot stabilization</td></tr>
    <tr><td>Casting / deep-pour</td><td>2:1</td><td>4&ndash;24 hr</td><td>River tables, large void fills</td></tr>
  </tbody>
</table>

<h2 id="cure-heat">Cure heat (exotherm)</h2>
<p>Mixing epoxy generates heat. Faster epoxies generate more heat in less time. Laminating epoxy in a thick pour can hit 250&deg;F+ and crack, scorch, or boil. Use deep-pour epoxy for any pour over ~1/2&Prime; deep at one time.</p>

<h2 id="use-cases">Common cabinet uses</h2>
<ul>
  <li><strong>Knot stabilization</strong> &mdash; thin laminating epoxy wicked into checks and cracks.</li>
  <li><strong>Live-edge slab tops</strong> &mdash; deep-pour epoxy fills voids and cracks.</li>
  <li><strong>Wood-to-metal bonding</strong> &mdash; thickened epoxy paste with structural fiber.</li>
  <li><strong>End-grain repair</strong> &mdash; epoxy wicks into and stabilizes punky end grain on antiques.</li>
</ul>

<div class="wa-callout">
<strong>Mix completely.</strong> Under-mixed epoxy never cures &mdash; you get sticky soft spots. Mix for at least 60 seconds, scraping the sides and bottom of the cup. Transfer to a second cup and re-mix to be sure.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/pva-wood-glues">PVA Wood Glues</a></li>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 52. Hide Glue
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'hide-glue',
  'Hide Glue',
  'Hardware & Adhesives',
  'restorer',
  'The traditional protein glue that joined every piece of furniture before 1950. Reversible, repairable, and still preferred for restoration and instrument-making.',
  E'
<p class="wa-lede"><strong>Hide glue</strong> &mdash; collagen extracted from animal hides &mdash; is the oldest woodworking adhesive still in use. It joined every piece of furniture made before about 1950 and remains the preferred adhesive for instrument repair, antique restoration, and any joint that may need to come apart again.</p>

<h2 id="forms">Forms</h2>
<dl class="wa-specs">
  <dt>Hot hide glue (granules)</dt><dd>Soaked overnight, melted in a glue pot at ~145&deg;F, applied hot. The traditional method.</dd>
  <dt>Liquid hide glue (Old Brown Glue, Titebond Liquid Hide)</dt><dd>Pre-mixed, no heating required. Longer open time. Slightly weaker than hot hide.</dd>
  <dt>Fish glue</dt><dd>Similar protein chemistry, room-temperature, cleaner squeeze-out. Used by violin makers.</dd>
</dl>

<h2 id="properties">Why it&rsquo;s still used</h2>
<ul>
  <li><strong>Reversible.</strong> Heat and steam release the bond. Antique chair joints can be re-glued without destroying the wood.</li>
  <li><strong>Repairable.</strong> Fresh hide glue bonds to old hide glue without needing to remove every trace.</li>
  <li><strong>Crystal-clear cure.</strong> No glue line shows under finish.</li>
  <li><strong>Tack-grab.</strong> Sets up fast in seconds &mdash; useful for rub joints with no clamps.</li>
</ul>

<h2 id="weaknesses">Weaknesses</h2>
<ul>
  <li>Not waterproof. Joints fail in damp conditions.</li>
  <li>Limited shelf life once mixed (4&ndash;5 days for hot hide).</li>
  <li>Requires temperature control; weak at the joint if applied below 130&deg;F.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/pva-wood-glues">PVA Wood Glues</a></li>
</ul>
',
  3, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 53. Wood Movement
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'wood-movement',
  'Wood Movement and Shrinkage',
  'Techniques',
  'cabinet-making',
  'Tangential, radial, and longitudinal shrinkage explained, plus the 1% rule that lets you build solid-wood pieces that survive seasonal humidity.',
  E'
<p class="wa-lede"><strong>Wood movement</strong> is the seasonal expansion and contraction of solid wood as humidity changes. A 12&Prime; wide oak panel can swell or shrink 1/8&Prime; over a year. Build as if it were stable and the panel will split, the joint will gap, the door will bind in summer and rattle in winter.</p>

<h2 id="three-directions">The three directions</h2>
<dl class="wa-specs">
  <dt>Tangential</dt><dd>Movement across the rings (parallel to growth-ring tangent). Largest. ~6&ndash;10% from green to dry.</dd>
  <dt>Radial</dt><dd>Movement along the rings (perpendicular to growth rings). About half of tangential. ~3&ndash;5%.</dd>
  <dt>Longitudinal</dt><dd>Movement along the grain. Negligible. ~0.1%.</dd>
</dl>

<h2 id="cuts-and-movement">Cut affects movement</h2>
<table class="wa-table">
  <thead><tr><th>Cut</th><th>How it moves</th><th>Stability</th></tr></thead>
  <tbody>
    <tr><td>Plain-sawn</td><td>Tangential across the width</td><td>Worst &mdash; cups and shrinks dramatically</td></tr>
    <tr><td>Quarter-sawn</td><td>Radial across the width</td><td>Best &mdash; minimal cupping</td></tr>
    <tr><td>Rift-sawn</td><td>Diagonal &mdash; split the difference</td><td>Stable, no cupping</td></tr>
  </tbody>
</table>

<h2 id="1-percent">The 1% rule</h2>
<p>For interior furniture in a temperate climate (35&ndash;55% RH range), allow 1% of the panel width for movement. A 12&Prime; panel needs 1/8&Prime; of room (1/16&Prime; on each side) to expand and contract.</p>

<h2 id="design">Design strategies</h2>
<ul>
  <li><strong>Floating panels in frames.</strong> Frame and panel construction is the canonical solution.</li>
  <li><strong>Slotted mounting holes</strong> for table tops &mdash; let the screw move with the wood.</li>
  <li><strong>Breadboard ends</strong> with elongated mortises, single fixed screw at the center.</li>
  <li><strong>Laminated assemblies</strong> &mdash; alternating grain directions cancel movement.</li>
  <li><strong>Plywood or MDF</strong> &mdash; doesn&rsquo;t move. The structural answer when movement is unacceptable.</li>
</ul>

<h2 id="emc">Equilibrium moisture content</h2>
<dl class="wa-specs">
  <dt>Kiln-dried lumber</dt><dd>Typically 6&ndash;8% MC at the yard.</dd>
  <dt>Indoor furniture</dt><dd>Stabilizes at 6&ndash;9% depending on climate.</dd>
  <dt>Heated/cooled buildings (winter)</dt><dd>Can drop to 5%.</dd>
  <dt>Humid summers (Gulf Coast)</dt><dd>Can rise to 12% in unconditioned space.</dd>
</dl>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/frame-and-panel-construction">Frame and Panel Construction</a></li>
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
-- 54. Bent Lamination
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'bent-lamination',
  'Bent Lamination',
  'Techniques',
  'cabinet-making',
  'Glue thin strips together over a form, get a curved part. The technique behind every modern curved chair, arched doorway, and rocking chair rocker.',
  E'
<p class="wa-lede"><strong>Bent lamination</strong> is the production technique behind nearly every modern curved wood part: chair arms, sled bases, arched casework, rocking-chair rockers. Thin strips of solid wood are glued together over a form; the cured laminate holds the curve indefinitely.</p>

<h2 id="how">How it works</h2>
<p>A single thick board can&rsquo;t bend without breaking. Multiple thin strips, each willing to bend, can be glued in their bent position so that the strips lock each other&rsquo;s curve in place. Once the glue cures, the laminate is as strong as solid wood and holds the form.</p>

<h2 id="strip-thickness">Strip thickness</h2>
<dl class="wa-specs">
  <dt>1/16&Prime;</dt><dd>Tight bends, ~6&Prime; radius. Lots of strips needed.</dd>
  <dt>1/8&Prime;</dt><dd>General use. ~12&Prime; radius minimum.</dd>
  <dt>1/4&Prime;</dt><dd>Gentle curves. ~36&Prime; radius minimum.</dd>
  <dt>3/8&Prime;+</dt><dd>Very gentle curves only. Tends to springback.</dd>
</dl>

<h2 id="glues">Glue selection</h2>
<table class="wa-table">
  <thead><tr><th>Glue</th><th>Springback</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>PVA (Titebond)</td><td>High &mdash; ~10&ndash;15%</td><td>Cheap. Good for forgiving curves.</td></tr>
    <tr><td>Plastic resin (Unibond 800, DAP)</td><td>Low &mdash; ~3&ndash;5%</td><td>Standard for bent lamination.</td></tr>
    <tr><td>Epoxy</td><td>Lowest &mdash; ~1&ndash;2%</td><td>Best dimensional stability, slowest open time.</td></tr>
  </tbody>
</table>

<h2 id="forms">Forms</h2>
<ul>
  <li><strong>Hard form (male and female).</strong> Two MDF or particleboard halves clamp the strips between them. Most accurate.</li>
  <li><strong>Single-sided form + vacuum bag.</strong> Form on one side, atmospheric pressure forces the strips to it.</li>
  <li><strong>Form + clamps.</strong> Hand-clamped on a single-sided form. Simplest but pressure varies.</li>
</ul>

<h2 id="springback">Calculating springback</h2>
<p>Make the form 5&ndash;10% tighter than the target curve, depending on glue. Build a sample with the actual species, strip thickness, and glue first; measure springback empirically.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/steam-bending">Steam Bending</a></li>
  <li><a href="/wiki/article/wood-movement">Wood Movement</a></li>
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
-- 55. Steam Bending
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'steam-bending',
  'Steam Bending',
  'Techniques',
  'cabinet-making',
  'A solid wood part bent around a form after steaming. The traditional alternative to lamination, with different mechanical properties and a steeper learning curve.',
  E'
<p class="wa-lede"><strong>Steam bending</strong> takes a solid wood part, plasticizes it with steam, then forces it around a form where it cools and dries in the new shape. Unlike bent lamination, the part is one piece of solid wood &mdash; stronger, simpler, but more failure-prone.</p>

<h2 id="species">Species selection</h2>
<table class="wa-table">
  <thead><tr><th>Species</th><th>Bending suitability</th></tr></thead>
  <tbody>
    <tr><td>White oak</td><td>Excellent &mdash; the species behind chair-makers&rsquo; bench</td></tr>
    <tr><td>Hickory</td><td>Excellent &mdash; tool handles, hammer handles</td></tr>
    <tr><td>Ash</td><td>Excellent &mdash; baseball bats, sled rails</td></tr>
    <tr><td>Walnut</td><td>Good &mdash; used for chair backs</td></tr>
    <tr><td>Cherry</td><td>Fair</td></tr>
    <tr><td>Maple</td><td>Poor &mdash; cracks easily</td></tr>
    <tr><td>Pine</td><td>Generally not steam-bent &mdash; resin interferes</td></tr>
  </tbody>
</table>

<h2 id="process">Process</h2>
<ol>
  <li><strong>Stock prep.</strong> Use green or air-dried (not kiln-dried) wood at ~25%+ MC. KD wood breaks more often.</li>
  <li><strong>Steam box.</strong> 1 hour per inch of thickness at boiling.</li>
  <li><strong>Quick transfer.</strong> Move the steamed part to the form within 30 seconds &mdash; it stiffens fast.</li>
  <li><strong>Bend over the form</strong> with a backing strap (steel) on the outside of the curve to compress the fibers in compression rather than letting them tear in tension.</li>
  <li><strong>Hold for 24 hr.</strong> Let the wood cool and dry in shape.</li>
</ol>

<h2 id="why-strap">Why the steel backing strap</h2>
<p>Wood compresses 30%+ before failing in compression. Wood tears 2&ndash;3% in tension. The strap on the outside of the curve forces the wood into compression mode and unlocks the dramatic bending capacity.</p>

<div class="wa-callout">
<strong>Plan for failure.</strong> Even good bending stock breaks 10&ndash;20% of the time. Cut several extras of every part.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/bent-lamination">Bent Lamination</a></li>
  <li><a href="/wiki/article/white-oak">White Oak</a></li>
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
-- 56. Inlay and Marquetry
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'inlay-marquetry',
  'Inlay and Marquetry',
  'Techniques',
  'cabinetmaker',
  'Banding, stringing, marquetry, and parquetry — the four schools of decorative wood-on-wood ornamentation.',
  E'
<p class="wa-lede"><strong>Inlay</strong> and <strong>marquetry</strong> are the decorative wood-on-wood techniques that have signaled high-end furniture for five centuries. The same idea drives all four schools: cut a recess in a host piece, fit a contrasting wood into it, sand flush.</p>

<h2 id="four-schools">The four schools</h2>
<dl class="wa-specs">
  <dt>Stringing</dt><dd>Thin lines of contrasting wood (1/16&Prime;&ndash;1/8&Prime;) inlaid into grooves. Federal-style edge banding.</dd>
  <dt>Banding</dt><dd>Decorative strip of patterned wood inlaid as a border. Typically 1/4&Prime;&ndash;1&Prime; wide.</dd>
  <dt>Marquetry</dt><dd>Veneer pictures &mdash; multiple species cut and assembled into figurative or geometric patterns, then glued to a substrate.</dd>
  <dt>Parquetry</dt><dd>Geometric marquetry. Repeating patterns rather than pictures.</dd>
</dl>

<h2 id="techniques">Techniques</h2>
<ul>
  <li><strong>Hand cut with knife.</strong> Traditional. The most refined.</li>
  <li><strong>Chevalet.</strong> French marquetry foot-press saw. Very precise.</li>
  <li><strong>Scroll saw / fret saw.</strong> Hobby-level marquetry.</li>
  <li><strong>CNC.</strong> Modern production. Cuts both the recess and the inlay piece in one program.</li>
  <li><strong>Laser cutter.</strong> Excellent for thin veneers but burns the edges &mdash; usable on dark species.</li>
</ul>

<h2 id="materials">Materials</h2>
<p>Marquetry uses thin veneer (~1/40&Prime;&ndash;1/28&Prime;). Common species:</p>
<ul>
  <li>Holly &mdash; bright white background.</li>
  <li>Ebony, wenge &mdash; black contrast.</li>
  <li>Boxwood &mdash; warm yellow.</li>
  <li>Burls and crotch figures &mdash; texture.</li>
  <li>Dyed veneers &mdash; bright colors when natural species fall short.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/veneer-matching">Veneer Matching</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 57. Lumber Drying — Kiln vs Air
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'lumber-drying-kiln-vs-air',
  'Lumber Drying — Kiln vs Air',
  'Timber & Milling',
  'cabinet-making',
  'Why kiln-dried matters for cabinet work, what air-dried gets you, and the moisture content target that prevents joints from failing in service.',
  E'
<p class="wa-lede"><strong>Drying</strong> is what turns a freshly-felled log into stable lumber. Wood at 25%+ moisture content moves dramatically as it dries; getting it to a stable 6&ndash;8% MC before joinery is critical to building anything that survives a year.</p>

<h2 id="two-methods">Air-dried vs kiln-dried</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Air-dried</th><th>Kiln-dried</th></tr></thead>
  <tbody>
    <tr><td>Time</td><td>1 yr per inch of thickness</td><td>1&ndash;3 weeks</td></tr>
    <tr><td>Final MC</td><td>~12&ndash;15% in temperate climates</td><td>6&ndash;8%</td></tr>
    <tr><td>Bug eradication</td><td>None (powderpost beetle survives)</td><td>Yes (135&deg;F kill cycle)</td></tr>
    <tr><td>Color</td><td>Preserves natural color</td><td>Walnut steamed grey, cherry oxidizes faster</td></tr>
    <tr><td>Cell collapse</td><td>None</td><td>Possible if dried too fast</td></tr>
    <tr><td>Cost</td><td>Carrying cost (yard space)</td><td>Energy cost (gas/steam)</td></tr>
  </tbody>
</table>

<h2 id="cabinet-targets">Cabinet shop targets</h2>
<dl class="wa-specs">
  <dt>Indoor furniture, cabinetry</dt><dd>6&ndash;8% MC.</dd>
  <dt>Door frames, exterior millwork</dt><dd>10&ndash;12% MC.</dd>
  <dt>Outdoor furniture</dt><dd>14&ndash;18% MC.</dd>
</dl>

<h2 id="meter">Moisture meters</h2>
<ul>
  <li><strong>Pin meter.</strong> Two probes drive into the wood. Most accurate. Wagner, Lignomat.</li>
  <li><strong>Pinless (capacitance).</strong> Reads through the surface. Faster, less invasive.</li>
  <li>Always test multiple boards from a stack &mdash; a load can vary 2&ndash;3%.</li>
</ul>

<div class="wa-callout">
<strong>Acclimate before joinery.</strong> Move lumber into your shop for 7&ndash;14 days before cutting. Even dry lumber re-equilibrates with the shop&rsquo;s humidity.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/wood-movement">Wood Movement</a></li>
  <li><a href="/wiki/article/nhla-lumber-grading">NHLA Lumber Grading</a></li>
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
-- 58. NHLA Lumber Grading
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'nhla-lumber-grading',
  'NHLA Lumber Grading',
  'Timber & Milling',
  'cabinet-making',
  'FAS, F1F, Selects, 1 Common, 2 Common — the National Hardwood Lumber Association grades that determine your yield.',
  E'
<p class="wa-lede">The <strong>NHLA</strong> (National Hardwood Lumber Association) grading rules dictate what every hardwood lumber yard in North America sells under each grade name. The grade defines minimum yield of clear cuttings &mdash; defect-free pieces of a specific minimum size.</p>

<h2 id="grades">The standard grades</h2>
<table class="wa-table">
  <thead><tr><th>Grade</th><th>Minimum yield</th><th>Min cutting size</th><th>Use</th></tr></thead>
  <tbody>
    <tr><td>FAS (First and Seconds)</td><td>83.3% clear face</td><td>4&Prime;&times;5&prime; or 3&Prime;&times;7&prime;</td><td>Furniture, exposed cabinetry</td></tr>
    <tr><td>F1F (FAS one face)</td><td>83.3% clear on best face</td><td>Same as FAS</td><td>Furniture where one face shows</td></tr>
    <tr><td>Selects</td><td>83.3% clear on best face</td><td>4&Prime;&times;6&prime; or 3&Prime;&times;7&prime;</td><td>Furniture, narrower boards</td></tr>
    <tr><td>1 Common</td><td>66.7% clear face</td><td>4&Prime;&times;2&prime; or 3&Prime;&times;3&prime;</td><td>Cabinet shop default. Lots of usable but smaller cuttings.</td></tr>
    <tr><td>2A Common</td><td>50% clear face</td><td>3&Prime;&times;2&prime;</td><td>Flooring, framing, paint-grade</td></tr>
    <tr><td>3A Common</td><td>33.3% clear face</td><td>3&Prime;&times;2&prime;</td><td>Pallets, crating</td></tr>
  </tbody>
</table>

<h2 id="implications">Yield implications</h2>
<p>FAS sounds like the obvious choice, but it is 50% more expensive than 1 Common while only producing about 25% more usable yield in a typical cabinet shop. Most production cabinet shops buy 1 Common for everything except face-frame stock and high-visibility door stiles, where they buy FAS or Selects.</p>

<h2 id="domestic-vs-export">Domestic vs export</h2>
<p>NHLA writes one set of rules but mills grade slightly differently for domestic vs export buyers. Export grading is stricter on some defects. If you are buying through a wholesaler that sells to both, ask which grading they apply.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/lumber-drying-kiln-vs-air">Lumber Drying</a></li>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
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
-- 59. Wide-Belt Sanders
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'wide-belt-sanders',
  'Wide-Belt Sanders',
  'Stationary Machinery',
  'cabinet-making',
  'The production-shop machine that takes panels from glued-up to topcoat-ready in a single pass. Belt grit selection, calibration, and the difference between sanding and abrading.',
  E'
<p class="wa-lede">A <strong>wide-belt sander</strong> is the production-shop machine that surfaces glued-up panels and pre-finishes parts faster than any combination of hand and small-machine work. A 37&Prime; or 43&Prime; belt rolls over a vacuum-pinned conveyor; the panel goes in rough and comes out 220-grit ready in seconds.</p>

<h2 id="size">Size classes</h2>
<dl class="wa-specs">
  <dt>25&Prime; single-head</dt><dd>Small-shop entry. ~$10&ndash;15k. Adequate for most cabinet panels.</dd>
  <dt>37&Prime; double-head</dt><dd>Pro shop default. Two grits in one pass. ~$25&ndash;45k.</dd>
  <dt>43&Prime;+ multi-head</dt><dd>Production work. 3&ndash;4 belt heads + scotch-brite finish head. $80k+.</dd>
</dl>

<h2 id="belts">Belt grits</h2>
<table class="wa-table">
  <thead><tr><th>Pass</th><th>Grit</th><th>Use</th></tr></thead>
  <tbody>
    <tr><td>Calibration</td><td>60&ndash;80</td><td>Flatten glue-ups, remove planer marks</td></tr>
    <tr><td>Smoothing</td><td>120&ndash;150</td><td>Refine 80-grit scratches</td></tr>
    <tr><td>Pre-finish</td><td>180&ndash;220</td><td>Finish-ready surface</td></tr>
    <tr><td>Scotch-brite</td><td>Maroon (320 equiv)</td><td>De-nib between coats</td></tr>
  </tbody>
</table>

<h2 id="settings">Critical settings</h2>
<ul>
  <li><strong>Conveyor speed:</strong> 15&ndash;30 fpm typical. Faster = less heat but rougher surface.</li>
  <li><strong>Stock removal per head:</strong> 0.005&Prime;&ndash;0.015&Prime; depending on grit.</li>
  <li><strong>Belt tracking:</strong> Verify daily. A drifted belt walks off the head and can detonate at speed.</li>
  <li><strong>Vacuum:</strong> 8&Prime; main duct minimum. Belts gum up fast without aggressive extraction.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/sanding-schedule">Sanding Schedule</a></li>
  <li><a href="/wiki/article/dust-collection">Dust Collection</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 60. Shapers
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'shapers',
  'Shapers',
  'Stationary Machinery',
  'cabinet-making',
  'Heavy stationary spindle moulders for cope-and-stick door joinery, raised panels, and continuous mouldings the router cannot match.',
  E'
<p class="wa-lede">A <strong>shaper</strong> is a heavy-duty stationary version of a router table &mdash; a vertical spindle, large cutters, a power feeder, and 3&ndash;7 HP behind it. Where a router is for occasional profile work, a shaper is for production: cope-and-stick door joinery, raised panels, continuous moulding runs.</p>

<h2 id="vs-router">Shaper vs router table</h2>
<table class="wa-table">
  <thead><tr><th></th><th>Router table</th><th>Shaper</th></tr></thead>
  <tbody>
    <tr><td>Cutter mass</td><td>Light</td><td>Heavy &mdash; smoother cut, less burn</td></tr>
    <tr><td>HP</td><td>1.5&ndash;3</td><td>3&ndash;7</td></tr>
    <tr><td>Spindle</td><td>1/4&Prime; or 1/2&Prime; collet</td><td>3/4&Prime; or 1-1/4&Prime; spindle</td></tr>
    <tr><td>Cutter inventory</td><td>Cheap, vast</td><td>Expensive, professional</td></tr>
    <tr><td>Power feeder</td><td>Optional</td><td>Mandatory for production</td></tr>
    <tr><td>Cost</td><td>$300&ndash;1,500</td><td>$3,000&ndash;15,000</td></tr>
  </tbody>
</table>

<h2 id="cutters">Common cutter types</h2>
<ul>
  <li>Cope &amp; stick sets &mdash; matched 2-piece sets for door rails and stiles.</li>
  <li>Raised panel cutters &mdash; 3&Prime;+ diameter, slow speed.</li>
  <li>Edge profile (ogee, bullnose, classical).</li>
  <li>Drawer-lock joint cutters.</li>
  <li>Crown moulding profiles.</li>
</ul>

<h2 id="power-feeder">Power feeder</h2>
<p>Mandatory for any production shaper work. Three- or four-wheel rubber drive, 1/4&ndash;1 HP, variable speed. Pushes the workpiece through at consistent feed rate, no human hands near the cutter.</p>

<div class="wa-callout">
<strong>Spindle direction.</strong> Shapers reverse direction so cutters can be flipped to climb-cut figured wood. Reverse only on power feeder; never run reverse with hand-feed.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/routers">Routers</a></li>
  <li><a href="/wiki/article/cabinet-door-styles">Cabinet Door Styles</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 61. Drill Presses
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'drill-presses',
  'Drill Presses',
  'Stationary Machinery',
  'cabinet-making',
  'Floor and benchtop, single-spindle and multi-spindle, the cabinet-shop drill press serves more functions than its name suggests.',
  E'
<p class="wa-lede">A <strong>drill press</strong> is a fixed-spindle drilling machine. In a cabinet shop it doubles as a mortising machine (with a chisel attachment), a tapping fixture, and the only way to drill a perfectly perpendicular hole.</p>

<h2 id="classes">Classes</h2>
<dl class="wa-specs">
  <dt>Benchtop</dt><dd>1/3&ndash;3/4 HP, 8&Prime;&ndash;12&Prime; throat. Hobby work.</dd>
  <dt>Floor (15&Prime;&ndash;17&Prime; throat)</dt><dd>3/4&ndash;1 HP, 12&Prime;&ndash;17&Prime; throat. Pro shop standard.</dd>
  <dt>Radial drill press</dt><dd>Pivoting head reaches over wider work. Furniture and panel shops.</dd>
  <dt>Multi-spindle</dt><dd>Production drilling: hardware mounting, 32mm system holes. Most replaced by CNC since 2010.</dd>
</dl>

<h2 id="features">Features that matter</h2>
<ul>
  <li><strong>Variable speed</strong> &mdash; 250&ndash;3,000 RPM range. Slow for large bits, fast for small.</li>
  <li><strong>Cast-iron table</strong> with T-slots for clamping fixtures.</li>
  <li><strong>Quill stroke</strong> &mdash; 4&Prime; minimum for cabinet work.</li>
  <li><strong>Depth stop</strong> &mdash; for blind holes (hinge cups, dowel holes).</li>
</ul>

<h2 id="speeds">Bit speeds</h2>
<table class="wa-table">
  <thead><tr><th>Bit</th><th>Speed (hardwood)</th></tr></thead>
  <tbody>
    <tr><td>Twist drill 1/8&Prime;</td><td>3,000 RPM</td></tr>
    <tr><td>Twist drill 1/2&Prime;</td><td>1,000 RPM</td></tr>
    <tr><td>Forstner 1&Prime;</td><td>500 RPM</td></tr>
    <tr><td>Forstner 35mm (hinge cup)</td><td>500 RPM</td></tr>
    <tr><td>Forstner 2&Prime;+</td><td>250 RPM</td></tr>
  </tbody>
</table>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/the-32mm-system">The 32mm System</a></li>
  <li><a href="/wiki/article/mortising-machines">Mortising Machines</a></li>
</ul>
',
  3, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 62. Ash
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'ash',
  'Ash — Species Reference',
  'Wood Species',
  'cabinet-making',
  'White ash and black ash — light, strong, ring-porous, and increasingly endangered by emerald ash borer infestation.',
  E'
<p class="wa-lede"><strong>Ash</strong> (<em>Fraxinus</em> spp.) is a light, strong, ring-porous hardwood with a grain pattern resembling oak but with a paler, more uniform color. It built every Major League baseball bat for a century and is still the species of choice for tool handles, gym equipment, and Mid-Century-style cabinetry. The North American ash supply is in collapse from emerald ash borer.</p>

<h2 id="properties">Mechanical properties (white ash)</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,320 lbf.</dd>
  <dt>Specific gravity</dt><dd>0.60 air-dry.</dd>
  <dt>Color</dt><dd>Sapwood near-white; heartwood pale tan to medium brown.</dd>
  <dt>Pore structure</dt><dd>Ring-porous, similar to red oak. Open pores in the early-wood, dense in the late-wood.</dd>
</dl>

<h2 id="vs-oak">Ash vs oak</h2>
<p>Ash and white oak are often visually mistaken. Ash is paler, lighter in weight, and has straighter grain. Oak (red and white) has visible ray fleck on quartersawn cuts; ash does not.</p>

<h2 id="working">Working notes</h2>
<ul>
  <li>Cuts and machines beautifully &mdash; one of the easier hardwoods to work.</li>
  <li>Glues without surprises.</li>
  <li>Stains evenly with pre-stain conditioner.</li>
  <li>Bends excellently &mdash; the species behind steam-bent rocking chair rockers and tool handles.</li>
</ul>

<h2 id="eab">Emerald ash borer</h2>
<p>An invasive Asian beetle that has killed roughly 90% of North American ash trees since arriving in 2002. Most yards are still selling logged-before-infestation stock; supply is shrinking and prices are climbing. In 5&ndash;10 years North American ash will be a luxury species.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/red-oak">Red Oak</a></li>
  <li><a href="/wiki/article/steam-bending">Steam Bending</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 63. Sapele
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'sapele',
  'Sapele — Species Reference',
  'Wood Species',
  'cabinet-making',
  'African ribbon-figured hardwood often sold as "mahogany." Strong, stable, and dramatic — a serious cabinet wood in its own right.',
  E'
<p class="wa-lede"><strong>Sapele</strong> (<em>Entandrophragma cylindricum</em>) is the African hardwood most often sold as &ldquo;mahogany&rdquo; in modern lumber yards. Genetically it is a relative of mahogany; visually it has a more dramatic ribbon figure when quartersawn; mechanically it is harder and more stable than genuine mahogany.</p>

<h2 id="properties">Properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,410 lbf.</dd>
  <dt>Specific gravity</dt><dd>0.62 air-dry.</dd>
  <dt>Shrinkage</dt><dd>Tangential 7.4%, radial 4.6%.</dd>
  <dt>Color</dt><dd>Heartwood medium red-brown to dark golden; sapwood pale yellow-tan.</dd>
  <dt>Figure</dt><dd>Quartersawn produces dramatic alternating ribbon stripes (interlocked grain).</dd>
</dl>

<h2 id="quartersawn">Quartersawn ribbon</h2>
<p>The defining feature. The interlocked grain causes alternating bands to absorb light differently &mdash; one stripe looks lighter, the next darker, switching as you walk past. The single most dramatic figured wood in common cabinet supply.</p>

<h2 id="working">Working notes</h2>
<ul>
  <li>Interlocked grain tears out easily on a planer. Use a helical head or take light passes.</li>
  <li>Glues, sands, and finishes well once flat.</li>
  <li>Excellent for marine and exterior use &mdash; rot-resistant, stable.</li>
</ul>

<h2 id="finishing">Finishing</h2>
<p>Sapele rewards traditional film finishes. The chatoyance only appears under a film &mdash; a hand-rubbed CV or shellac shows the figure dramatically.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/mahogany">Mahogany</a></li>
  <li><a href="/wiki/article/walnut">Walnut</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 64. Beech
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'beech',
  'Beech — Species Reference',
  'Wood Species',
  'cabinet-making',
  'European and American beech: the workbench-and-tool-handle wood that sees occasional duty as a furniture wood for Scandinavian and Eastern European cabinetry.',
  E'
<p class="wa-lede"><strong>Beech</strong> (<em>Fagus</em> spp.) is the dense, straight-grained workbench wood. European beech (<em>F. sylvatica</em>) and American beech (<em>F. grandifolia</em>) are nearly indistinguishable. It steam-bends well and is one of the hardest commonly available hardwoods that takes paint cleanly.</p>

<h2 id="properties">Properties</h2>
<dl class="wa-specs">
  <dt>Janka hardness</dt><dd>1,300 lbf.</dd>
  <dt>Specific gravity</dt><dd>0.64 air-dry.</dd>
  <dt>Shrinkage</dt><dd>Tangential 11.9%, radial 5.5%. High &mdash; beech moves a lot.</dd>
  <dt>Color</dt><dd>Pale pink-tan, sapwood and heartwood barely distinguishable.</dd>
</dl>

<h2 id="uses">Uses</h2>
<ul>
  <li>Workbench tops &mdash; flat, hard, takes a beating.</li>
  <li>Bent furniture (Thonet bentwood, Eastern European chairs).</li>
  <li>Tool handles, mallets.</li>
  <li>Painted Scandinavian cabinetry.</li>
  <li>Toy manufacturing &mdash; safe, food-contact-safe, takes paint and dye cleanly.</li>
</ul>

<h2 id="working">Working notes</h2>
<ul>
  <li>Cuts cleanly with sharp tools.</li>
  <li>Moves more than most woods &mdash; allow extra room for seasonal expansion.</li>
  <li>Stains evenly. Takes dye particularly well.</li>
  <li>Steam bends excellently.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/hard-maple">Hard Maple</a></li>
  <li><a href="/wiki/article/steam-bending">Steam Bending</a></li>
</ul>
',
  3, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 65. Pricing Cabinet Jobs
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'pricing-cabinet-jobs',
  'Pricing Cabinet Jobs',
  'Shop & Business',
  'cabinet-making',
  'Linear foot, square foot, and cabinet-by-cabinet pricing models. Why each one breaks at the edges, and the labor multiplier that protects your margin.',
  E'
<p class="wa-lede">Cabinet pricing is the most consequential business skill in a custom shop. Bid too high and lose the job; bid too low and lose money on the build. Three pricing models dominate; each one breaks somewhere.</p>

<h2 id="three-models">The three models</h2>
<table class="wa-table">
  <thead><tr><th>Model</th><th>Strength</th><th>Weakness</th></tr></thead>
  <tbody>
    <tr><td>Linear foot ($/lf)</td><td>Quick to quote, easy for client to compare</td><td>Ignores cabinet height/depth/specials. Breaks on tall pantries and L-shaped islands.</td></tr>
    <tr><td>Square foot ($/sf)</td><td>Standard for hospitality/commercial</td><td>Door / no-door makes a huge difference; sf doesn&rsquo;t account.</td></tr>
    <tr><td>Cabinet-by-cabinet ($/cab)</td><td>Most accurate</td><td>Slow to quote; clients can&rsquo;t verify line items easily.</td></tr>
  </tbody>
</table>

<h2 id="basic-formula">A basic formula</h2>
<p>For frameless painted Shaker (the volume default in 2025):</p>
<ul>
  <li><strong>Material cost</strong> at retail (panels, doors, hardware, finish) &mdash; ~25&ndash;30% of bid.</li>
  <li><strong>Labor cost</strong> at burdened rate &times; estimated hours &mdash; ~35&ndash;45% of bid.</li>
  <li><strong>Overhead</strong> &mdash; ~15&ndash;20% of bid.</li>
  <li><strong>Profit</strong> &mdash; 12&ndash;18% of bid (target).</li>
</ul>

<h2 id="multipliers">Labor multipliers by complexity</h2>
<dl class="wa-specs">
  <dt>Production frameless, slab/Shaker, painted</dt><dd>1.0x baseline.</dd>
  <dt>Inset face frame, paint grade</dt><dd>1.4x.</dd>
  <dt>Inset face frame, stain grade with raised panel</dt><dd>1.8x.</dd>
  <dt>Stain-grade rift white oak, sequence-matched veneer</dt><dd>2.2x.</dd>
  <dt>Furniture-grade with hand-cut dovetails</dt><dd>3.0x+.</dd>
</dl>

<div class="wa-callout">
<strong>Track real hours per cabinet.</strong> The shops that win on margin track every hour against the cabinet that consumed it. Two years of data tells you which cabinet types are eating your margin.</div>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/awi-quality-grades">AWI Quality Grades</a></li>
  <li><a href="/wiki/article/shop-layout">Shop Layout</a></li>
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
-- 66. Shop Layout
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'shop-layout',
  'Shop Layout',
  'Shop & Business',
  'cabinet-making',
  'Material flow, machine placement, dust ducting, and the half-dozen layout decisions that turn a 2,000 sq ft shop into a 50-cabinet-a-week shop.',
  E'
<p class="wa-lede"><strong>Shop layout</strong> is the single decision that determines a small cabinet shop&rsquo;s production capacity. Two shops with identical equipment can run at completely different paces depending on whether material flows or whether every operation is a relocation.</p>

<h2 id="flow">Material flow</h2>
<p>The cabinet shop&rsquo;s job is to move sheets from receiving to finishing without backtracking. Plan layout in this sequence:</p>
<ol>
  <li><strong>Receiving / sheet storage</strong> &mdash; near the largest door.</li>
  <li><strong>Panel saw or CNC</strong> &mdash; first machine.</li>
  <li><strong>Edge banding</strong> &mdash; fed directly from the panel saw / CNC output.</li>
  <li><strong>Boring / hardware install</strong> &mdash; line borer or assembly bench.</li>
  <li><strong>Assembly</strong> &mdash; large open floor.</li>
  <li><strong>Finishing</strong> &mdash; spray booth, isolated.</li>
  <li><strong>Shipping / staging</strong> &mdash; near the loading door.</li>
</ol>

<h2 id="square-footage">Square footage rules of thumb</h2>
<dl class="wa-specs">
  <dt>Solo shop</dt><dd>1,200&ndash;2,000 sq ft. One CNC, one bander, no separate finishing.</dd>
  <dt>3-person shop</dt><dd>3,000&ndash;5,000 sq ft. CNC, edge bander, line borer, separate spray booth.</dd>
  <dt>10-person shop</dt><dd>8,000&ndash;15,000 sq ft. Pod-and-rail CNC + nested CNC, multi-head wide-belt, dedicated finish line.</dd>
</dl>

<h2 id="dust-and-power">Dust and power</h2>
<ul>
  <li><strong>Centralize the dust collector outside the building.</strong> Quieter, safer, easier to vent explosion-rated.</li>
  <li><strong>Run 6&Prime; main, 4&Prime; or 5&Prime; branches.</strong> Length of run governs CFM more than horsepower.</li>
  <li><strong>240V or 3-phase</strong> at every stationary tool.</li>
  <li><strong>Compressed air</strong> at every assembly station and in the spray booth. 3/4&Prime; black iron pipe, drop legs every 20&prime;.</li>
</ul>

<h2 id="lighting">Lighting</h2>
<p>~75 fc (foot-candles) at every machine, ~100 fc at finishing prep stations. LED 4000K with 90+ CRI for color-accurate stain matching.</p>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/dust-collection">Dust Collection</a></li>
  <li><a href="/wiki/article/spray-booth-setup">Spray Booth Setup</a></li>
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
-- 67. Mortising Machines
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'mortising-machines',
  'Mortising Machines',
  'Stationary Machinery',
  'cabinet-making',
  'Hollow-chisel, slot, oscillating-chisel — three families of mortising machine for production joinery.',
  E'
<p class="wa-lede">A <strong>mortising machine</strong> cuts the rectangular pocket that receives a tenon. Three families dominate, each suited to different joint sizes and production volumes.</p>

<h2 id="three-types">The three types</h2>
<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Hollow-chisel mortiser</div>
    <div class="wa-variation-when">Small shops, traditional mortise &amp; tenon</div>
    <div class="wa-variation-body">Drill bit inside a square chisel cuts a square hole. 1/4&Prime;&ndash;3/4&Prime; capacity.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Slot mortiser</div>
    <div class="wa-variation-when">Production loose-tenon work</div>
    <div class="wa-variation-body">Horizontal spindle traverses to cut a slot. Pairs with loose tenons. Festool Domino at the bench scale; SCM dedicated machines at the production scale.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Oscillating-chisel</div>
    <div class="wa-variation-when">Door manufacturing</div>
    <div class="wa-variation-body">A chisel reciprocates rapidly through the wood, cutting a clean rectangular slot. Specialty industrial.</div>
  </div>
</div>

<h2 id="hand-alternatives">Bench alternatives</h2>
<ul>
  <li>Drill press with a mortising attachment &mdash; entry-level.</li>
  <li>Festool Domino &mdash; replaces a slot mortiser for smaller shops.</li>
  <li>Router with a fence and stop &mdash; cuts a slot mortise; pair with a loose tenon.</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/mortise-and-tenon-joinery">Mortise &amp; Tenon Joinery</a></li>
  <li><a href="/wiki/article/domino-biscuit-joinery">Domino and Biscuit Joinery</a></li>
</ul>
',
  3, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();

-- ─────────────────────────────────────────────────────────────
-- 68. Cabinet Hardware Order Lists
-- ─────────────────────────────────────────────────────────────
insert into public.wiki_articles
  (slug, title, category, trade, excerpt, body, read_time_minutes, is_published, published_at)
values
(
  'cabinet-hardware-order-lists',
  'Cabinet Hardware Order Lists',
  'Shop & Business',
  'cabinet-making',
  'Counting hinges, slides, and pulls correctly the first time. The math of a typical kitchen and the line items that always get under-ordered.',
  E'
<p class="wa-lede">Counting hardware is one of the most error-prone steps in a cabinet quote. A 25-cabinet kitchen has hundreds of small parts; missing 4 hinges or 2 sets of soft-close slides delays the install by a week and a $250 rush-shipping invoice.</p>

<h2 id="hinges">Hinges</h2>
<dl class="wa-specs">
  <dt>Doors under 36&Prime; tall</dt><dd>2 hinges per door.</dd>
  <dt>Doors 36&ndash;48&Prime; tall</dt><dd>3 hinges per door.</dd>
  <dt>Doors over 48&Prime; tall</dt><dd>4 hinges per door.</dd>
  <dt>Order extra</dt><dd>~5% buffer for damaged units, lost cups.</dd>
</dl>

<h2 id="slides">Drawer slides</h2>
<dl class="wa-specs">
  <dt>1 set (left + right) per drawer.</dt><dd>Order by the pair, not the individual.</dd>
  <dt>Length</dt><dd>Match drawer box depth (typically cabinet depth minus 1&Prime;).</dd>
  <dt>Order extra</dt><dd>5&ndash;10% buffer.</dd>
</dl>

<h2 id="pulls">Pulls and knobs</h2>
<dl class="wa-specs">
  <dt>Doors</dt><dd>1 knob or pull per door.</dd>
  <dt>Drawers</dt><dd>1 pull per drawer (or 2 on drawers wider than 36&Prime;).</dd>
  <dt>Order extra</dt><dd>5% buffer.</dd>
</dl>

<h2 id="screws-and-bits">Easily forgotten line items</h2>
<ul>
  <li>Cup screws for hinges (typically 5/8&Prime; long).</li>
  <li>Mounting plate screws for hinges.</li>
  <li>Drawer-slide mounting screws (manufacturers ship enough only for the slide itself; not the drawer-front mounting).</li>
  <li>Pull/knob bolts of correct length for door/drawer thickness.</li>
  <li>Toe-kick mounting brackets.</li>
  <li>Soft-close dampers if the slide doesn&rsquo;t come with them built-in.</li>
  <li>End-panel screws.</li>
</ul>

<h2 id="example">Example: 12-cabinet base run</h2>
<p>12 base cabinets, 2 doors per cabinet (24 doors), 1 drawer above each (12 drawers), all under 36&Prime; tall:</p>
<ul>
  <li>48 hinges (24 doors &times; 2)</li>
  <li>12 pairs drawer slides</li>
  <li>24 + 12 = 36 pulls/knobs</li>
  <li>~36 mounting bolts of correct length</li>
  <li>~3 spare hinges, 2 spare slide pairs (5% buffer)</li>
</ul>

<h3 id="see-also">See also</h3>
<ul>
  <li><a href="/wiki/article/european-hinge-selection">European Hinge Selection</a></li>
  <li><a href="/wiki/article/drawer-slides">Drawer Slides</a></li>
  <li><a href="/wiki/article/pulls-and-knobs">Pulls and Knobs</a></li>
</ul>
',
  4, true, now()
)
on conflict (slug) do update set
  title = excluded.title, category = excluded.category, trade = excluded.trade,
  excerpt = excluded.excerpt, body = excluded.body,
  read_time_minutes = excluded.read_time_minutes,
  is_published = excluded.is_published, updated_at = now();
