/**
 * Individual supplier profile page data.
 * Example: Julius Blum GmbH
 */

export const BREADCRUMB = [
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Hardware & Hinges', href: '/suppliers' },
  { label: 'Julius Blum GmbH', current: true },
];

export const SUPPLIER_HERO = {
  logo: 'Bl',
  badges: [
    { label: '⭐ Platinum Sponsor', class: 'hb-gold' },
    { label: '✓ Verified', class: 'hb-green' },
    { label: 'Manufacturer', class: 'hb-muted' },
    { label: 'Ships Worldwide', class: 'hb-muted' },
  ],
  name: 'Julius Blum GmbH',
  description: "The world's leading manufacturer of functional cabinet hardware — hinges, drawer systems, and lift systems for the professional trade. Founded 1952, Höchst, Austria.",
  rating: '4.9',
  stars: '★★★★★',
  reviews: '1,284 reviews',
  forumMentions: '💬 892 forum mentions',
  location: '📍 Stanley, NC (US)',
  website: '🌐 blum.com',
};

export const HERO_TABS = [
  'Overview',
  'Reviews (1,284)',
  'Forum Mentions (892)',
  'Downloads',
  'Find a Rep',
];

export const ABOUT = {
  paragraphs: [
    "Founded in 1952 in Höchst, Vorarlberg, Austria, Julius Blum GmbH is the world's leading manufacturer of functional cabinet hardware. The company began as a die-casting business and pivoted to cabinet hardware in the 1950s, recognizing the growing demand for precision hinge systems in postwar European furniture production.",
    "Today Blum employs over 9,000 people worldwide, manufactures from seven plants in Austria and one in the United States, and distributes to more than 120 countries. Their CLIP top hinge system is the most widely specified concealed hinge in the world. In North America, Blum operates from Stanley, NC with regional reps, certified trainers, and dedicated technical support serving the custom cabinet, semi-custom, and production markets.",
  ],
  details: [
    { label: 'Founded', value: '1952 · Höchst, Austria' },
    { label: 'US Headquarters', value: 'Stanley, NC · ISO 9001 · KCMA' },
    { label: 'Website', value: 'blum.com · 1-800-438-6788', link: true },
  ],
};

export const PRODUCT_CATEGORIES = [
  { icon: '🔩', name: 'Hinges & Clips' },
  { icon: '📦', name: 'Drawer Systems' },
  { icon: '⬆️', name: 'Lift Systems' },
  { icon: '⚡', name: 'Electronic Opening' },
  { icon: '🚪', name: 'Pocket Door Systems' },
  { icon: '🔧', name: 'Cabinet Accessories' },
];

export const RATING_BREAKDOWN = {
  average: '4.9',
  stars: '★★★★★',
  count: '1,284',
  distribution: [
    { star: '5★', percent: 88 },
    { star: '4★', percent: 9 },
    { star: '3★', percent: 2 },
    { star: '2★', percent: 1 },
    { star: '1★', percent: 0 },
  ],
  categories: [
    { label: 'Product Quality', score: '4.9', stars: '★★★★★' },
    { label: 'Tech Support', score: '4.8', stars: '★★★★★' },
    { label: 'Availability', score: '4.7', stars: '★★★★★' },
    { label: 'Value', score: '4.6', stars: '★★★★☆' },
  ],
};

export const SAMPLE_REVIEWS = [
  {
    av: 'TK',
    name: 'TomKowalski',
    role: 'Custom Cabinet Maker · Denver, CO · Verified buyer · 2,316 posts',
    stars: '★★★★★',
    date: 'March 2025',
    tag: 'CLIP top BLUMOTION',
    body: "We've been spec'ing Blum exclusively for five years. The CLIP top BLUMOTION is the hinge I'd choose for every job — the ±2mm side adjustment has saved us on countless out-of-square installations in old houses. When we had a batch issue, customer service replaced the whole box immediately, no questions.",
    helpful: '32 members found this helpful',
  },
  {
    av: 'DL',
    name: 'DianeLachapelle',
    role: 'Architectural Millwork · Montreal, QC · Verified buyer · 5,041 posts',
    stars: '★★★★★',
    date: 'February 2025',
    tag: 'LEGRABOX pure',
    body: "The LEGRABOX is what I spec on every high-end residential project. The movement quality is exceptional — clients notice it even when they don't know what they're looking at. Soft-close is whisper-quiet after years of daily use on demo units. Only gripe is 600mm orion grey lead times running 2–3 weeks.",
    helpful: '18 members found this helpful',
  },
  {
    av: 'MB',
    name: 'MikeBrosnan',
    role: 'Shop Owner · Portland, OR · Verified buyer · 11,204 posts',
    stars: '★★★★☆',
    date: 'January 2025',
    tag: 'AVENTOS HK-S',
    body: "Great product once you understand power range calibration — took our shop two or three installs to consistently nail the door weight matching. Tech support always picks up and gives real answers. Installation videos are excellent. Docking one star for the learning curve, not the product itself.",
    helpful: '24 members found this helpful',
  },
];

export const CONTACT_INFO = {
  website: 'blum.com',
  phone: '1-800-438-6788',
  email: 'info.us@blum.com',
  address: '7733 Old Plank Rd, Stanley, NC',
  hours: 'Mon–Fri 8am–5pm ET',
};

export const SALES_REPS = [
  { av: 'WR', name: 'Wade Roper', region: 'Pacific Northwest' },
  { av: 'LS', name: 'Linda Sanchez', region: 'Southwest US' },
  { av: 'BT', name: 'Brian Thatcher', region: 'Midwest US' },
  { av: 'JF', name: 'Janet Flynn', region: 'Northeast US' },
];

export const RELATED_ARTICLES = [
  'European Hinge Adjustment Guide',
  'Frameless Cabinet Construction',
  'Undermount Drawer Slide Comparison',
  'AVENTOS Lift System Selection',
  'The 32mm System Explained',
];

export const SIMILAR_SUPPLIERS = [
  { logo: 'He', name: 'Hettich America', category: 'Hinges · Drawer Systems', rating: '★ 4.8' },
  { logo: 'Gr', name: 'Grass America', category: 'Hinges · Runners', rating: '★ 4.7' },
  { logo: 'Sa', name: 'Salice America', category: 'Hinges · Drawer', rating: '★ 4.7' },
  { logo: 'HR', name: 'Hardware Resources', category: 'Distributor', rating: '★ 4.6' },
];

export const DOWNLOADS = [
  { icon: '📄', name: 'CLIP top BLUMOTION — Full Technical Catalog 2024', meta: 'PDF · 48 pages · 12.4 MB' },
  { icon: '📄', name: 'LEGRABOX pure — Technical Reference & Spec Sheet', meta: 'PDF · 24 pages · 6.8 MB' },
  { icon: '📄', name: 'AVENTOS — Complete Product Range Brochure', meta: 'PDF · 36 pages · 9.2 MB' },
  { icon: '📦', name: 'Cabinet Vision Parts Library — Blum Hardware 2024', meta: 'ZIP · .cv3 component files · 4.1 MB' },
  { icon: '📦', name: 'Microvellum Parts Library — Blum 2024', meta: 'ZIP · Component files · 3.6 MB' },
  { icon: '🎬', name: 'CLIP top Installation & Adjustment — Video Training Series', meta: '6 episodes · YouTube' },
];
