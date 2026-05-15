/**
 * Content for the sponsor page.
 * Edit any of this and the page updates automatically.
 */

export const SPONSOR_HERO_STATS = [
  { num: '24,800', label: 'Active members' },
  { num: '312K', label: 'Monthly page views' },
  { num: '14,200', label: 'Newsletter subscribers' },
  { num: '68%', label: 'Are shop owners or managers' },
  { num: '$2.4M', label: 'Avg. annual shop revenue' },
];

export const CURRENT_SPONSORS = [
  '⭐ Blum Hardware',
  '⭐ Biesse America',
  '⭐ SCM Group',
  '⭐ Homag Group',
  '⭐ Sherwin-Williams Wood Care',
  'Lamello AG',
  'ML Campbell',
  'Hardware Resources',
];

export const AUDIENCE_STATS = [
  { num: '68%', label: 'Are shop owners or operations managers with direct purchasing authority' },
  { num: '$2.4M', label: 'Average annual revenue of member shops — not weekend hobbyists' },
  { num: '8.2×', label: 'Average monthly sessions per member — they come back every week' },
  { num: '94%', label: 'Say AWI Florida Chapter influences their purchasing and supplier decisions' },
];

export const DEMO_DATA = {
  title: 'Member Demographics',
  subtitle: 'Based on member survey · n = 4,200 responses',
  roles: [
    { label: 'Shop Owner / Principal', pct: 68 },
    { label: 'Production Manager / Foreman', pct: 14 },
    { label: 'Estimator / Project Manager', pct: 10 },
    { label: 'CNC Operator / Technician', pct: 5 },
    { label: 'Other Trade Professional', pct: 3 },
  ],
  specialties: [
    { label: 'Custom Cabinet Making', pct: 42 },
    { label: 'Architectural Millwork', pct: 28 },
    { label: 'Production Cabinet', pct: 18 },
    { label: 'Commercial Fixture / Casework', pct: 12 },
  ],
  tags: [
    '🇺🇸 US: 78%',
    '🇨🇦 Canada: 18%',
    'Other: 4%',
    'Desktop: 62%',
    'Mobile: 38%',
  ],
};

export const PRICING_PACKAGES = [
  {
    id: 'category',
    tier: 'Category Sponsor',
    name: 'Category Owner',
    price: '600',
    period: '/ month',
    desc: 'Own a single forum category or wiki topic area. Your brand appears wherever professionals research your product type.',
    features: [
      { text: 'Exclusive branding on 1 forum category', included: true },
      { text: 'Sidebar ad in every thread in that category', included: true },
      { text: 'Featured in related wiki articles', included: true },
      { text: 'Logo in category header', included: true },
      { text: 'Enhanced supplier directory listing', included: true },
      { text: 'Monthly impressions report', included: true },
      { text: 'Homepage placement', included: false },
      { text: 'Newsletter sponsorship', included: false },
      { text: 'Platinum badge', included: false },
    ],
    button: 'Get Started →',
    buttonVariant: 'outline',
  },
  {
    id: 'site',
    tier: 'Site Sponsor',
    name: 'Full Presence',
    price: '2,400',
    period: '/ month',
    desc: 'Sitewide visibility — your brand appears throughout AWI Florida Chapter wherever your target audience is active.',
    features: [
      { text: 'Homepage sponsor strip placement', included: true },
      { text: 'Featured sidebar ad — all pages', included: true },
      { text: '1 sponsored forum category of your choice', included: true },
      { text: 'Featured in 4 relevant wiki articles / month', included: true },
      { text: '1 newsletter sponsorship / month', included: true },
      { text: 'Premium supplier directory listing', included: true },
      { text: 'Verified badge + "Site Sponsor" designation', included: true },
      { text: 'Full analytics dashboard + monthly report', included: true },
      { text: 'Platinum badge & exclusive perks', included: false },
    ],
    button: 'Get Started →',
    buttonVariant: 'primary',
    featured: true,
  },
  {
    id: 'platinum',
    tier: 'Platinum Sponsor',
    name: 'Industry Partner',
    price: 'Custom',
    priceSmall: 'pricing',
    desc: 'The highest tier — exclusive branding, editorial partnership, and category ownership across the full platform.',
    features: [
      { text: 'Everything in Site Sponsor', included: true },
      { text: '⭐ Platinum badge — homepage top strip', included: true },
      { text: 'Up to 3 sponsored forum categories', included: true },
      { text: 'Featured supplier profile — editorial format', included: true },
      { text: 'Sponsored content article (1/month)', included: true },
      { text: 'Event sponsorship (AWI Florida Chapter Meetups)', included: true },
      { text: '"Presented by" on 1 wiki category', included: true },
      { text: 'Weekly analytics + dedicated account manager', included: true },
      { text: 'Co-branded webinar or training event', included: true },
    ],
    button: 'Talk to Our Team →',
    buttonVariant: 'dark',
  },
];

export const ALACARTE_OPTIONS = [
  {
    icon: '📰',
    iconBg: 'ac-icon-brown',
    title: 'Newsletter Sponsorship',
    desc: 'Top placement in The Weekly Bench — 14,200 subscribers, 48% open rate, sent every Tuesday morning. Your logo, headline, and CTA above the fold.',
    price: '800',
    period: '/ issue',
  },
  {
    icon: '💬',
    iconBg: 'ac-icon-blue',
    title: 'Forum Category Takeover',
    desc: 'Exclusive sponsorship of a single forum category for one month — sidebar ad in every thread, header branding, and "Presented by" label on all posts.',
    price: '600',
    period: '/ month',
  },
  {
    icon: '📖',
    iconBg: 'ac-icon-green',
    title: 'Wiki Article Sponsorship',
    desc: 'Right-rail ad placement inside a specific wiki article — contextually matched to your product category. Frameless construction article for hinge brands, finishing for coatings, etc.',
    price: '400',
    period: '/ month',
  },
  {
    icon: '🏠',
    iconBg: 'ac-icon-amber',
    title: 'Homepage Featured Ad',
    desc: 'Right-rail featured ad block on the AWI Florida Chapter homepage — above the job board, seen by every member on login. 180×320px, linked to your destination.',
    price: '1,200',
    period: '/ month',
  },
  {
    icon: '📅',
    iconBg: 'ac-icon-purple',
    title: 'Event Sponsorship',
    desc: 'Sponsor a AWI Florida Chapter community meetup in a city of your choice — logo on all event communications, 5-minute product demo slot, and branded drink tickets.',
    price: '800',
    period: '/ event',
  },
  {
    icon: '✍️',
    iconBg: 'ac-icon-teal',
    title: 'Sponsored Content Article',
    desc: 'A clearly-labeled sponsored editorial article in the News section — written by our team to your brief, linked from the homepage and newsletter. Indexed by Google.',
    price: '1,400',
    period: '/ article',
  },
];

export const TESTIMONIALS = [
  {
    stars: '★★★★★',
    quote:
      'We sponsored the Cabinet Making forum for three months. The leads were qualified in a way we don\'t see from any other channel — these people already know what LEGRABOX is, they\'re just choosing between us and Grass.',
    author: 'Marcus W., Regional Sales Director',
    role: 'Blum Hardware North America',
    initials: 'BL',
    bg: '#1A2E48',
  },
  {
    stars: '★★★★★',
    quote:
      'The newsletter sponsorship converted at 4x our typical industry email rates. These readers are engaged — they actually read it. We renewed for the full year after the first issue.',
    author: 'Jennifer R., Marketing Manager',
    role: 'SCM Group USA',
    initials: 'SC',
    bg: '#1A3A10',
  },
  {
    stars: '★★★★★',
    quote:
      'The wiki article sponsorship surprised us most. Our ad runs alongside the Frameless Cabinet Construction article — 18,400 views a month of people actively researching hinge systems. That\'s our exact buyer.',
    author: 'David K., VP of Marketing',
    role: 'Hettich America',
    initials: 'HT',
    bg: '#0A2A28',
  },
];

export const FAQS = [
  {
    q: 'Is there a minimum commitment?',
    a: 'Most placements require a 1-month minimum. Platinum partnerships are typically quarterly or annual. We\'re flexible — ask us.',
  },
  {
    q: 'Can I target a specific region?',
    a: 'Yes. We can geo-target ads to US regions (Northeast, Southeast, Midwest, West) or Canada. Geo-targeting is available on sidebar and inline placements.',
  },
  {
    q: 'What ad formats do you accept?',
    a: 'We accept standard display (PNG, JPG, GIF), and we can build custom native units in-house to match AWI Florida Chapter\'s design. Specs included in the media kit.',
  },
  {
    q: 'Do you offer performance guarantees?',
    a: 'We guarantee impression minimums on all placements. If we fall short, we extend your campaign at no charge. All campaigns include full analytics access.',
  },
  {
    q: 'Can I sponsor a AWI Florida Chapter Meetup in my region?',
    a: 'Yes — meetup sponsorships include logo placement, a 5-minute product demo slot, and pre/post event email mentions. Contact us for available cities and dates.',
  },
];
