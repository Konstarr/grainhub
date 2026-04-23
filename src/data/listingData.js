/**
 * Individual listing page data.
 * Featured machine: Biesse Rover A FT 1536 CNC
 */

export const BREADCRUMB = [
  { label: 'Marketplace', href: '#' },
  { label: 'Machinery & Equipment', href: '#' },
  { label: 'CNC Routers', href: '#' },
  { label: 'Biesse Rover A FT 1536 — 5-Axis', current: true },
];

export const LISTING_HEADER = {
  categories: ['CNC Router', '5-Axis', 'Full Nesting'],
  id: 'Listing #GH-4821',
  views: '👁 1,284 views',
  saves: '📥 47 saves',
  title: 'Biesse Rover A FT 1536 CNC Machining Center — 5-Axis, Full Nesting Configuration, 2021',
  meta: [
    { icon: '📅', text: 'Listed April 18, 2025' },
    { icon: '📍', text: 'Seattle, WA' },
    { icon: '🚚', text: 'Delivery negotiable within Pacific Northwest' },
    { icon: '⏰', text: '⏰ Priced to move — motivated seller', highlight: true },
  ],
};

export const SPECS = [
  { label: 'Manufacturer', value: 'Biesse Group' },
  { label: 'Model', value: 'Rover A FT 1536' },
  { label: 'Year', value: '2021' },
  { label: 'Condition', value: 'Excellent', color: 'good' },
  { label: 'Configuration', value: '5-Axis with ATC' },
  { label: 'Table Size', value: '5′ × 12′ (1,530 × 3,660mm)' },
  { label: 'Table Type', value: 'Pod & Rail with Twin Spoilboard Vacuum' },
  { label: 'Spindle', value: 'HSD 11kW, 24,000 RPM' },
  { label: 'Tool Changer', value: '24-position ATC carousel' },
  { label: 'Control System', value: 'Biesse BSolid 2021' },
  { label: 'Operating Hours', value: '2,840 hours', color: 'warn' },
  { label: 'Dust Extraction', value: 'Integrated port — external unit required' },
  { label: 'Power Requirements', value: '3-Phase 460V, 60A' },
  { label: 'Machine Footprint', value: '24′ × 14′ (including servicing clearance)' },
  { label: 'Weight', value: '8,400 lbs / 3,810 kg' },
  { label: 'Last Service', value: 'February 2025 (Biesse certified)', color: 'good' },
];

export const DESCRIPTION = {
  paragraphs: [
    "We're selling this machine due to shop consolidation — we're merging two facilities and our larger Biesse at the other location makes this one redundant. This is not a distressed sale; the machine is in excellent working condition and has been professionally maintained throughout our ownership.",
    'The Rover A FT was our primary nesting machine for cabinet carcasses and flat-panel work. It\'s configured for nested-based manufacturing with:',
  ],
  bullets: [
    'Full BSolid 2021 software license (transferable with manufacturer approval)',
    'Optimized pod set for standard frameless cabinet dimensions',
    'Complete 24-tool library with carbide tooling — bits included in sale price',
    'Twin-zone vacuum spoilboard — holds 4×8 panels rock solid',
    'Drill block for line boring (32mm system, 7+7 vertical, 4 horizontal)',
  ],
  closing: [
    'Service records are complete and available for review. Biesse performed the most recent PM in February 2025 — all wear parts replaced, spindle tested and certified. We have every service record since delivery in April 2021.',
    'A Biesse-certified service technician is available to assist the buyer with commissioning at the new location (travel within the Pacific Northwest included in our offer; outside the region at buyer\'s cost). We can also arrange operator training for your team.',
    'Serious inquiries only. We can accommodate inspections at our facility in Seattle Monday–Friday with 48 hours notice. Machine is currently running production — you can see it operate.',
  ],
};

export const CONDITION_ITEMS = [
  {
    icon: '⚙️',
    label: 'Spindle & Heads',
    description: 'HSD spindle tested and certified February 2025. No runout, full RPM range verified. All ATC positions functional.',
    status: 'Excellent',
    statusClass: 'cs-excellent',
  },
  {
    icon: '🛤️',
    label: 'Linear Rails & Drive System',
    description: 'X, Y, Z rails inspected and lubricated. Servo drives calibrated. No backlash detected. Rack and pinion in good condition.',
    status: 'Excellent',
    statusClass: 'cs-excellent',
  },
  {
    icon: '🔲',
    label: 'Vacuum Table & Pods',
    description: 'Twin-zone vacuum holding strong at spec pressure. Pod set complete — minor wear on rubber tips but fully functional. Spare tips included.',
    status: 'Excellent',
    statusClass: 'cs-excellent',
  },
  {
    icon: '💻',
    label: 'Control & Software',
    description: 'BSolid 2021 fully licensed. All programs and post-processors intact. Touchscreen monitor shows minor scuffing from daily use — functional.',
    status: 'Good',
    statusClass: 'cs-good',
  },
  {
    icon: '🏠',
    label: 'Machine Body & Enclosure',
    description: 'Steel body in good condition. Minor paint chips on the base from normal shop use. No structural damage. Safety enclosures fully intact.',
    status: 'Good',
    statusClass: 'cs-good',
  },
];

export const SELLER = {
  avatar: 'PW',
  name: 'Precision Woodcraft LLC',
  badges: [
    { label: '✓ GrainHub Verified', class: 'sb-verified' },
    { label: '🏭 Shop Account', class: 'sb-shop' },
  ],
  location: '📍 Seattle, WA · Member since 2022',
  stats: [
    { num: '⭐ 4.9', label: 'Seller rating' },
    { num: '12', label: 'Items sold' },
    { num: '98%', label: 'Response rate' },
    { num: '<4h', label: 'Avg. response time' },
  ],
};

export const PRICE_INFO = {
  main: '$68,500',
  note: 'OBO · Seller open to reasonable offers',
  financing: '💰 Financing available — seller will consider 50% down with 12-month terms for qualified buyers',
  checks: [
    '✓ GrainHub Verified Seller',
    '✓ Inspection encouraged — machine currently running',
    '✓ Full service records available',
    '✓ Seller responds within 4 hours avg.',
  ],
};

export const QUICK_DETAILS = [
  { label: 'Category', value: 'CNC Router · 5-Axis' },
  { label: 'Year', value: '2021' },
  { label: 'Condition', value: 'Excellent', color: 'green' },
  { label: 'Hours', value: '2,840 hrs' },
  { label: 'Location', value: 'Seattle, WA' },
  { label: 'Shipping', value: 'Buyer arranges' },
  { label: 'Delivery', value: 'Negotiable in PNW' },
  { label: 'Listed', value: 'April 18, 2025' },
  { label: 'Listing ID', value: '#GH-4821' },
];

export const SAFETY_TIPS = [
  '✓ Always inspect before purchase or send a trusted representative',
  '✓ Request full service records and verify serial numbers',
  '✓ Never wire money before seeing the machine in person',
  '✓ GrainHub Verified sellers have confirmed business identity',
];

export const SIMILAR_LISTINGS = [
  {
    title: 'Thermwood Model 53 5-Axis — 60"×120"',
    price: '$42,000',
    location: '📍 Chicago, IL · 2019',
    category: 'CNC Router',
    emoji: '🖥️',
    imgStyle: { background: 'linear-gradient(135deg,#1A1828,#3A3870)' },
  },
  {
    title: 'MultiCam 3000 Series — 4×8, 12-Tool ATC',
    price: '$31,500',
    location: '📍 Dallas, TX · 2022',
    category: 'CNC Router',
    emoji: '🖥️',
    imgStyle: { background: 'linear-gradient(135deg,#0A1020,#1A3050)' },
  },
  {
    title: 'Biesse Rover B FT 1532 — 4-Axis, 2019',
    price: '$48,000',
    location: '📍 Portland, OR · 2019',
    category: 'CNC Router',
    emoji: '🖥️',
    imgStyle: { background: 'linear-gradient(135deg,#1A2840,#3A6898)' },
  },
];
