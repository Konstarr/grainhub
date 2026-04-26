/**
 * Content for the Wiki index page.
 */

export const WIKI_HERO_STATS = [
  { num: '3,600', label: 'Articles published' },
  { num: '142', label: 'Active contributors' },
  { num: '18K', label: 'Monthly readers' },
  { num: '634', label: 'Edits this month' },
];

export const WIKI_CATEGORY_TABS = [
  { icon: '📚', label: 'All Articles', count: '3,600', id: 'all' },
  { icon: '📐', label: 'Joinery & Construction', count: '482', id: 'construction' },
  { icon: '🌲', label: 'Wood Species', count: '214', id: 'species' },
  { icon: '🎨', label: 'Finishing', count: '317', id: 'finishing' },
  { icon: '⚙️', label: 'Machines', count: '529', id: 'machines' },
  { icon: '📏', label: 'Standards & Codes', count: '143', id: 'standards' },
  { icon: '💼', label: 'Business & Templates', count: '98', id: 'business' },
  { icon: '🔩', label: 'Hardware', count: '186', id: 'hardware' },
  { icon: '🛡', label: 'Safety', count: '86', id: 'safety' },
];

export const FEATURED_ARTICLE = {
  category: 'Joinery & Construction',
  title: 'Frameless Cabinet Construction — The Definitive Guide',
  excerpt: 'Everything about the European 32mm system — box structure, joinery methods, hardware, installation in out-of-square openings, finishing, and full AWI/KCMA standards coverage. The most-read article on Millwork.io.',
  rating: 4.8,
  ratingCount: 312,
  monthlyViews: '18,400',
  lastEdited: '2h ago',
};

export const RECENTLY_UPDATED_ARTICLES = [
  {
    category: 'Standards & Codes',
    title: 'KCMA A161.1 Performance Standard — 2025 Edition Summary',
    imgGradient: 'linear-gradient(135deg,#1A2E48,#2D4A78)',
    badge: { label: 'Updated', variant: 'new' },
    rating: 4.7,
    views: '5,200 views',
  },
  {
    category: 'Wood Species',
    title: 'White Oak — Species Profile, Working Properties & Finishing',
    imgGradient: 'linear-gradient(135deg,#1A3A10,#3A6A20)',
    badge: { label: 'Featured', variant: 'featured' },
    rating: 4.9,
    views: '12,800 views',
  },
  {
    category: 'Finishing',
    title: 'Water-Based Post-Cat Lacquer — Application Guide & Troubleshooting',
    imgGradient: 'linear-gradient(135deg,#2A1A48,#5A3A88)',
    badge: { label: 'Updated', variant: 'new' },
    rating: 4.8,
    views: '7,640 views',
  },
  {
    category: 'Machines',
    title: 'CNC Nesting Setup for Cabinet Production — Spoilboard & Toolpath Guide',
    imgGradient: 'linear-gradient(135deg,#3A2808,#7A5020)',
    badge: { label: 'New', variant: 'new' },
    rating: 4.6,
    views: '3,280 views',
  },
  {
    category: 'Hardware',
    title: 'European Hinge Adjustment Guide — Blum, Grass & Salice Side-by-Side',
    imgGradient: 'linear-gradient(135deg,#0A2A28,#1A5A58)',
    badge: { label: 'Featured', variant: 'featured' },
    rating: 4.9,
    views: '9,100 views',
  },
  {
    category: 'Business & Templates',
    title: 'Cabinet Shop Labor Rate Calculator — 2025 Methodology',
    imgGradient: 'linear-gradient(135deg,#1A1A1A,#4A4A4A)',
    badge: { label: 'Updated', variant: 'new' },
    rating: 4.7,
    views: '6,420 views',
  },
];

export const BROWSE_BY_CATEGORY = [
  {
    icon: '📐',
    name: 'Joinery & Construction',
    desc: 'Box building, joinery methods, face-frame vs. frameless, structural specs, installation techniques.',
    count: '482 articles',
    articles: [
      'Frameless Cabinet Construction',
      'Face Frame Construction',
      'Scribing & Fitting Techniques',
      'Cabinet Layout & Datum Setting',
    ],
    iconClass: 'cci-brown',
  },
  {
    icon: '🌲',
    name: 'Wood Species Guide',
    desc: 'Profiles for 214 hardwood and softwood species — working properties, grain, drying, availability, and uses.',
    count: '214 species profiles',
    articles: [
      'Hard Maple',
      'White Oak',
      'Black Walnut',
      'White Ash',
    ],
    iconClass: 'cci-green',
  },
  {
    icon: '🎨',
    name: 'Finishing & Coatings',
    desc: 'Catalyzed lacquers, conversion varnish, water-based, UV, staining, spray technique, and troubleshooting.',
    count: '317 articles',
    articles: [
      'Post-Cat Lacquer Application Guide',
      'Grain Raise Prevention on Maple',
      'MDF Door Finishing — Primer & Paint',
      'Troubleshooting Fish Eyes',
    ],
    iconClass: 'cci-purple',
  },
  {
    icon: '⚙️',
    name: 'Machine Operation',
    desc: 'CNC routers, edge banders, panel saws, widebelt sanders — setup, operation, calibration, and maintenance.',
    count: '529 articles',
    articles: [
      'CNC Nesting Setup Guide',
      'Edge Bander PUR Glue Setup',
      'Panel Saw Calibration',
      'Widebelt Sander Abrasive Selection',
    ],
    iconClass: 'cci-blue',
  },
  {
    icon: '📏',
    name: 'Standards & Codes',
    desc: 'KCMA, AWI, AWMAC, CARB, OSHA — standards summarized in plain language for shop use.',
    count: '143 articles',
    articles: [
      'KCMA A161.1 — 2025 Summary',
      'AWI Quality Grades Explained',
      'CARB Phase 2 & 3 Compliance',
      'OSHA Wood Dust Limits',
    ],
    iconClass: 'cci-red',
  },
  {
    icon: '🔩',
    name: 'Hardware & Accessories',
    desc: 'Hinges, drawer systems, lifts, pulls, slides — selection guides, installation, adjustments, and comparisons.',
    count: '186 articles',
    articles: [
      'European Hinge Adjustment Guide',
      'Blum vs Grass vs Salice Comparison',
      'Undermount Drawer Slide Selection',
      'The 32mm System Explained',
    ],
    iconClass: 'cci-amber',
  },
  {
    icon: '💼',
    name: 'Business & Estimating',
    desc: 'Labor rate calculators, pricing templates, sample contracts, shop management guides, and estimating methodology.',
    count: '98 templates & articles',
    articles: [
      'Shop Labor Rate Calculator',
      'Cabinet Pricing Template (Download)',
      'Sample Millwork Contract',
      'AWI Bid Spec Checklist',
    ],
    iconClass: 'cci-gray',
  },
  {
    icon: '🛡',
    name: 'Safety & Dust Control',
    desc: 'OSHA compliance, dust collection system design, respiratory protection, fire suppression, and safety programs.',
    count: '86 articles',
    articles: [
      'Wood Dust Exposure Limits — OSHA',
      'Dust Collection System Design',
      'Spray Booth Safety & Compliance',
      'Respirator Selection Guide',
    ],
    iconClass: 'cci-teal',
  },
];

export const WOOD_SPECIES_ITEMS = [
  { name: 'Hard Maple', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#F0E0B8,#DEB887)' },
  { name: 'White Oak', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#D4C090,#B89050)' },
  { name: 'Black Walnut', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#8B6355,#5C3520)' },
  { name: 'White Ash', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#E8D8A8,#C4A870)' },
  { name: 'Black Cherry', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#E0B888,#C09060)' },
  { name: 'Red Oak', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#E8D0A0,#C4A060)' },
  { name: 'Soft Maple', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#D0C898,#A8A060)' },
  { name: 'Poplar', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#E8E8D8,#C8C8A8)' },
  { name: 'Hickory', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#D8C0A0,#B89870)' },
  { name: 'Beech', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#E0D0C0,#BCA890)' },
  { name: 'Alder', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#C8D8B8,#A0B888)' },
  { name: 'Birch', type: 'Hardwood', swatchGradient: 'linear-gradient(135deg,#D0C0A0,#A89060)' },
];

export const RECENT_EDITS = [
  {
    title: 'Frameless Cabinet Construction',
    subtitle: 'Expanded installation sequence, added out-of-square steps',
    category: { label: 'Construction', bgColor: '#EDE0C4', textColor: '#6B3F1F' },
    editor: { initials: 'MB', name: 'MikeBrosnan', bgColor: '#5F3091' },
    time: '2 hours ago',
  },
  {
    title: 'KCMA A161.1 Performance Standard',
    subtitle: 'Updated to 2025 edition, added new load-cycle test table',
    category: { label: 'Standards', bgColor: '#E6F1FB', textColor: '#185FA5' },
    editor: { initials: 'DL', name: 'DianeLachapelle', bgColor: '#2D5016' },
    time: 'Yesterday',
  },
  {
    title: 'White Oak — Species Profile',
    subtitle: 'Added quartersawn section, updated pricing data',
    category: { label: 'Species', bgColor: '#EAF3DE', textColor: '#2D5016' },
    editor: { initials: 'SR', name: 'SaraRomero', bgColor: '#1565C0' },
    time: '3 days ago',
  },
  {
    title: 'CNC Nesting Setup Guide',
    subtitle: 'New article — spoilboard management and toolpath basics',
    category: { label: 'Machines', bgColor: '#FFF3DC', textColor: '#8B5E08' },
    editor: { initials: 'JP', name: 'JakeParsons', bgColor: '#B45309' },
    time: '4 days ago',
  },
  {
    title: 'Troubleshooting Fish Eyes in Lacquer',
    subtitle: 'Added section on silicone contamination sources',
    category: { label: 'Finishing', bgColor: '#F3EAFE', textColor: '#5F3091' },
    editor: { initials: 'KR', name: 'KarenReid', bgColor: '#A0522D' },
    time: '5 days ago',
  },
  {
    title: 'Shop Labor Rate Calculator',
    subtitle: 'Updated formula for 2025 burden rate benchmarks',
    category: { label: 'Business', bgColor: '#EDE0C4', textColor: '#6B3F1F' },
    editor: { initials: 'RG', name: 'RGarner', bgColor: '#0F6E56' },
    time: '1 week ago',
  },
];

export const POPULAR_ARTICLES = [
  { rank: 1, title: 'Frameless Cabinet Construction', meta: 'Construction · 18,400 views' },
  { rank: 2, title: 'European Hinge Adjustment Guide', meta: 'Hardware · 12,200 views' },
  { rank: 3, title: 'White Oak — Species Profile', meta: 'Species · 12,800 views' },
  { rank: 4, title: 'AWI Quality Grades Explained', meta: 'Standards · 8,600 views' },
  { rank: 5, title: 'Post-Cat Lacquer Application Guide', meta: 'Finishing · 7,640 views' },
  { rank: 6, title: 'The 32mm System Explained', meta: 'Hardware · 6,900 views' },
];

export const FEATURED_QUALITY = [
  { title: 'Frameless Cabinet Construction', badge: 'Featured' },
  { title: 'Hard Maple Species Profile', badge: 'Featured' },
  { title: 'European Hinge Adjustment Guide', badge: 'Featured' },
  { title: 'KCMA A161.1 — 2025 Summary', badge: 'Good' },
  { title: 'CNC Nesting Setup Guide', badge: 'Good' },
  { title: 'White Oak Species Profile', badge: 'Featured' },
];

export const TOP_CONTRIBUTORS = [
  { initials: 'MB', name: 'MikeBrosnan', edits: '84 edits this month', points: '9,870 pts', bgColor: '#5F3091' },
  { initials: 'DL', name: 'DianeLachapelle', edits: '52 edits this month', points: '4,210 pts', bgColor: '#2D5016' },
  { initials: 'SR', name: 'SaraRomero', edits: '38 edits this month', points: '2,140 pts', bgColor: '#1565C0' },
  { initials: 'JP', name: 'JakeParsons', edits: '24 edits this month', points: '980 pts', bgColor: '#B45309' },
  { initials: 'KR', name: 'KarenReid', edits: '19 edits this month', points: '842 pts', bgColor: '#A0522D' },
];
