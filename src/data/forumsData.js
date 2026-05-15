/**
 * Content for the Forums (index) page.
 * Forum categories organized by group with statistics.
 */

export const FORUMS_PAGE_HEADER = {
  eyebrow: 'AWI Florida Chapter',
  title: 'Chapter Forums',
  subtitle: 'Discussion for Florida architectural woodwork professionals — by topic and by region. Talk shop, find local vendors, share install war stories, and connect with chapter members across the state.',
  stats: [
    { num: '—', label: 'Total posts' },
    { num: '—', label: 'Threads' },
    { num: '—', label: 'Members' },
    { num: '—', label: 'Online now' },
  ],
};

export const TOOLBAR_TABS = [
  'All Forums',
  '🔥 Hot Today',
  '✨ New Posts',
  '❓ Unanswered',
  '✓ Solved',
  '🔖 My Subscriptions',
  '👤 My Posts',
];

export const ONLINE_MEMBERS = {
  count: 312,
  avatars: [
    { initials: 'TK', color: 'av-a' },
    { initials: 'DL', color: 'av-b' },
    { initials: 'MB', color: 'av-c' },
    { initials: 'SR', color: 'av-d' },
    { initials: 'JP', color: 'av-e' },
    { initials: 'KR', color: 'av-g' },
    { initials: 'WF', color: 'av-h' },
  ],
  names: 'TomKowalski, DianeLachapelle, MikeBrosnan, SaraRomero, JakeParsons, KarenReid',
  moreCount: 306,
};

export const HOT_TOPICS = [
  'Frameless on out-of-square walls',
  'PUR vs EVA edge banding',
  'Cabinet Vision vs Microvellum 2025',
  'CARB Phase 3 compliance',
  'White oak pricing dropping?',
  'Blum LEGRABOX vs Grass Zargen',
  'IWF Atlanta must-see exhibits',
];

export const FORUM_GROUPS = [
  {
    id: 'shop',
    icon: '🛠',
    iconColor: 'green',
    name: 'Shop Floor',
    description: 'Day-to-day production, bench talk, and shop management for Florida shops.',
    categories: [
      { id: 'shop-general',     icon: '💬', iconColor: 'green', name: 'General shop talk',     description: 'Anything that doesn\'t fit elsewhere.' },
      { id: 'shop-production',  icon: '⚙',       iconColor: 'green', name: 'Production & flow',    description: 'Nested-base, batch cutting, scheduling, throughput.' },
      { id: 'shop-equipment',   icon: '🔧', iconColor: 'green', name: 'Equipment & machinery',description: 'CNC, edge banders, beam saws, dust collection.' },
      { id: 'shop-finishing',   icon: '🎨', iconColor: 'green', name: 'Finishing & spray booth', description: 'CV, waterborne, FL VOC compliance.' },
      { id: 'shop-hiring',      icon: '👥', iconColor: 'green', name: 'Hiring & crews',       description: 'Apprentices, retention, WCA, FL trade schools.' },
    ],
  },
  {
    id: 'estimating',
    icon: '📊',
    iconColor: 'green',
    name: 'Estimating & Bidding',
    description: 'Takeoffs, proposals, change orders, and pricing custom work in the FL market.',
    categories: [
      { id: 'est-takeoffs',     icon: '📏', iconColor: 'green', name: 'Takeoffs & quantities', description: 'Reading drawings, RFIs, scope.' },
      { id: 'est-pricing',      icon: '💰', iconColor: 'green', name: 'Pricing & labor rates', description: 'FL labor markets, hourly rates, margins.' },
      { id: 'est-bids',         icon: '📝', iconColor: 'green', name: 'Bids & proposals',     description: 'Bid documents, qualifications, alternates.' },
      { id: 'est-change-orders',icon: '✏',       iconColor: 'green', name: 'Change orders',        description: 'Documenting, pricing, getting paid.' },
      { id: 'est-software',     icon: '💻', iconColor: 'green', name: 'Estimating software',  description: 'Cabinet Vision, Microvellum, KCDw, Mozaik.' },
    ],
  },
  {
    id: 'field',
    icon: '🚧',
    iconColor: 'brown',
    name: 'Field & Install',
    description: 'Site coordination, scribing, punch lists, and install crews on FL projects.',
    categories: [
      { id: 'field-coordination', icon: '📍', iconColor: 'brown', name: 'Site coordination', description: 'GC handoffs, sequencing, lifts, deliveries.' },
      { id: 'field-scribing',     icon: '✂',       iconColor: 'brown', name: 'Scribing & field fitting', description: 'Tight tolerances on built-up walls.' },
      { id: 'field-millwork',     icon: '🏛', iconColor: 'brown', name: 'Millwork installs',  description: 'Casework, paneling, ceilings, reception desks.' },
      { id: 'field-punch',        icon: '✅',       iconColor: 'brown', name: 'Punch list & closeout', description: 'Closeout docs, attic stock, warranties.' },
    ],
  },
  {
    id: 'code',
    icon: '⚖',
    iconColor: 'red',
    name: 'Code & Compliance',
    description: 'Florida Building Code, hurricane impact requirements, fire ratings, TSCA Title VI.',
    categories: [
      { id: 'code-fbc',    icon: '📖', iconColor: 'red', name: 'Florida Building Code', description: 'Current FBC edition, local jurisdictions.' },
      { id: 'code-impact', icon: '🌪', iconColor: 'red', name: 'Impact / hurricane glazing', description: 'Coordinating with door/window subs in coastal counties.' },
      { id: 'code-fire',   icon: '🔥', iconColor: 'red', name: 'Fire ratings & assemblies', description: '20/45/90-min ratings on wood doors and assemblies.' },
      { id: 'code-tsca',   icon: '⚗',       iconColor: 'red', name: 'TSCA / formaldehyde', description: 'TSCA Title VI, CARB-2, supplier documentation.' },
      { id: 'code-osha',   icon: '⚠',       iconColor: 'red', name: 'OSHA & shop safety', description: 'Dust, lockout/tagout, EPA RRP for finishers.' },
    ],
  },
  {
    id: 'standards',
    icon: '🏆',
    iconColor: 'green',
    name: 'AWS / QCP',
    description: 'Architectural Woodwork Standards, QCP certification, and AWI national programs.',
    categories: [
      { id: 'std-aws',          icon: '📘', iconColor: 'green', name: 'AWS standards',        description: 'Custom vs. Premium grade, joinery, tolerances.' },
      { id: 'std-qcp',          icon: '✅',       iconColor: 'green', name: 'QCP certification',    description: 'Licensure, inspections, AWI Florida QCP support.' },
      { id: 'std-submittals',   icon: '📋', iconColor: 'green', name: 'Shop drawings & submittals', description: 'Tabbing, cut sheets, what GCs actually look for.' },
      { id: 'std-awi-programs', icon: '🎓', iconColor: 'green', name: 'AWI national programs', description: 'CMP, AWI conferences, scholarships, education.' },
    ],
  },
  {
    id: 'industry',
    icon: '📦',
    iconColor: 'blue',
    name: 'Industry Talk',
    description: 'Hardware, materials, software, finishes, and industry news relevant to FL members.',
    categories: [
      { id: 'ind-hardware',  icon: '🔩', iconColor: 'blue', name: 'Hardware',             description: 'Blum, Hettich, Salice, Grass, Hafele — sourcing in FL.' },
      { id: 'ind-materials', icon: '🌲', iconColor: 'blue', name: 'Materials & lumber',  description: 'FL hardwood sourcing, plywood, MDF, HPL.' },
      { id: 'ind-software',  icon: '💻', iconColor: 'blue', name: 'Design & CNC software', description: 'Cabinet Vision, Microvellum, KCDw, Mozaik.' },
      { id: 'ind-news',      icon: '📰', iconColor: 'blue', name: 'Industry news',        description: 'AWI national news, FL construction market.' },
    ],
  },
  {
    id: 'regional',
    icon: '📍',
    iconColor: 'amber',
    name: 'Regional Meet-ups',
    description: 'In-person and regional discussion for your part of Florida. Local vendor recommendations, regional shop talk, and meet-up coordination.',
    categories: [
      { id: 'region-south-fl',       icon: '🌴', iconColor: 'amber', name: 'South Florida',        description: 'Miami-Dade, Broward, Palm Beach, Monroe.' },
      { id: 'region-treasure-coast', icon: '🌊', iconColor: 'amber', name: 'Treasure Coast',       description: 'Martin, St. Lucie, Indian River, Okeechobee.' },
      { id: 'region-central-fl',     icon: '🎢', iconColor: 'amber', name: 'Central Florida',      description: 'Orlando, Volusia, Brevard, Lake, Polk, Seminole.' },
      { id: 'region-tampa-bay',      icon: '⛵',       iconColor: 'amber', name: 'Tampa Bay',            description: 'Hillsborough, Pinellas, Pasco, Manatee, Sarasota.' },
      { id: 'region-southwest-fl',   icon: '🐟', iconColor: 'amber', name: 'Southwest Florida',    description: 'Lee, Collier, Charlotte, Hendry.' },
      { id: 'region-north-fl',       icon: '⚓',       iconColor: 'amber', name: 'North Florida / Jax', description: 'Duval, Clay, St. Johns, Nassau, Alachua.' },
      { id: 'region-panhandle',      icon: '🏖', iconColor: 'amber', name: 'Panhandle',            description: 'Escambia, Santa Rosa, Okaloosa, Bay, Leon, west of Tallahassee.' },
    ],
  },
];

export const RECENT_ACTIVITY_ITEMS = [
  {
    id: 1,
    avatar: 'TK',
    avatarColor: 'av-a',
    title: 'Best approach for full-overlay frameless on an out-of-square opening? Photos inside',
    category: 'Cabinet Making',
    categoryBg: '#EDE0C4',
    categoryText: '#4B5563',
    author: 'TomKowalski',
    time: '2 hours ago',
    replies: 48,
    views: 621,
    badges: [
      { label: '🔥 Hot', className: 'tb-hot' },
      { label: '✓ Solved', className: 'tb-solved' },
    ],
    isUnread: true,
  },
  {
    id: 2,
    avatar: 'SR',
    avatarColor: 'av-d',
    title: 'Cabinet Vision to Biesse BSolid post-processor — losing datum on arc cuts',
    category: 'CNC & Machining',
    categoryBg: '#E6F1FB',
    categoryText: '#185FA5',
    author: 'SaraRomero',
    time: '1 hour ago',
    replies: 12,
    views: 184,
    badges: [
      { label: '🟢 New', className: 'tb-new' },
    ],
    isUnread: true,
  },
  {
    id: 3,
    avatar: 'MB',
    avatarColor: 'av-c',
    title: 'Blum LEGRABOX vs Grass Zargen at the high end — side-by-side after 2 years in the field',
    category: 'Hardware',
    categoryBg: '#FCEBEB',
    categoryText: '#A32D2D',
    author: 'MikeBrosnan',
    time: '3 hours ago',
    replies: 31,
    views: 498,
    badges: [
      { label: '🔥 Hot', className: 'tb-hot' },
      { label: '⭐ Featured', className: 'tb-featured' },
    ],
    isUnread: true,
  },
  {
    id: 4,
    avatar: 'DL',
    avatarColor: 'av-b',
    title: 'AWI Premium grade: scribe vs butt joint on running trim at inside corners — what\'s the standard?',
    category: 'Architectural Millwork',
    categoryBg: '#EAF3DE',
    categoryText: '#1B4332',
    author: 'DianeLachapelle',
    time: '4 hours ago',
    replies: 19,
    views: 284,
    badges: [
      { label: '✓ Solved', className: 'tb-solved' },
    ],
    isUnread: false,
  },
  {
    id: 5,
    avatar: 'JP',
    avatarColor: 'av-e',
    title: 'Estimating labor hours for custom millwork on a commercial hotel fit-out — anyone share their methodology?',
    category: 'Estimating',
    categoryBg: '#FFF3DC',
    categoryText: '#8B5E08',
    author: 'JakeParsons',
    time: '7 hours ago',
    replies: 19,
    views: 290,
    badges: [
      { label: '🔥 Hot', className: 'tb-hot' },
    ],
    isUnread: false,
  },
  {
    id: 6,
    avatar: 'KR',
    avatarColor: 'av-g',
    title: 'PUR vs EVA edge banding adhesive on high-humidity kitchen applications — real performance data?',
    category: 'Cabinet Making',
    categoryBg: '#EDE0C4',
    categoryText: '#4B5563',
    author: 'KarenReid',
    time: '11 hours ago',
    replies: 22,
    views: 344,
    badges: [
      { label: '✓ Solved', className: 'tb-solved' },
    ],
    isUnread: false,
  },
];

export const TOP_CONTRIBUTORS = [
  { rank: 1, initials: 'MB', avatarColor: 'av-c', name: 'MikeBrosnan', meta: 'Shop Owner · 28 yrs', points: '9,870 pts' },
  { rank: 2, initials: 'DL', avatarColor: 'av-b', name: 'DianeLachapelle', meta: 'Architectural Millwork', points: '4,210 pts' },
  { rank: 3, initials: 'SR', avatarColor: 'av-d', name: 'SaraRomero', meta: 'CNC Specialist', points: '2,140 pts' },
  { rank: 4, initials: 'TK', avatarColor: 'av-a', name: 'TomKowalski', meta: 'Custom Cabinet Maker', points: '1,842 pts' },
  { rank: 5, initials: 'JP', avatarColor: 'av-e', name: 'JakeParsons', meta: 'Millwork Estimator', points: '980 pts' },
];

export const FORUM_STATS = [
  { label: 'Total posts', value: '142,000' },
  { label: 'Total threads', value: '28,400' },
  { label: 'Members', value: '24,800' },
  { label: 'Online now', value: '312', isBold: true },
  { label: 'Posts today', value: '284' },
  { label: 'Newest member', value: 'NateMcCoy', isHighlight: true },
];

export const FORUM_GUIDELINES = [
  'Be specific — include measurements, materials, and photos when possible',
  'Search before posting — your question may already be answered',
  'Mark your thread solved when your question is answered',
  'No spam, solicitation, or competitor bashing',
  'Respect all skill levels — everyone was a beginner once',
];

export const THREAD_LEGEND = [
  { dot: '#2D6A4F', label: 'New posts since last visit' },
  { dot: '#A32D2D', label: '🔥 Hot — 20+ replies today' },
  { dot: '#1B4332', label: '✓ Solved — best answer marked' },
  { dot: '#8B5E08', label: '📌 Pinned by moderator' },
  { dot: '#5F3091', label: '⭐ Featured by editors' },
];
