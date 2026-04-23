/**
 * Content for the home page.
 * Edit any of this and the page updates automatically.
 * Later these will come from an API — for now they're hard-coded,
 * which matches the static mockup 1:1.
 */

export const HERO_STATS = [
  { num: '24,800', label: 'Active members' },
  { num: '142K', label: 'Forum posts' },
  { num: '3,600', label: 'Wiki articles' },
  { num: '890', label: 'Machinery listings' },
];

export const FEATURED_NEWS = {
  tag: 'Industry Report',
  tagColor: 'default', // default | green | blue | amber | red
  title:
    'Cabinet & Millwork Revenue Up 8.4% in Q1 as Custom Residential Demand Accelerates Nationwide',
  excerpt:
    "AWMAC's quarterly index shows strong demand driven by high-end remodels and new custom residential builds, while commercial office millwork softens. Material costs are stabilizing after two years of significant volatility in hardwood and sheet goods.",
  source: 'AWMAC Quarterly',
  time: '3 hours ago',
  readTime: '6 min read',
};

export const NEWS_ITEMS = [
  {
    icon: '🪵',
    iconColor: 'green',
    title: 'KCMA Releases Updated Cabinet Construction Standards for 2025 — Key Changes Summarized',
    meta: 'Standards & Compliance · 5 hours ago · 4 min read',
    tag: 'Standards',
    tagColor: 'green',
  },
  {
    icon: '⚙️',
    iconColor: 'amber',
    title: 'Homag Introduces AI-Driven Nesting Software for Small-Batch Cabinet Shops at LIGNA 2025',
    meta: 'CNC & Technology · 8 hours ago · 3 min read',
    tag: 'Technology',
    tagColor: 'amber',
  },
  {
    icon: '📈',
    iconColor: 'blue',
    title: "Lumber Futures Dip 4% as Pacific Northwest Timber Supply Recovers from Last Season's Disruptions",
    meta: 'Materials Market · 12 hours ago · 2 min read',
    tag: 'Markets',
    tagColor: 'blue',
  },
  {
    icon: '⚠️',
    iconColor: 'red',
    title: 'CARB Phase 3 Composite Wood Emissions Rules: What Cabinet Shops Need to Know Before 2026',
    meta: 'Regulation & Compliance · 1 day ago · 5 min read',
    tag: 'Regulatory',
    tagColor: 'red',
  },
];

export const FORUM_TABS = [
  '🔥 Hot Today',
  '✨ New Posts',
  '❓ Unanswered',
  '🔖 My Subscriptions',
];

export const FORUM_POSTS = [
  {
    avatar: 'TK',
    avatarColor: 'av-a',
    title: 'Best approach for full-overlay frameless on an out-of-square opening? Photos inside',
    meta: 'Cabinet Making · by TomKowalski · 2 hours ago',
    replies: 48,
    views: 621,
    statusTag: { label: '✓ Answered', variant: 'answered' },
  },
  {
    avatar: 'SR',
    avatarColor: 'av-b',
    title: "Recommend a water-based post-cat lacquer that won't raise grain on hard maple?",
    meta: 'Finishing & Coatings · by ShawnRomero · 4 hours ago',
    replies: 31,
    views: 412,
    statusTag: { label: '🔥 Hot', variant: 'hot' },
  },
  {
    avatar: 'ML',
    avatarColor: 'av-c',
    title: "Moving from Microvellum to Cabinet Vision — what's the real learning curve for estimators?",
    meta: 'CNC & Software · by MariaLopez · 5 hours ago',
    replies: 27,
    views: 388,
  },
  {
    avatar: 'JP',
    avatarColor: 'av-d',
    title: 'Estimating labor hours for custom millwork on a large commercial hotel fit-out — methodology?',
    meta: 'Business & Estimating · by JakeParsons · 7 hours ago',
    replies: 19,
    views: 290,
  },
  {
    avatar: 'DW',
    avatarColor: 'av-e',
    title: 'Anyone using RFID for shop floor tracking of cabinet carcasses through production? Worth it?',
    meta: 'Shop Management · by DaveWilson · 9 hours ago',
    replies: 15,
    views: 201,
  },
  {
    avatar: 'KR',
    avatarColor: 'av-g',
    title: 'PUR vs. EVA edge banding adhesive on high-humidity kitchen applications — performance data?',
    meta: 'Cabinet Making · by KarenReid · 11 hours ago',
    replies: 22,
    views: 344,
  },
];

export const WIKI_CATEGORIES = [
  {
    icon: '📐',
    title: 'Joinery & Construction',
    desc: 'Box construction, joinery methods, face frame vs. frameless, structural specs.',
    count: '482 articles',
  },
  {
    icon: '🌲',
    title: 'Wood Species Guide',
    desc: 'Profiles for 200+ hardwood and softwood species — working properties, grain, uses.',
    count: '214 species profiles',
  },
  {
    icon: '🎨',
    title: 'Finishing Techniques',
    desc: 'Lacquers, conversion varnish, UV, powder coat, staining, and prep guides.',
    count: '317 articles',
  },
  {
    icon: '⚙️',
    title: 'Machine Operation',
    desc: 'CNC, edge banders, panel saws, widebelt sanders — setup, operation, maintenance.',
    count: '529 articles',
  },
  {
    icon: '📏',
    title: 'Standards & Codes',
    desc: 'KCMA, AWS, AWI quality grades, CARB, OSHA — summarized for shop use.',
    count: '143 articles',
  },
  {
    icon: '💼',
    title: 'Business & Estimating',
    desc: 'Pricing templates, labor rate calculators, contracts, and shop management guides.',
    count: '98 templates',
  },
];

export const JOB_LISTINGS = [
  {
    title: 'Lead Cabinet Maker',
    company: 'Heritage Millwork Co.  ·  Denver, CO',
    tags: [{ label: 'Full-time', kind: 'default' }, { label: '$58K–$75K', kind: 'green' }],
  },
  {
    title: 'CNC Programmer / Operator',
    company: 'Precision Panel Works  ·  Portland, OR',
    tags: [{ label: 'Full-time', kind: 'default' }, { label: '$65K–$85K', kind: 'green' }],
  },
  {
    title: 'Architectural Millwork Estimator',
    company: 'Signature Interiors  ·  Dallas, TX',
    tags: [{ label: 'Full-time', kind: 'default' }, { label: '$70K–$90K', kind: 'green' }],
  },
  {
    title: 'Finishing Supervisor',
    company: 'Alpine Cabinet Group  ·  Salt Lake City, UT',
    tags: [{ label: 'Full-time', kind: 'default' }, { label: '$55K–$68K', kind: 'green' }],
  },
  {
    title: 'Shop Foreman — Custom Millwork',
    company: 'Craftline Woodworks  ·  Nashville, TN',
    tags: [{ label: 'Full-time', kind: 'default' }, { label: '$62K–$78K', kind: 'green' }],
  },
];

export const MACHINERY_LISTINGS = [
  {
    thumb: '🔧',
    title: 'SCM Olimpic K 230 Edge Bander',
    price: '$8,400',
    loc: 'Atlanta, GA  ·  2018  ·  Excellent',
  },
  {
    thumb: '⚙️',
    title: 'Thermwood 5-Axis CNC Router 60×120',
    price: '$42,000',
    loc: 'Chicago, IL  ·  2020  ·  Very Good',
  },
  {
    thumb: '🪚',
    title: 'Altendorf F45 Sliding Table Saw',
    price: '$5,800',
    loc: 'Phoenix, AZ  ·  2016  ·  Good',
  },
  {
    thumb: '🏭',
    title: 'Biesse Rover A FT CNC Machining Center',
    price: '$68,500',
    loc: 'Seattle, WA  ·  2019  ·  Excellent',
  },
];

export const SUPPLIER_LINKS = [
  { icon: '🔩', label: 'Hardware & Fasteners' },
  { icon: '🪵', label: 'Sheet Goods & Plywood' },
  { icon: '🎨', label: 'Coatings & Finishes' },
  { icon: '📦', label: 'Drawer & Hinge Systems' },
  { icon: '🔧', label: 'CNC Tooling & Bits' },
  { icon: '📐', label: 'Architectural Moulding' },
];
