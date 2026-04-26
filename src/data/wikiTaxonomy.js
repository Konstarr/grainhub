/**
 * Wiki taxonomy: 18 top-level fields, 131 sub-topics.
 * Imported by Wiki.jsx (dashboard) and WikiCluster.jsx (per-cluster page).
 *
 * `match` is the regex applied against an article's title + excerpt to
 * place real articles into the correct sub-topic without a schema
 * migration. When a real subtopic_id column lands on the table, this
 * fallback goes away and matching becomes exact.
 */

export const CLUSTERS = [
  {
    key: 'Timber & Milling', slug: 'timber-milling', icon: 'TM', accent: '#5a7a5a',
    desc: 'From the standing tree to the surfaced board.',
    longDesc: 'Forestry, harvesting, sawmilling, lumber grading, drying, and the wholesale lumber trade. Everything that turns a standing tree into stock you can build with.',
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
    key: 'Wood Species', slug: 'wood-species', icon: 'SP', accent: '#7a5530',
    desc: 'Janka, density, color, workability for every commercial species.',
    longDesc: 'Reference for every commercially traded wood species: density, Janka hardness, color, grain pattern, workability, finish receptivity, sustainability, and what it is best used for.',
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
    key: 'Joinery', slug: 'joinery', icon: 'JN', accent: '#8a5030',
    desc: 'Every named joint, with diagrams and proportions.',
    longDesc: 'The full vocabulary of woodworking joints: how each one is cut, when to use it, and the trade-offs between traditions.',
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
    key: 'Finishing', slug: 'finishing', icon: 'FN', accent: '#9c5e30',
    desc: 'Stain, dye, topcoat, schedule, and troubleshooting.',
    longDesc: 'Every product class, every application method, complete schedules, and the troubleshooting playbook for when blush, orange peel, or fish eye shows up.',
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
    key: 'Hand Tools', slug: 'hand-tools', icon: 'HT', accent: '#6b3d23',
    desc: 'Planes, chisels, saws, marking, sharpening.',
    longDesc: 'The non-powered tools that built furniture for centuries before electricity. Tuning, sharpening, and using each one well.',
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
    key: 'Power Tools', slug: 'power-tools', icon: 'PT', accent: '#8c5a30',
    desc: 'Handheld electric and cordless tools.',
    longDesc: 'Routers, drills, sanders, track saws, joiners. Setup, technique, accessory selection, and brand comparisons.',
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
    key: 'Stationary Machinery', slug: 'machinery', icon: 'MC', accent: '#5d3a1c',
    desc: 'Setup, tuning, safety, and lifecycle.',
    longDesc: 'The big cast-iron and steel machines that anchor a real shop. Setup procedures, alignment, blade and knife selection, lifecycle costs.',
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
    key: 'CNC & Digital', slug: 'cnc-digital', icon: 'CN', accent: '#3a4a82',
    desc: 'Software, post-processing, machines, robotics.',
    longDesc: 'CAD, CAM, post-processors, machine selection, cutting strategies, tooling. Everything from hobby ShopBot to industrial Biesse Rover.',
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
    key: 'Hardware & Adhesives', slug: 'hardware-adhesives', icon: 'HW', accent: '#8a4a3a',
    desc: 'Hinges, slides, fasteners, glues, adhesives.',
    longDesc: 'The metal and chemistry that holds furniture together. Selection, installation, lifecycle, and failure modes.',
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
    key: 'Techniques', slug: 'techniques', icon: 'TQ', accent: '#4a6b30',
    desc: 'Bending, veneering, repair, glue-up, layout.',
    longDesc: 'The processes that take you from rough lumber to finished joint. Layout, glue-up, surface prep, plus the specialty techniques that solve hard problems.',
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
    key: 'Cabinetmaking & Millwork', slug: 'cabinetmaking-millwork', icon: 'CM', accent: '#a06030',
    desc: 'Production cabinetry and architectural millwork.',
    longDesc: 'The 32mm system, frameless and face-frame, doors, drawers, counters, closet systems, and the workflow that runs a real cabinet shop.',
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
    key: 'Furniture Making', slug: 'furniture-making', icon: 'FM', accent: '#825a3a',
    desc: 'Studio and custom furniture, every form.',
    longDesc: 'Tables, chairs, casework, beds, studio art furniture, period reproduction, and outdoor work.',
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
    key: 'Boat Building & Marine', slug: 'boat-building', icon: 'BM', accent: '#3a6a82',
    desc: 'Marine carpentry, hulls, spars, restoration.',
    longDesc: 'Plank-on-frame, plywood, cold-molded, strip-planking, spars, marine finishes, and restoration of every kind of wooden boat.',
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
    key: 'Lutherie & Instruments', slug: 'lutherie-instruments', icon: 'LU', accent: '#6a4a82',
    desc: 'Stringed instrument making, setup, tonewoods.',
    longDesc: 'Acoustic and electric guitars, the violin family, mandolins and banjos, tonewoods, setup, and the unique adhesives lutherie depends on.',
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
    key: 'Specialty Disciplines', slug: 'specialty-disciplines', icon: 'SD', accent: '#3a8270',
    desc: 'Turning, carving, cooperage, timber framing.',
    longDesc: 'The trades that branch off from cabinetmaking. Turning, carving, sculpture, cooperage, and timber framing.',
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
    key: 'History & Schools', slug: 'history-schools', icon: 'HS', accent: '#824a4a',
    desc: 'Periods, regional traditions, master craftsmen.',
    longDesc: 'The traditions, periods, and master craftsmen behind today’s practice. From Shaker to Greene & Greene to Japanese sashimono.',
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
    key: 'Industry & Brands', slug: 'industry-brands', icon: 'IB', accent: '#82723a',
    desc: 'The companies that supply the trade.',
    longDesc: 'Equipment manufacturers, hardware brands, finish makers, software vendors, distributors, furniture manufacturers, and the trade associations.',
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
    key: 'Shop & Business', slug: 'shop-business', icon: 'SB', accent: '#3a4a82',
    desc: 'Layout, pricing, contracts, safety, taxes.',
    longDesc: 'The non-craft side of the trade. Shop layout and dust collection design, estimating and contracts, safety, insurance, taxes, marketing, and hiring.',
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

export const TOTAL_SUBTOPICS = CLUSTERS.reduce((n, c) => n + c.subtopics.length, 0);

export function clusterBySlug(slug) {
  return CLUSTERS.find((c) => c.slug === slug) || null;
}

export function topicSlug(s) {
  return encodeURIComponent(s);
}
