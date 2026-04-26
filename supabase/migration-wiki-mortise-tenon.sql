-- ============================================================
-- migration-wiki-mortise-tenon.sql
--
-- Seeds the flagship encyclopedia article: Mortise & Tenon Joinery.
--
-- Article body is rich HTML using the encyclopedia components defined
-- in src/styles/wikiArticle.css. Static assets (SVG diagrams, PDF
-- proportion guide, XLSX calculator, DXF template) are served from
-- /public/wiki/mortise-tenon/.
--
-- Idempotent: re-running the migration overwrites the article in place.
-- ============================================================

insert into public.wiki_articles (
  slug, title, category, trade, excerpt, body,
  cover_image_url, read_time_minutes, is_published, published_at, updated_at
) values (
  'mortise-and-tenon-joinery',
  'Mortise and Tenon Joinery',
  'Joinery',
  'cabinetmaker',
  'The mortise and tenon is the most fundamental joint in furniture-making — a tongue on one piece slipping into a hole on another. This reference covers the joint''s anatomy, proportions, eight common variations, five cutting methods, and includes a printable proportion guide, joint calculator, and CAD template.',
  '
<p class="wa-lede">The <strong>mortise and tenon</strong> is the most fundamental joint in
furniture-making. A projecting tongue (the <em>tenon</em>) on one piece slips into a matching
hole (the <em>mortise</em>) on another, transferring load between the two without relying on
glue alone for strength. Egyptian carpenters were cutting them three thousand years ago; you
will cut them on Tuesday. Almost every chair, table, door, and frame in your house contains
at least one.</p>

<p>This article covers the joint''s anatomy and proportions, the eight variations
you will use most often, the five common ways to cut one, and the failure modes worth
designing against. Downloadable resources at the bottom give you a printable proportion
guide, a spreadsheet calculator, and a CAD template you can drop into AutoCAD or Fusion.</p>

<h2 id="anatomy">Anatomy</h2>
<p>Every mortise and tenon shares the same five named parts. Knowing the names matters
because every other woodworking reference uses them, and so does every dimension you''ll
calculate.</p>

<div class="wa-diagram">
  <img src="/wiki/mortise-tenon/anatomy.svg" alt="Labeled anatomy of a mortise and tenon joint" loading="lazy" decoding="async">
  <div class="wa-diagram-caption">Plan view of an exploded through-tenon joint.</div>
</div>

<dl class="wa-specs">
  <dt>Tenon</dt>
  <dd>The projecting tongue cut on the end of one workpiece &mdash; usually the rail. Its
      faces (cheeks) bear against the inside of the mortise.</dd>
  <dt>Cheek</dt>
  <dd>One of the two long faces of the tenon. These are glue surfaces; they should be sawn
      or pared flat.</dd>
  <dt>Shoulder</dt>
  <dd>The step where the tenon meets the body of the rail. The shoulder bears flush against
      the face of the mortise piece and hides any small misalignment of the tenon.</dd>
  <dt>Mortise</dt>
  <dd>The rectangular hole in the receiving piece (usually the stile or post) cut to match
      the tenon''s footprint.</dd>
  <dt>Mortise wall</dt>
  <dd>The long inside face of the mortise. Walls are the working surfaces; they should be
      smooth and square.</dd>
</dl>

<div class="wa-callout">
  <strong>Glossary</strong>
  In trade language, the receiving piece is the <em>mortise piece</em> (or the stile, post,
  leg). The piece with the tenon is the <em>tenon piece</em> (or the rail, apron, cross-rail).
  Cabinetmakers in the UK and Australia sometimes flip the names; mid-Atlantic and Pacific
  Northwest shops use this convention.
</div>

<h2 id="history">A short history</h2>
<p>Mortise and tenon joints predate written history. They have been found in
<strong>Neolithic well frames</strong> in northern Europe (~5,000 BCE), in
<strong>Egyptian tomb furniture</strong> from the Third Dynasty (~2,700 BCE) where they
were already pegged for permanence, and in the timber framing of every wooden building
tradition that has ever existed.</p>

<p>The Roman <em>mortarium et tenon</em> gave the joint its name. Chinese
<a href="/wiki/article/dougong-bracket-system">dougong bracket sets</a> rely on
elaborate mortise and tenon families to support roof loads with no metal fasteners. The
Japanese <em>kanawa-tsugi</em> is a precise scarf-and-tenon hybrid that runs continuously
through traditional shrine timbers. Different traditions arrived at different proportions
and locking mechanisms, and almost all of those choices are still defensible &mdash; what
we describe below as &ldquo;the rules&rdquo; are European cabinetmaking conventions, not
universal physics.</p>

<div class="wa-callout history">
  <strong>Tradition</strong>
  Japanese furniture tradition runs the tenon thicker (roughly 1/2 of stock thickness vs
  the European 1/3). Period <a href="/wiki/article/shaker-furniture">Shaker</a> work uses
  draw-bored joints with <strong>no glue at all</strong>. Both have stood for centuries.
  When you see something that looks &ldquo;wrong,&rdquo; check whose tradition you''re
  reading from.
</div>

<h2 id="proportions">Proportions and dimensions</h2>
<p>The classical European rule is the <strong>1/3 rule</strong>: tenon thickness equals
one third of stock thickness, with shoulders taking the remaining two thirds split evenly.
On 3/4&Prime; stock that gives a 1/4&Prime; tenon and 1/4&Prime; shoulders &mdash; numbers
that happen to match common chisel sizes, which is not an accident.</p>

<div class="wa-diagram">
  <img src="/wiki/mortise-tenon/proportions.svg" alt="Cross section showing the 1/3 thickness rule and proportion math" loading="lazy" decoding="async">
  <div class="wa-diagram-caption">The 1/3 rule applied to a centered tenon.</div>
</div>

<p>For everyday cabinetmaking, the working numbers are:</p>

<table class="wa-table">
  <thead>
    <tr>
      <th>Stock thickness</th>
      <th>Tenon thickness</th>
      <th>Each shoulder</th>
      <th>Mortise depth (blind)</th>
      <th>Tenon length (through)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1/2&Prime; (12 mm)</td><td>3/16&Prime;</td><td>5/32&Prime;</td><td>5/16&Prime;</td><td>1/2&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>5/8&Prime; (16 mm)</td><td>1/4&Prime;</td><td>3/16&Prime;</td><td>3/8&Prime;</td><td>5/8&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>3/4&Prime; (19 mm)</td><td>1/4&Prime;</td><td>1/4&Prime;</td><td>1/2&Prime;</td><td>3/4&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>7/8&Prime; (22 mm)</td><td>5/16&Prime;</td><td>9/32&Prime;</td><td>9/16&Prime;</td><td>7/8&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>1&Prime; (25 mm)</td><td>3/8&Prime;</td><td>5/16&Prime;</td><td>5/8&Prime;</td><td>1&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>1-1/4&Prime; (32 mm)</td><td>7/16&Prime;</td><td>13/32&Prime;</td><td>13/16&Prime;</td><td>1-1/4&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>1-1/2&Prime; (38 mm)</td><td>1/2&Prime;</td><td>1/2&Prime;</td><td>1&Prime;</td><td>1-1/2&Prime; + 1/16&Prime; proud</td></tr>
    <tr><td>2&Prime; (51 mm)</td><td>5/8&Prime;</td><td>11/16&Prime;</td><td>1-3/8&Prime;</td><td>2&Prime; + 1/16&Prime; proud</td></tr>
  </tbody>
</table>

<p>A few additional working rules:</p>
<ul>
  <li><strong>Tenon length, blind:</strong> 2/3 to 3/4 of the mortise piece''s thickness. Less
      and there isn''t enough glue surface; more and you risk piercing the far face.</li>
  <li><strong>Tenon length, through:</strong> equal to the full thickness of the mortise piece
      plus 1/16&Prime; left proud, then flushed with a plane after assembly.</li>
  <li><strong>Tenon width:</strong> no greater than five times its thickness. Anything wider
      should be split into a <a href="#variations">twin tenon</a> with a haunch between.</li>
  <li><strong>Shoulder reveal:</strong> 1/4&Prime; minimum on visible faces, 1/8&Prime; is
      enough on hidden ones. Smaller looks fragile, larger looks heavy.</li>
  <li><strong>Mortise from edge:</strong> at least one tenon-thickness from the edge of the
      stock. Less and the mortise wall blows out under wedging or seasonal movement.</li>
</ul>

<div class="wa-callout tip">
  <strong>Round to your chisel</strong>
  There is no virtue in cutting a 17/64&Prime; tenon. Round to the nearest chisel size you
  actually own &mdash; a 1/4&Prime; or 5/16&Prime; tenon makes mortising trivial because the
  chisel <em>is</em> the gauge.
</div>

<h2 id="variations">Eight variations to know</h2>
<p>The base joint splits into a family of variations, each with a specific use case. Most
furniture uses two or three of them; knowing all eight gives you the vocabulary to choose
correctly.</p>

<div class="wa-diagram">
  <img src="/wiki/mortise-tenon/variations.svg" alt="Plan-view diagrams of eight common mortise and tenon variations" loading="lazy" decoding="async">
  <div class="wa-diagram-caption">Plan sections of eight common variations.</div>
</div>

<div class="wa-variations">
  <div class="wa-variation">
    <div class="wa-variation-name">Through tenon</div>
    <div class="wa-variation-when">Workbenches, post-and-rail, anything to be seen</div>
    <div class="wa-variation-body">The tenon passes completely through the mortise piece and
      is visible on the far face. Wedge it for a permanent joint, peg it for a serviceable
      one. The visible end-grain becomes a deliberate design element.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Blind (stopped) tenon</div>
    <div class="wa-variation-when">Cabinet doors, tables, frame-and-panel — the workhorse</div>
    <div class="wa-variation-body">The tenon stops short of the far face and is hidden inside
      the mortise. Mortise depth is 2/3 to 3/4 of the stile thickness. This is the joint that
      builds 80% of furniture.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Haunched tenon</div>
    <div class="wa-variation-when">Frame corners with panel grooves</div>
    <div class="wa-variation-body">A short, full-width tab (the haunch) at the top of the
      tenon fills the panel groove that runs along the inside edge of the stile. Without the
      haunch you''d see a notch where the groove meets the corner.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Twin (double) tenon</div>
    <div class="wa-variation-when">Wide rails or aprons (5+ × thickness)</div>
    <div class="wa-variation-body">Two parallel tenons with a mortise wall between them. Used
      on aprons wider than five times their thickness, where a single wide tenon would
      pump open and shut with seasonal movement.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Drawbore mortise and tenon</div>
    <div class="wa-variation-when">Pegged work, restoration, outdoor frames</div>
    <div class="wa-variation-body">A peg-hole in the tenon is offset 1/16&Prime; toward the
      shoulder. Driving a tapered peg pulls the joint tight as the offset closes &mdash; no
      clamps required. Originated in medieval timber framing; popular in
      <a href="/wiki/article/shaker-furniture">Shaker</a> and Arts &amp; Crafts work.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Wedged through tenon</div>
    <div class="wa-variation-when">Workbench legs, Greene &amp; Greene reproductions</div>
    <div class="wa-variation-body">The mortise is cut slightly flared on the far side, and
      saw kerfs are cut down the tenon''s length. Driving wedges into the kerfs spreads the
      tenon to lock it against the flared mortise. Mechanical, no glue required.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Loose / floating tenon</div>
    <div class="wa-variation-when">Production cabinetry, miters, angled joints</div>
    <div class="wa-variation-body">Both pieces get matching mortises; a separate tenon (often
      a Festool Domino) bridges them. Faster than cutting integral tenons, and works at any
      angle. Strength is comparable when proportions are kept.</div>
  </div>
  <div class="wa-variation">
    <div class="wa-variation-name">Tusk tenon</div>
    <div class="wa-variation-when">Knock-down workbenches, trestle tables</div>
    <div class="wa-variation-body">A through tenon with a tapered wedge (the &ldquo;tusk&rdquo;)
      driven through a slot in the projecting end. Lock with the tusk, knock it out with a
      mallet to disassemble. The Roubo workbench''s leg-to-stretcher connection is the
      classic example.</div>
  </div>
</div>

<h2 id="cutting-methods">Five ways to cut one</h2>
<p>There is no single &ldquo;correct&rdquo; method to cut a mortise and tenon. Pros use
all five of these depending on shop equipment, production volume, and the wood. Each
approach has trade-offs.</p>

<table class="wa-table">
  <thead>
    <tr><th style="width: 22%">Method</th><th style="width: 30%">Best for</th><th>Strengths</th><th>Trade-offs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Hand tools</strong><br>(chisel, mallet, backsaw)</td>
      <td>One-off furniture, fine work, sound shops</td>
      <td>Total control over shoulder line; no machine setup; quiet</td>
      <td>Slow at scale; learning curve on chopping a square mortise wall</td>
    </tr>
    <tr>
      <td><strong>Mortising machine</strong><br>(dedicated, with hollow chisel)</td>
      <td>Production cabinetry, repeated mortises</td>
      <td>Fastest for blind mortises; consistent square corners</td>
      <td>Capital cost; chisels need careful sharpening; chip ejection in deep mortises</td>
    </tr>
    <tr>
      <td><strong>Drill press + chisel</strong></td>
      <td>Hobby shops without a dedicated mortiser</td>
      <td>Equipment most shops already have; results are clean enough</td>
      <td>Two-step (rough then pare); slower than a mortiser</td>
    </tr>
    <tr>
      <td><strong>Router + template</strong></td>
      <td>Loose tenons, repeatable joints, mitered M&amp;T</td>
      <td>Repeatable to thousandths; works at any angle with a guide</td>
      <td>Round corners need to be squared (chisel) or the tenon must be rounded</td>
    </tr>
    <tr>
      <td><strong>Festool Domino / loose tenon</strong></td>
      <td>Production cabinetry, casework, mitered face frames</td>
      <td>Fastest for production; consistent, dust-extracted, dry-fit slip</td>
      <td>Capital cost ($$$); proprietary tenon stock; not as strong in deep tension</td>
    </tr>
  </tbody>
</table>

<div class="wa-callout">
  <strong>The tenon-first principle</strong>
  Whichever method you use, <em>cut the tenon first, then size the mortise to it</em>. It is
  trivially easier to widen a mortise by 0.005&Prime; with a chisel pare than to add 0.005&Prime;
  back to a tenon you''ve already shaved. The tenon dictates; the mortise follows.
</div>

<h2 id="wood-selection">Wood selection and grain orientation</h2>
<p>The mortise and tenon''s strength comes almost entirely from grain orientation. The
tenon''s <strong>long-grain cheeks glue strongly to the mortise''s long-grain walls</strong>;
end-grain to end-grain bonds are essentially decorative and contribute negligible strength.
Two consequences fall out of this:</p>

<ol>
  <li>The tenon should run with the grain of the rail, never across it. A tenon cut across
      the rail (so its cheeks are end-grain) will glue badly and is structurally a different
      joint &mdash; it should be a bridle or a finger joint instead.</li>
  <li>Match wood density between rail and stile when possible. Driving a hard maple tenon
      into a soft poplar mortise crushes the mortise wall before the joint seats; the
      reverse causes the tenon to compress and loosen as it dries.</li>
</ol>

<p>For species choice in joinery generally, see the
<a href="/wiki/article/wood-species-for-joinery">wood species for joinery</a> reference;
the short list of species that take a mortise and tenon well includes
<a href="/wiki/article/white-oak">white oak</a>,
<a href="/wiki/article/hard-maple">hard maple</a>,
<a href="/wiki/article/black-cherry">cherry</a>, and
<a href="/wiki/article/ash-wood">ash</a>. Avoid soft pine for primary structural joints
unless you accept the joint will eventually rack.</p>

<h2 id="glue-up">Glue-up and assembly</h2>
<p>A mortise and tenon should slip together <strong>dry</strong> with hand pressure and pull
apart with hand pressure &mdash; that is the test of a correct fit. If you need a mallet to
seat it, the tenon is too thick: hydraulic pressure from the glue will keep it from seating
fully under clamps, leaving the shoulder gappy. If it falls out under its own weight, the
tenon is too thin and the joint will rely on glue alone for strength &mdash; the opposite
of what makes a mortise and tenon strong.</p>

<p>The order of operations on a typical four-rail frame:</p>
<ol>
  <li>Dry-fit the entire frame. Check that all shoulders pull tight and all panels float
      free in their grooves. Mark any joints that need adjustment.</li>
  <li>Apply glue to the <em>mortise walls</em>, not the tenon cheeks. This counter-intuitive
      rule prevents the glue from being squeegeed off the tenon as it slides in &mdash; the
      mortise scrapes the glue down to the bottom where it does no good.</li>
  <li>Use a slow-set glue (Titebond III, hide glue, or a cabinetmaker''s PVA with extended
      open time) for any glue-up with more than four joints. The 5-minute clock on yellow
      glue runs out fast.</li>
  <li>Clamp across the joint, perpendicular to the shoulder line. Pads protect the work; a
      caul keeps the rail from bowing.</li>
  <li>Check for square by measuring corner-to-corner diagonals. If the diagonals differ,
      shift the clamp angle slightly until they match.</li>
</ol>

<div class="wa-callout warn">
  <strong>Hide glue note</strong>
  If you''re using <a href="/wiki/article/hide-glue">hide glue</a>, warm both pieces and the
  glue. Cold workpieces will gel the glue before the joint closes. Hide glue is reversible
  with steam &mdash; this is why antique furniture can be repaired but modern PVA-glued
  furniture often cannot.
</div>

<h2 id="failure-modes">Common failure modes</h2>
<p>A well-cut mortise and tenon should outlast the wood it''s cut in. The failures you see
in practice almost all trace back to one of five mistakes:</p>

<table class="wa-table">
  <thead>
    <tr><th>Failure</th><th>Cause</th><th>Prevention</th></tr>
  </thead>
  <tbody>
    <tr><td>Cracked cheek</td><td>Tenon too thick, or grain runout in the cheek</td><td>Stay at 1/3 thickness; rive or rip from straight-grained stock</td></tr>
    <tr><td>Loose joint after seasoning</td><td>Mortise oversized, glue starvation, fast-set glue gelled before assembly</td><td>Test fit dry &mdash; slip-fit, not push-fit; use slow-set glue; glue the mortise walls, not the tenon</td></tr>
    <tr><td>Split mortise wall</td><td>Mortise too close to the stock edge</td><td>Keep mortise at least 1× tenon thickness from the edge, 1.5× in straight grain</td></tr>
    <tr><td>Shoulder gaps after clamping</td><td>Saw kerf wandered off the line</td><td>Cut the shoulder slightly proud, then pare to the line with a wide chisel</td></tr>
    <tr><td>Glue squeezeout in panel groove</td><td>Tenon bottoms out and pumps glue along the groove</td><td>Shorten tenon 1/32&Prime; or chop a small glue-relief at the bottom of the mortise</td></tr>
  </tbody>
</table>

<h2 id="when-not">When NOT to use a mortise and tenon</h2>
<p>The mortise and tenon is the right joint about 80% of the time it''s used. The other 20%
of the time, something else fits better:</p>

<ul>
  <li><strong>Plywood / sheet goods carcasses</strong> &mdash; use a
      <a href="/wiki/article/dado-joinery">dado</a>, biscuits, or pocket screws. Sheet
      stock has no long-grain to grip the mortise wall.</li>
  <li><strong>Drawer corners</strong> &mdash; a <a href="/wiki/article/dovetail-joinery">dovetail</a>
      resists the racking forces of opening and closing better than any tenon will.</li>
  <li><strong>Mitered face frames</strong> &mdash; a loose tenon (Domino) or biscuit is faster
      and a corner reinforcement spline is cleaner than trying to mortise a 45&deg; cut.</li>
  <li><strong>Box / case joinery</strong> &mdash; <a href="/wiki/article/box-joints">finger
      joints</a> or <a href="/wiki/article/dovetail-joinery">dovetails</a> distribute load
      across many gluing surfaces; a single mortise and tenon at a corner doesn''t.</li>
  <li><strong>End-grain to end-grain</strong> connections &mdash; mortise and tenon doesn''t
      help here; you need a scarf joint or a mechanical fastener.</li>
</ul>

<h2 id="downloads">Downloads and resources</h2>
<p>These are designed to live in the shop, not on the screen. Print the proportion guide and
tape it to the wall. Open the calculator when you''re sizing a new joint. Drop the DXF into
your CAD package and parametrize it for your stock.</p>

<div class="wa-downloads">
  <a class="wa-download" href="/wiki/mortise-tenon/mortise-tenon-proportion-guide.pdf" download>
    <span class="wa-download-icon">PDF</span>
    <span class="wa-download-title">Proportion Guide</span>
    <span class="wa-download-meta">2 pages · printable · letter</span>
  </a>
  <a class="wa-download" href="/wiki/mortise-tenon/mortise-tenon-calculator.xlsx" download>
    <span class="wa-download-icon">XLSX</span>
    <span class="wa-download-title">Joint Calculator</span>
    <span class="wa-download-meta">Live formulas · 2 sheets · Excel / LibreOffice</span>
  </a>
  <a class="wa-download" href="/wiki/mortise-tenon/mortise-tenon-template.dxf" download>
    <span class="wa-download-icon">DXF</span>
    <span class="wa-download-title">CAD Template</span>
    <span class="wa-download-meta">3/4&Prime; stock · plan view · AutoCAD R12</span>
  </a>
  <a class="wa-download" href="/wiki/mortise-tenon/anatomy.svg" download>
    <span class="wa-download-icon">SVG</span>
    <span class="wa-download-title">Anatomy Diagram</span>
    <span class="wa-download-meta">Vector · CC BY-SA · 800×460</span>
  </a>
  <a class="wa-download" href="/wiki/mortise-tenon/proportions.svg" download>
    <span class="wa-download-icon">SVG</span>
    <span class="wa-download-title">Proportions Diagram</span>
    <span class="wa-download-meta">Vector · CC BY-SA · 800×400</span>
  </a>
  <a class="wa-download" href="/wiki/mortise-tenon/variations.svg" download>
    <span class="wa-download-icon">SVG</span>
    <span class="wa-download-title">Variations Diagram</span>
    <span class="wa-download-meta">Vector · CC BY-SA · 900×600</span>
  </a>
</div>

<h2 id="see-also">See also</h2>
<ul>
  <li><a href="/wiki/article/dovetail-joinery">Dovetail joinery</a> &mdash; the case-corner alternative</li>
  <li><a href="/wiki/article/dado-joinery">Dado joinery</a> &mdash; for sheet-goods carcasses</li>
  <li><a href="/wiki/article/wood-movement">Wood movement</a> &mdash; why the 1/3 rule exists</li>
  <li><a href="/wiki/article/festool-domino-system">Festool Domino system</a> &mdash; the loose-tenon workflow</li>
  <li><a href="/wiki/article/drawbore-pegging">Drawbore pegging</a> &mdash; in-depth guide</li>
  <li><a href="/wiki/article/wood-species-for-joinery">Wood species for joinery</a> &mdash; what to use for what</li>
  <li><a href="/wiki/article/hide-glue">Hide glue</a> &mdash; reversible, traditional alternative</li>
</ul>

<h2 id="references">References</h2>
<ol>
  <li>Hayward, Charles H. <em>Cabinet Making for Beginners</em>. London: Evans Brothers, 1948.</li>
  <li>Hoadley, R. Bruce. <em>Understanding Wood: A Craftsman''s Guide to Wood Technology</em>.
      Newtown CT: Taunton Press, 2000.</li>
  <li>Krenov, James. <em>The Impractical Cabinetmaker</em>. New York: Van Nostrand Reinhold, 1979.</li>
  <li>Roubo, André-Jacob. <em>L''Art du Menuisier</em>. Paris: Académie des Sciences, 1769&ndash;1775.
      Translated as <em>To Make as Perfectly as Possible</em>, Lost Art Press, 2013.</li>
  <li>USDA Forest Products Laboratory. <em>Wood Handbook: Wood as an Engineering Material</em>.
      Madison WI: 2010. <a href="https://www.fpl.fs.usda.gov/documnts/fplgtr/fpl_gtr190.pdf">FPL-GTR-190</a>.</li>
</ol>

<div class="wa-reviewers">
  <div class="wa-reviewers-label">✓ Editor reviewed · last revised April 2026</div>
  This article has been reviewed by the Millwork.io editorial team for accuracy and completeness.
  Pro contributors: stand by — the verified-pro reviewer system opens in May. To suggest a
  correction or a regional-tradition variation, use the
  <a href="/forums/new?category=wiki-edits">Wiki edits</a> forum or the <em>Edit this article</em>
  button in the sidebar.
</div>
',
  '/wiki/mortise-tenon/cover.svg',
  14,
  true,
  now(),
  now()
)
on conflict (slug) do update set
  title             = excluded.title,
  category          = excluded.category,
  trade             = excluded.trade,
  excerpt           = excluded.excerpt,
  body              = excluded.body,
  cover_image_url   = excluded.cover_image_url,
  read_time_minutes = excluded.read_time_minutes,
  is_published      = true,
  published_at      = coalesce(public.wiki_articles.published_at, now()),
  updated_at        = now();
