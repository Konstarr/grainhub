/**
 * Content for the Events page.
 *
 * No reference HTML was provided for this page, so the content below is
 * reasonable placeholder data that matches the tone of the other pages.
 * Replace the values when you have real event listings.
 */

export const EVENTS_PAGE_HEADER = {
  eyebrow: 'Industry Events',
  title: 'Trade Shows, Workshops & Conferences',
  subtitle:
    'Find the next cabinet, millwork, and woodworking events worth your time — from international machinery shows to regional meet-ups hosted by fellow shops.',
};

export const EVENTS_FILTER_TABS = [
  { label: 'All Events', count: 42, id: 'all' },
  { label: 'Trade Shows', count: 12, id: 'trade' },
  { label: 'Workshops', count: 14, id: 'workshops' },
  { label: 'Conferences', count: 8, id: 'conferences' },
  { label: 'Online', count: 8, id: 'online' },
];

export const FEATURED_EVENT = {
  eyebrow: 'Featured Event',
  category: 'Trade Show',
  title: 'LIGNA 2026 — Hannover, Germany',
  date: 'May 11 – 15, 2026',
  location: 'Hannover Messe · Germany',
  excerpt:
    'The world\u2019s leading trade fair for woodworking and wood processing. 1,500+ exhibitors across 10 halls covering CNC, finishing, edge-banding, sawmill technology, and automation.',
  tags: ['Machinery', 'CNC', 'Finishing', 'International'],
  imgGradient: 'linear-gradient(135deg, #0F2A1F 0%, #3D2010 35%, #6B3820 65%, #9A5030 100%)',
};

export const EVENT_LISTINGS = [
  {
    category: 'Trade Show',
    categoryColor: 'green',
    title: 'AWFS Fair 2026 — Las Vegas',
    date: 'Jul 21 – 24, 2026',
    location: 'Las Vegas Convention Center',
    excerpt:
      'Biennial North American woodworking trade show with 500+ exhibitors, hands-on demos, and the Fresh Wood student design competition.',
    imgGradient: 'linear-gradient(135deg, #1A3A10 0%, #3A6A20 100%)',
    attendees: '18K+ expected',
    price: 'Registration from $49',
  },
  {
    category: 'Workshop',
    categoryColor: 'amber',
    title: 'Spray Finishing Mastery — Denver, CO',
    date: 'Jun 6 – 7, 2026',
    location: 'Rocky Mountain Finishing Co. · Denver',
    excerpt:
      'Two-day hands-on workshop covering HVLP tuning, water-based topcoat application, and troubleshooting blush/orange-peel on production doors.',
    imgGradient: 'linear-gradient(135deg, #3A2808 0%, #7A5020 100%)',
    attendees: '24-person cap',
    price: '$695',
  },
  {
    category: 'Conference',
    categoryColor: 'blue',
    title: 'KCMA Annual Meeting — Orlando',
    date: 'Mar 9 – 12, 2026',
    location: 'Ritz-Carlton Orlando Grande Lakes',
    excerpt:
      'Kitchen Cabinet Manufacturers Association annual meeting. Member-only sessions on standards, supply chain, regulatory updates, and peer benchmarking.',
    imgGradient: 'linear-gradient(135deg, #1A2E48 0%, #2D4A78 100%)',
    attendees: '850+ members',
    price: 'KCMA members · tiered',
  },
  {
    category: 'Online',
    categoryColor: 'purple',
    title: 'CNC Nesting Optimization Webinar',
    date: 'May 28, 2026 · 2:00 PM ET',
    location: 'Live on Zoom · recording provided',
    excerpt:
      'Live deep-dive with two veteran programmers on squeezing yield out of 4x8 sheets. Case studies from 50–300-cabinet-per-day shops.',
    imgGradient: 'linear-gradient(135deg, #2A1A48 0%, #5A3A88 100%)',
    attendees: '500 seats',
    price: 'Free for AWI Florida Chapter members',
  },
  {
    category: 'Trade Show',
    categoryColor: 'red',
    title: 'IWF Atlanta 2026',
    date: 'Aug 25 – 28, 2026',
    location: 'Georgia World Congress Center',
    excerpt:
      'International Woodworking Fair — every two years, 1,000+ exhibitors, the Challengers Awards for innovative machinery and supply products.',
    imgGradient: 'linear-gradient(135deg, #3A0A0A 0%, #7A2020 100%)',
    attendees: '20K+ attendees',
    price: 'Registration from $75',
  },
  {
    category: 'Workshop',
    categoryColor: 'teal',
    title: 'Custom Door Joinery Intensive — Portland, OR',
    date: 'Sep 14 – 16, 2026',
    location: 'Oregon Millwork Collective',
    excerpt:
      'Three days on cope-and-stick tooling, five-piece raised-panel doors, and premium solid-wood glass-panel construction for architectural millwork.',
    imgGradient: 'linear-gradient(135deg, #0A2A28 0%, #1A5A58 100%)',
    attendees: '12-person cap',
    price: '$1,195',
  },
];

export const SUBMIT_EVENT_CARD = {
  label: 'Hosting an event?',
  title: 'List your event on AWI Florida Chapter',
  description:
    'Reach 48,000+ cabinet and millwork pros. Event listings start at $99 and run until the event date.',
  cta: 'Submit an Event →',
};

export const SAVE_THE_DATE = [
  { title: 'LIGNA 2026', date: 'May 11 – 15', location: 'Hannover, Germany' },
  { title: 'AWFS Fair', date: 'Jul 21 – 24', location: 'Las Vegas, NV' },
  { title: 'IWF Atlanta', date: 'Aug 25 – 28', location: 'Atlanta, GA' },
  { title: 'Xylexpo', date: 'Oct 13 – 16', location: 'Milan, Italy' },
  { title: 'Dubai WoodShow', date: 'Feb 17 – 19', location: 'Dubai, UAE' },
];

export const SPONSOR_AD = {
  label: 'Featured Sponsor',
  title: 'Blum SERVO-DRIVE for Aventos',
  description:
    'Effortless electronic opening of lift systems for all panel sizes — touch-to-open, fully integrated.',
  cta: 'Learn More & Download Spec →',
};

export const NEWSLETTER = {
  title: 'The Weekly Bench',
  description:
    'Industry news, forum highlights, and machinery deals — delivered every Tuesday morning.',
};
