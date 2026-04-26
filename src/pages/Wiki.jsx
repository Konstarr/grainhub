import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import '../styles/wikiDashboard.css';

const CLUSTERS = [
  {
    key: 'Timber & Milling', icon: 'TM', accent: '#5a7a5a',
    desc: 'From the standing tree to the surfaced board.',
    subtopics: [
      { name: 'Forestry & Silviculture',     match: /(forestry|silviculture|stand|harvest cycle)/i },
      { name: 'Harvesting & Logging',        match: /(logging|harvest|fell|skid|bucking)/i },
      { name: 'Sawmilling',                  match: /(sawmill|band mill|circular mill|porta?-?mill|wood-?mizer)/i },
      { name: 'Lumber Grading',              match: /(grading|nhla|select|fas|s2s|s4s|grade rules)/i },
      { name: 'Air & Kiln Drying',           match: /(air dr|kiln|dehumidif|drying schedule|moisture content)/i },
      { name: 'Lumber Yards & Suppliers',    match: /(lumber yard|wholesale|hardwood dealer|distributor)/i },
      { name: 'Reclaimed & Salvaged',        match: /(reclaim|salvag|barn wood|urban lumber|deconstructed)/i },
      { name: 'Specialty & Figured Stock',   match: /(figured|curly|quilted|spalted|exotic)/i },
    ],
  },
  {
    key: 'Wood Species', icon: 'SP', accent: '#7a5530',
    desc: 'Janka, density, color, workability for every commercial species.',
    subtopics: [
      { name: 'Domestic Hardwoods',          match: /(white oak|red oak|maple|cherry|walnut|ash|hickory|birch|poplar|domestic hardwood)/i },
      { name: 'Imported Hardwoods',          match: /(mahogany|teak|sapele|wenge|purpleheart|bubinga|tropical|imported hardwood)/i },
      { name: 'Softwoods',                   match: /(pine|fir|cedar|spruce|hemlock|softwood)/i },
      { name: 'Manufactured Panels',         match: /(plywood|mdf|particleboard|osb|hdf|panel)/i },
      { name: 'Veneer & Burl',               match: /(veneer|burl|figured slice|crotchwood)/i },
      { name: 'Sustainability & CITES',      match: /(fsc|sustainability|cites|endangered)/i },
      { name: 'Comparison & Selection',      match: /(species comparison|wood selection)/i },
    ],
  },
  {
    key: 'Joinery', icon: 'JN', accent: '#8a5030',
    desc: 'Every named joint, with diagrams and proportions.',
    subtopics: [
      { name: 'Mortise & Tenon',             match: /mortise|tenon/i },
      { name: 'Dovetails',                   match: /dovetail/i },
      { name: 'Dadoes & Rabbets',            match: /dado|rabbet|groove/i },
      { name: 'Finger & Box Joints',         match: /finger|box joint/i },
      { name: 'Miters & Splines',            match: /miter|spline|biscuit/i },
      { name: 'Loose Tenon (Domino)',        match: /loose tenon|domino|floating/i },
      { name: 'Specialty & Decorative',      match: /scarf|lap|bridle|tusk|specialty joint/i },
    ],
  },
  {
    key: 'Finishing', icon: 'FN', accent: '#9c5e30',
    desc: 'Stain, dye, topcoat, schedule, and troubleshooting.',
    subtopics: [
      { name: 'Stains & Dyes',               match: /stain|dye|aniline|pigment/i },
      { name: 'Lacquer & Pre-Cat',           match: /lacquer|pre-?cat/i },
      { name: 'Polyurethane',                match: /poly(urethane)?/i },
      { name: 'Oil Finishes',                match: /(tung|linseed|danish|hardwax|oil finish)/i },
      { name: 'Shellac & French Polish',     match: /shellac|french polish/i },
      { name: 'Application Methods',         match: /spray|hvlp|brush|wipe|application/i },
      { name: 'Schedules & Recipes',         match: /finish(ing)? schedule|recipe/i },
      { name: 'Troubleshooting',             match: /blush|orange peel|fish eye|defect/i },
    ],
  },
  {
    key: 'Hand Tools', icon: 'HT', accent: '#6b3d23',
    desc: 'Planes, chisels, saws, marking, sharpening.',
    subtopics: [
      { name: 'Bench & Block Planes',        match: /bench plane|block plane|smoother|jack plane|jointer plane/i },
      { name: 'Specialty Planes',            match: /shoulder plane|router plane|moulding plane|specialty plane/i },
      { name: 'Chisels',                     match: /chisel/i },
      { name: 'Hand Saws',                   match: /(handsaw|backsaw|dovetail saw|tenon saw)/i },
      { name: 'Marking & Measuring',         match: /(marking|gauge|square|caliper|rule|measuring)/i },
      { name: 'Sharpening',                  match: /sharpen|stone|honing|grinding/i },
      { name: 'Workholding',                 match: /vise|holdfast|clamp|workholding/i },
    ],
  },
  {
    key: 'Power Tools', icon: 'PT', accent: '#8c5a30',
    desc: 'Handheld electric and cordless tools.',
    subtopics: [
      { name: 'Routers',                     match: /(handheld router|trim router|plunge router)/i },
      { name: 'Drills & Drivers',            match: /(drill|driver|impact|cordless drill)/i },
      { name: 'Random Orbit Sanders',        match: /(random orbit|ros|finishing sander)/i },
      { name: 'Track Saws',                  match: /(track saw|plunge saw|festool ts)/i },
      { name: 'Biscuit & Domino',            match: /(biscuit joiner|domino|festool df)/i },
      { name: 'Pocket-Hole Tools',           match: /(pocket hole|kreg|pocket screw)/i },
      { name: 'Multi-Tools & Rotary',        match: /(oscillating tool|dremel|rotary tool|multi-?tool)/i },
    ],
  },
  {
    key: 'Stationary Machinery', icon: 'MC', accent: '#5d3a1c',
    desc: 'Setup, tuning, safety, and lifecycle.',
    subtopics: [
      { name: 'Tablesaws',                   match: /tablesaw|table saw/i },
      { name: 'Jointers & Planers',          match: /jointer|planer/i },
      { name: 'Bandsaws',                    match: /bandsaw|band saw/i },
      { name: 'Drill Presses',               match: /drill press/i },
      { name: 'Mortisers',                   match: /mortiser|hollow chisel/i },
      { name: 'Edgebanders',                 match: /edgeband/i },
      { name: 'Stationary Sanders',          match: /(wide belt|drum sander|edge sander|stroke sander)/i },
      { name: 'Dust Collection',             match: /dust|collection|cyclone|extract/i },
    ],
  },
  {
    key: 'CNC & Digital', icon: 'CN', accent: '#3a4a82',
    desc: 'Software, post-processing, machines, robotics.',
    subtopics: [
      { name: 'CAD Software',                match: /(autocad|fusion 360|sketchup|cabinet vision|microvellum|cad)/i },
      { name: 'CAM & Toolpathing',           match: /(cam|toolpath|aspire|vcarve|cabinetparts)/i },
      { name: 'CNC Machines',                match: /(cnc machine|cnc router|laguna swift|biesse rover|shopbot|axyz|onsrud)/i },
      { name: 'Cutting Strategies',          match: /(cutting strateg|nesting|optimization|chip load)/i },
      { name: 'Post-Processors',             match: /(post.?processor|gcode|machine controller)/i },
      { name: 'CNC Tooling',                 match: /(end mill|compression bit|spoilboard|cnc bit)/i },
      { name: 'Industrial Robotics',         match: /(robotic|6-axis|industrial automation)/i },
    ],
  },
  {
    key: 'Hardware & Adhesives', icon: 'HW', accent: '#8a4a3a',
    desc: 'Hinges, slides, fasteners, glues, adhesives.',
    subtopics: [
      { name: 'Hinges',                      match: /hinge|euro|butt hinge|barrel/i },
      { name: 'Drawer Slides',               match: /drawer slide|undermount|ball bearing/i },
      { name: 'Knobs, Pulls & Locks',        match: /knob|pull|handle|lock|latch/i },
      { name: 'Fasteners & Connectors',      match: /screw|nail|bolt|fastener|cam lock|knockdown/i },
      { name: 'Wood Glues',                  match: /(pva|titebond|wood glue|aliphatic|polyurethane glue)/i },
      { name: 'Hide & Specialty Glues',      match: /(hide glue|epoxy|cyanoacrylate|ca glue|hot melt)/i },
      { name: 'Specialty Hardware',          match: /(specialty hardware|leveler|caster|magnet)/i },
    ],
  },
  {
    key: 'Techniques', icon: 'TQ', accent: '#4a6b30',
    desc: 'Bending, veneering, repair, glue-up, layout.',
    subtopics: [
      { name: 'Bending (Steam & Lam.)',      match: /bend(ing)?|steam|lamination/i },
      { name: 'Veneering & Inlay',           match: /veneer|inlay|marquetry|parquetry/i },
      { name: 'Repair & Restoration',        match: /repair|restoration|conservation/i },
      { name: 'Wood Movement',               match: /wood movement|seasonal|expansion|shrinkage/i },
      { name: 'Surface Prep & Sanding',      match: /(surface prep|sanding sequence|grit progression)/i },
      { name: 'Glue-up & Clamping',          match: /(glue.?up|clamping|cauls|panel glue)/i },
      { name: 'Layout & Marking',            match: /(layout|story stick|marking out)/i },
    ],
  },
  {
    key: 'Cabinetmaking & Millwork', icon: 'CM', accent: '#a06030',
    desc: 'Production cabinetry and architectural millwork.',
    subtopics: [
      { name: 'Frameless (Euro) Cabinets',   match: /(frameless|32mm|european cabinet)/i },
      { name: 'Face-Frame Cabinets',         match: /(face.?frame|inset|partial overlay|full overlay)/i },
      { name: 'Architectural Millwork',      match: /(architectural millwork|panel|wainscot|crown|moulding|trim)/i },
      { name: 'Doors',                       match: /(cabinet door|raised panel|shaker door|mdf door|slab door)/i },
      { name: 'Drawers & Boxes',             match: /(drawer box|drawer construction|baltic birch box)/i },
      { name: 'Countertops & Tops',          match: /(countertop|stone top|butcher block top|laminate top)/i },
      { name: 'Closets & Storage',           match: /(closet system|wardrobe|murphy bed|built-?in)/i },
    ],
  },
  {
    key: 'Furniture Making', icon: 'FM', accent: '#825a3a',
    desc: 'Studio and custom furniture, every form.',
    subtopics: [
      { name: 'Tables & Desks',              match: /(table|desk|trestle|pedestal table)/i },
      { name: 'Chairs & Seating',            match: /(chair|seat|windsor|bench|stool|sofa)/i },
      { name: 'Casework & Cabinets',         match: /(case piece|chest of drawers|sideboard|hutch|armoire)/i },
      { name: 'Beds & Bedroom',              match: /(bed frame|headboard|four-?poster|bedroom set)/i },
      { name: 'Studio Furniture',            match: /(studio furniture|krenov|maloof|nakashima|art furniture)/i },
      { name: 'Reproduction Work',           match: /(reproduction|period piece|antique reproduction)/i },
      { name: 'Outdoor Furniture',           match: /(outdoor furniture|adirondack|teak garden|patio)/i },
    ],
  },
  {
    key: 'Boat Building & Marine', icon: 'BM', accent: '#3a6a82',
    desc: 'Marine carpentry, hulls, spars, restoration.',
    subtopics: [
      { name: 'Plank-on-Frame',              match: /(plank.?on.?frame|carvel|lapstrake|clinker)/i },
      { name: 'Plywood Construction',        match: /(stitch.?and.?glue|plywood boat|sheet plywood hull)/i },
      { name: 'Cold-Molded',                 match: /(cold.?molded|cold molding|epoxy laminated hull)/i },
      { name: 'Strip Planking',              match: /(strip plank|strip-?built|cedar strip)/i },
      { name: 'Spars & Rigging',             match: /(spar|mast|gaff|rigging|boom)/i },
      { name: 'Marine Finishes',             match: /(marine finish|spar varnish|two-?part urethane|awlgrip)/i },
      { name: 'Restoration & Repair',        match: /(boat restoration|marine repair|hull repair)/i },
    ],
  },
  {
    key: 'Lutherie & Instruments', icon: 'LU', accent: '#6a4a82',
    desc: 'Stringed instrument making, setup, tonewoods.',
    subtopics: [
      { name: 'Acoustic Guitars',            match: /(acoustic guitar|dreadnought|om|jumbo|parlor|martin|gibson)/i },
      { name: 'Electric Guitars',            match: /(electric guitar|telecaster|stratocaster|les paul|solid body)/i },
      { name: 'Violin Family',               match: /(violin|viola|cello|stradivari|guarneri)/i },
      { name: 'Mandolins & Banjos',          match: /(mandolin|banjo|bouzouki|ukulele)/i },
      { name: 'Tonewoods',                   match: /(tonewood|spruce top|rosewood back|ebony fingerboard|sitka)/i },
      { name: 'Setup & Repair',              match: /(luthier setup|fret level|nut|saddle|setup)/i },
      { name: 'Hide Glue & Hot Glue',        match: /(hide glue|hot glue|reversible joint|liquid hide)/i },
    ],
  },
  {
    key: 'Specialty Disciplines', icon: 'SD', accent: '#3a8270',
    desc: 'Turning, carving, cooperage, timber framing.',
    subtopics: [
      { name: 'Spindle Turning',             match: /(spindle turn|chisel turn|skew chisel)/i },
      { name: 'Bowl & Hollow Turning',       match: /(bowl turn|hollow turn|hollow form)/i },
      { name: 'Segmented Turning',           match: /(segmented turn|segment ring)/i },
      { name: 'Relief & Chip Carving',       match: /(relief carving|chip carving|incised)/i },
      { name: 'Sculpture & 3D Carving',      match: /(sculpture|3d carve|figure carving)/i },
      { name: 'Cooperage (Barrels)',         match: /(cooper|barrel|cask|stave)/i },
      { name: 'Timber Framing',              match: /(timber frame|post and beam|bent assembly)/i },
    ],
  },
  {
    key: 'History & Schools', icon: 'HS', accent: '#824a4a',
    desc: 'Periods, regional traditions, master craftsmen.',
    subtopics: [
      { name: 'Shaker',                      match: /(shaker furniture|shaker style|hancock)/i },
      { name: 'American Federal & Empire',   match: /(federal|empire|hepplewhite|sheraton|duncan phyfe)/i },
      { name: 'Arts & Crafts / Mission',     match: /(arts and crafts|mission style|stickley|morris)/i },
      { name: 'Greene & Greene',             match: /(greene.{0,3}greene|gamble house|cloud lift)/i },
      { name: 'Mid-Century Modern',          match: /(mid.?century|eames|wegner|panton|saarinen|nelson)/i },
      { name: 'Scandinavian Design',         match: /(scandinavian|danish modern|finn juhl|hans wegner)/i },
      { name: 'Japanese Joinery',            match: /(japanese joinery|kanawa|sashimono|kumiko)/i },
      { name: 'Master Craftsmen',            match: /(krenov|maloof|nakashima|esherick|maker biography)/i },
    ],
  },
  {
    key: 'Industry & Brands', icon: 'IB', accent: '#82723a',
    desc: 'The companies that supply the trade.',
    subtopics: [
      { name: 'Equipment Manufacturers',     match: /(festool|sawstop|powermatic|grizzly|laguna|jet|delta|biesse|scm|martin)/i },
      { name: 'Hardware Brands',             match: /(blum|grass|hettich|salice|hafele|rockler|knape vogt)/i },
      { name: 'Finish & Adhesive Brands',    match: /(general finishes|sherwin williams|target coatings|titebond|gorilla glue|m\.l\. campbell)/i },
      { name: 'Software Vendors',            match: /(microvellum|cabinet vision|autodesk|vectric|ecabinet)/i },
      { name: 'Distributors & Suppliers',    match: /(rockler|woodcraft|highland woodworking|lee valley|woodpeckers)/i },
      { name: 'Furniture Manufacturers',     match: /(stickley furniture|herman miller|knoll|thomasville)/i },
      { name: 'Trade Associations',          match: /(awi|kcma|wmma|nhla|nwfa|trade association)/i },
    ],
  },
  {
    key: 'Shop & Business', icon: 'SB', accent: '#3a4a82',
    desc: 'Layout, pricing, contracts, safety, taxes.',
    subtopics: [
      { name: 'Shop Layout & Design',        match: /shop layout|workshop design|workflow/i },
      { name: 'Dust Collection Design',      match: /(dust collection|cyclone sizing|cfm|ducting)/i },
      { name: 'Pricing & Estimating',        match: /pricing|estimat|quote|bid/i },
      { name: 'Contracts & Customers',       match: /contract|customer|client/i },
      { name: 'Safety & OSHA',               match: /safety|osha|ppe|injury/i },
      { name: 'Insurance & Taxes',           match: /insurance|tax|liability/i },
      { name: 'Marketing & Sales',           match: /marketing|sales|lead/i },
      { name: 'Hiring & Apprentices',        match: /hiring|apprentice|employee/i },
    ],
  },
];

function topicSlug(s) {
  return encodeURIComponent(s);
}

const DID_YOU_KNOW = [
  'Mortise and tenon joints have been found in Egyptian tomb furniture from 2,700 BCE - and they were already pegged for permanence.',
  'White oak floats in salt water and sinks in fresh water? Its closed-cell structure traps almost no air.',
  'Janka hardness is measured by pressing a 0.444-inch-diameter steel ball halfway into a board and recording the pounds-force required.',
  'The original Stanley #4 smoothing plane has been produced almost continuously since 1869, with only minor changes to the frog and lateral lever.',
  'Hide glue is reversible with steam - which is why 18th-century furniture can be repaired but most modern PVA-glued furniture can not.',
  'Board-foot is a volume measure: 144 cubic inches of nominal lumber, regardless of the actual surfaced dimensions.',
  'Festool produced its first Domino DF 500 in 2007; before that, "loose tenons" were either router-cut or biscuit-joined.',
  'The rule of thumb that tenon thickness equals 1/3 of stock thickness comes from the European cabinetmaking tradition. Japanese furniture runs closer to 1/2.',
  'The Sitka spruce used for guitar tops grows almost exclusively in a narrow strip along the Pacific Northwest coast - the same trees historically used for aircraft propellers.',
  'A standard wine barrel uses 32 staves of American or French oak, hand-shaped and toasted over an open fire. The toast level is what gives the wine its vanilla and caramel notes.',
];

function pickRandom(arr, n = 3) {
  const out = [];
  const used = new Set();
  while (out.length < Math.min(n, arr.length)) {
    const i = Math.floor(Math.random() * arr.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(arr[i]);
  }
  return out;
}

function relativeTime(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return d + ' days ago';
  if (d < 30) return Math.floor(d / 7) + ' weeks ago';
  if (d < 365) return Math.floor(d / 30) + ' months ago';
  return Math.floor(d / 365) + ' years ago';
}

export default function Wiki() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      setArticles((data || []).map((r) => ({ ...mapWikiRow(r), updatedAtRaw: r.updated_at })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const featuredArticles = articles.slice(0, 3);
  const recentlyUpdated = articles.slice(0, 6);

  const articlesByCluster = useMemo(() => {
    const map = {};
    for (const c of CLUSTERS) map[c.key] = [];
    articles.forEach((a) => {
      const cat = (a.category || '').trim();
      let placed = false;
      for (const c of CLUSTERS) {
        if (cat === c.key || cat.toLowerCase() === c.key.toLowerCase()) {
          map[c.key].push(a);
          placed = true;
          break;
        }
      }
      if (!placed) {
        const lc = cat.toLowerCase();
        if (/joinery|joint/.test(lc)) map['Joinery'].push(a);
        else if (/finish/.test(lc)) map['Finishing'].push(a);
        else if (/cnc|digital/.test(lc)) map['CNC & Digital'].push(a);
        else if (/cabinet|millwork/.test(lc)) map['Cabinetmaking & Millwork'].push(a);
        else if (/furniture/.test(lc)) map['Furniture Making'].push(a);
        else if (/boat|marine/.test(lc)) map['Boat Building & Marine'].push(a);
        else if (/luthier|guitar|violin|instrument/.test(lc)) map['Lutherie & Instruments'].push(a);
        else if (/turn|carve|cooper|timber frame/.test(lc)) map['Specialty Disciplines'].push(a);
        else if (/lumber|timber|sawmill|dryin|kiln/.test(lc)) map['Timber & Milling'].push(a);
        else if (/species|wood/.test(lc)) map['Wood Species'].push(a);
        else if (/machine|stationary/.test(lc)) map['Stationary Machinery'].push(a);
        else if (/power tool|router|drill|sander/.test(lc)) map['Power Tools'].push(a);
        else if (/hand|plane|chisel|saw/.test(lc)) map['Hand Tools'].push(a);
        else if (/hardware|hinge|fast|glue|adhesive/.test(lc)) map['Hardware & Adhesives'].push(a);
        else if (/tech|bend|veneer/.test(lc)) map['Techniques'].push(a);
        else if (/history|tradition|shaker|maker/.test(lc)) map['History & Schools'].push(a);
        else if (/manufacturer|brand|industry|supplier/.test(lc)) map['Industry & Brands'].push(a);
        else if (/shop|business|pricing/.test(lc)) map['Shop & Business'].push(a);
      }
    });
    return map;
  }, [articles]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) { setSearchResults([]); return; }
    const hits = articles.filter((a) => {
      const hay = (a.title + ' ' + (a.excerpt || '') + ' ' + (a.category || '')).toLowerCase();
      return hay.includes(q);
    }).slice(0, 6);
    setSearchResults(hits);
  }, [searchQuery, articles]);

  const fact = useMemo(() => DID_YOU_KNOW[Math.floor(Math.random() * DID_YOU_KNOW.length)], []);
  const otherFacts = useMemo(() => pickRandom(DID_YOU_KNOW, 3), []);

  const totalArticles = articles.length;
  const reviewedCount = articles.filter((a) => a.body && a.body.length > 1000).length;
  const totalSubtopics = CLUSTERS.reduce((n, c) => n + c.subtopics.length, 0);

  return (
    <div className="wiki-dash">
      <section className="wd-hero">
        <div className="wd-hero-inner">
          <div className="wd-hero-eyebrow">GrainHub Encyclopedia</div>
          <h1 className="wd-hero-title">The reference for everyone who works wood.</h1>
          <p className="wd-hero-sub">
            From standing tree to finished piece - {CLUSTERS.length} fields, {totalSubtopics} sub-topics,
            written by working pros and free to read.
          </p>

          <div className="wd-search" ref={searchRef}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search the encyclopedia - species, joints, finishes, tools, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="wd-search-results">
                {searchResults.map((r) => (
                  <Link
                    key={r.id}
                    to={'/wiki/article/' + r.slug}
                    className="wd-search-result"
                    onClick={() => setSearchQuery('')}
                  >
                    <div className="wd-search-result-title">{r.title}</div>
                    <div className="wd-search-result-meta">{r.category}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="wd-stats">
            <div className="wd-stat">
              <div className="wd-stat-num">{totalArticles}</div>
              <div className="wd-stat-label">Articles</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{CLUSTERS.length}</div>
              <div className="wd-stat-label">Major fields</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{totalSubtopics}</div>
              <div className="wd-stat-label">Sub-topics</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{reviewedCount}</div>
              <div className="wd-stat-label">Reviewed</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ROW: 3 most recent articles, side by side */}
      {featuredArticles.length > 0 && (
        <section className="wd-section">
          <div className="wd-section-head">
            <div>
              <div className="wd-section-eyebrow">Featured this week</div>
              <h2 className="wd-section-title">Editor&apos;s picks</h2>
            </div>
          </div>
          <div className="wd-featured-row">
            {featuredArticles.map((a, i) => (
              <Link
                key={a.id}
                to={'/wiki/article/' + a.slug}
                className={'wd-feat-card' + (i === 0 ? ' lead' : '')}
              >
                <div className="wd-feat-img" style={{ background: 'linear-gradient(135deg,#3d2615,#1c0f06)' }}>
                  {a.coverImage && <img src={a.coverImage} alt={a.title} loading="lazy" decoding="async"/>}
                  {i === 0 && <div className="wd-feat-badge">FEATURED</div>}
                </div>
                <div className="wd-feat-body">
                  <div className="wd-feat-cat">{a.category || 'Reference'}</div>
                  <h3 className="wd-feat-title">{a.title}</h3>
                  {a.excerpt && (
                    <p className="wd-feat-excerpt">
                      {a.excerpt.length > 140 ? a.excerpt.slice(0, 140) + '...' : a.excerpt}
                    </p>
                  )}
                  <div className="wd-feat-meta">
                    {a.readTime && <span>{a.readTime}</span>}
                    {a.readTime && <span className="wd-dot">.</span>}
                    <span>Updated {relativeTime(a.updatedAtRaw || a.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* THE LIBRARY: 18 compact cluster cards in a tight grid */}
      <section className="wd-section">
        <div className="wd-section-head">
          <div>
            <div className="wd-section-eyebrow">The library</div>
            <h2 className="wd-section-title">Browse the entire encyclopedia</h2>
            <p className="wd-section-desc">
              {CLUSTERS.length} fields, {totalSubtopics} sub-topics, all visible at once. Click any
              sub-topic to see the articles in it.
            </p>
          </div>
        </div>

        <div className="wd-grid">
          {CLUSTERS.map((c) => {
            const list = articlesByCluster[c.key] || [];
            return (
              <div className="wd-card-cluster" key={c.key} style={{ '--accent': c.accent }}>
                <div className="wd-card-cluster-head">
                  <span className="wd-card-cluster-icon">{c.icon}</span>
                  <div className="wd-card-cluster-id">
                    <div className="wd-card-cluster-name">{c.key}</div>
                    <div className="wd-card-cluster-meta">
                      {list.length} {list.length === 1 ? 'article' : 'articles'} . {c.subtopics.length} sub-topics
                    </div>
                  </div>
                </div>
                <p className="wd-card-cluster-desc">{c.desc}</p>
                <div className="wd-card-cluster-topics">
                  {c.subtopics.map((sub, idx) => {
                    const n = list.filter((a) =>
                      sub.match.test((a.title || '') + ' ' + (a.excerpt || ''))
                    ).length;
                    return (
                      <span key={sub.name}>
                        {idx > 0 && <span className="wd-topic-sep">.</span>}
                        <Link
                          to={'/wiki?cluster=' + topicSlug(c.key) + '&topic=' + topicSlug(sub.name)}
                          className={'wd-topic-link' + (n > 0 ? ' has' : '')}
                        >
                          {sub.name}
                          {n > 0 && <span className="wd-topic-n"> {n}</span>}
                        </Link>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT + ASIDE */}
      <section className="wd-section wd-two-col">
        <div className="wd-recent">
          <div className="wd-section-head">
            <div>
              <div className="wd-section-eyebrow">Recently updated</div>
              <h2 className="wd-section-title">What&apos;s changed</h2>
            </div>
          </div>
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
          {!loading && recentlyUpdated.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>
              No published articles yet - the encyclopedia is just getting started.
            </p>
          )}
          <ul className="wd-recent-list">
            {recentlyUpdated.map((a) => (
              <li key={a.id} className="wd-recent-item">
                <Link to={'/wiki/article/' + a.slug} className="wd-recent-link">
                  <div className="wd-recent-cat">{a.category || 'Reference'}</div>
                  <div className="wd-recent-title">{a.title}</div>
                  <div className="wd-recent-meta">
                    {a.readTime && <span>{a.readTime}</span>}
                    {a.readTime && <span className="wd-dot">.</span>}
                    <span>Updated {relativeTime(a.updatedAtRaw || a.updatedAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <aside className="wd-aside">
          <div className="wd-card wd-card-amber">
            <div className="wd-card-eyebrow">Did you know?</div>
            <p className="wd-card-fact">{fact}</p>
            <div className="wd-card-divider" />
            <ul className="wd-fact-list">
              {otherFacts.filter((f) => f !== fact).slice(0, 2).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="wd-card wd-card-dark">
            <div className="wd-card-eyebrow" style={{ color: '#ffd7ac' }}>Help build it</div>
            <h3 className="wd-card-title">Articles needed in every field</h3>
            <p className="wd-card-text">
              Working pros get bylines, reputation, and a public reviewer credit on every
              article they help shape.
            </p>
            <div className="wd-card-actions">
              <Link to="/forums/new?category=wiki-edits" className="wd-btn-primary">
                Propose an article
              </Link>
              <Link to="/forums/category/wiki" className="wd-btn-ghost">
                Discuss with editors
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <section className="wd-cta-band">
        <div className="wd-cta-inner">
          <div>
            <div className="wd-cta-eyebrow">For working pros</div>
            <h2 className="wd-cta-title">Become a verified contributor</h2>
            <p className="wd-cta-text">
              Verified pros get bylines, marginal pro-notes on related articles, and a
              listed page that buyers can find. Reviewer program opens May 2026.
            </p>
          </div>
          <div className="wd-cta-actions">
            <Link to="/forums/category/wiki" className="wd-btn-primary lg">Join the editorial channel</Link>
            <Link to="/account/subscription" className="wd-btn-ghost lg">View vendor packs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
