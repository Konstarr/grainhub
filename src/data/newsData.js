/**
 * Content for the News index page.
 */

export const NEWS_PAGE_HEADER = {
  eyebrow: 'AWI Florida Chapter Industry News',
  title: 'The Latest from Millwork & Cabinets',
  subtitle: 'Market reports, product launches, industry events, regulatory updates, and trade news from across the millwork and cabinet industry.',
};

// Tab ids MUST match the `category` column values in the
// news_articles table exactly (case-sensitive) — otherwise the
// ?category filter on the News page returns an empty result set.
// `all` is the special no-filter selection.
export const NEWS_CATEGORY_TABS = [
  { label: 'All Stories', id: 'all' },
  { label: 'Industry',    id: 'Industry' },
  { label: 'Markets',     id: 'Markets' },
  { label: 'Materials',   id: 'Materials' },
  { label: 'Machinery',   id: 'Machinery' },
  { label: 'Software',    id: 'Software' },
  { label: 'Hardware',    id: 'Hardware' },
  { label: 'Finishing',   id: 'Finishing' },
  { label: 'Regulatory',  id: 'Regulatory' },
  { label: 'Standards',   id: 'Standards' },
];

export const HERO_STORY = {
  category: 'Industry Report',
  categoryColor: 'default',
  kicker: { label: 'Industry Report', color: 'default' },
  title: 'Cabinet & Millwork Revenue Up 8.4% in Q1 as Custom Residential Demand Accelerates Nationwide',
  excerpt: "AWMAC's quarterly index shows strong demand driven by high-end remodels and new custom residential builds, while commercial office millwork softens. Material costs are stabilizing after two years of significant volatility in hardwood and sheet goods.",
  imgGradient: 'linear-gradient(135deg, #1C0E05 0%, #3D2010 35%, #6B3820 65%, #9A5030 100%)',
  author: { initials: 'JK', name: 'JonahKirk' },
  publishedDate: '3 hours ago',
  readTime: '8 min read',
};

export const NEWS_STORIES = [
  {
    category: 'Standards & Compliance',
    categoryTag: 'Standards',
    categoryColor: 'green',
    kicker: { label: 'Standards', color: 'green' },
    title: 'KCMA Releases Updated Cabinet Construction Standards for 2025 — Key Changes Summarized',
    excerpt: 'Three significant revisions to performance grades, material specifications, and structural requirements for residential cabinetry. Updated load cycling test and new moisture content tolerances.',
    imgGradient: 'linear-gradient(135deg, #1A3A10 0%, #3A6A20 100%)',
    author: { initials: 'SR', name: 'SaraRomero' },
    publishedDate: '5 hours ago',
    readTime: '6 min read',
  },
  {
    category: 'CNC & Technology',
    categoryTag: 'Technology',
    categoryColor: 'amber',
    kicker: { label: 'Technology', color: 'amber' },
    title: 'Homag Introduces AI-Driven Nesting Software for Small-Batch Cabinet Shops at LIGNA 2025',
    excerpt: 'New module integrates material optimization with CNC scheduling, targeting shops with 50–300 daily cabinets. Available Q2 2025; pricing TBD.',
    imgGradient: 'linear-gradient(135deg, #3A2808 0%, #7A5020 100%)',
    author: { initials: 'MB', name: 'MikeBrosnan' },
    publishedDate: '8 hours ago',
    readTime: '5 min read',
  },
  {
    category: 'Markets & Supply',
    categoryTag: 'Markets',
    categoryColor: 'blue',
    kicker: { label: 'Markets', color: 'blue' },
    title: "Lumber Futures Dip 4% as Pacific Northwest Timber Supply Recovers from Last Season's Disruptions",
    excerpt: 'Softwood contracts down on improved mill throughput and lower shipping congestion. Hardwood prices remain sticky amid strong cabinet demand.',
    imgGradient: 'linear-gradient(135deg, #1A2E48 0%, #2D4A78 100%)',
    author: { initials: 'DL', name: 'DianeLachapelle' },
    publishedDate: '12 hours ago',
    readTime: '4 min read',
  },
  {
    category: 'Regulatory & Compliance',
    categoryTag: 'Regulatory',
    categoryColor: 'red',
    kicker: { label: 'Regulatory', color: 'red' },
    title: 'CARB Phase 3 Composite Wood Emissions Rules: What Cabinet Shops Need to Know Before 2026',
    excerpt: "California's strict new emissions limits take effect Jan 1, 2026. AWI Florida Chapter explains the compliance pathway, testing costs, and supply chain timing for manufacturers.",
    imgGradient: 'linear-gradient(135deg, #3A0A0A 0%, #7A2020 100%)',
    author: { initials: 'KR', name: 'KarenReid' },
    publishedDate: '1 day ago',
    readTime: '9 min read',
  },
  {
    category: 'People & Hiring',
    categoryTag: 'People',
    categoryColor: 'purple',
    kicker: { label: 'People', color: 'purple' },
    title: 'Cabinet Industry Wage Pressure Continues as Shops Compete for CNC Operators and Estimators',
    excerpt: 'Labor shortage in skilled trades pushing salary floors up 6–8% year-over-year. Retention strategies and competitive packages across regional markets.',
    imgGradient: 'linear-gradient(135deg, #2A1A48 0%, #5A3A88 100%)',
    author: { initials: 'JP', name: 'JakeParsons' },
    publishedDate: '2 days ago',
    readTime: '7 min read',
  },
  {
    category: 'Events & Awards',
    categoryTag: 'Events',
    categoryColor: 'teal',
    kicker: { label: 'Events', color: 'teal' },
    title: "LIGNA 2025: Five Cabinet Tech Demos You Can't Miss on the Hannover Fairgrounds",
    excerpt: 'Preview of new CNC controllers, edge-banding systems, and software suites. AWI Florida Chapter correspondent on the ground with hands-on demos and manufacturer interviews.',
    imgGradient: 'linear-gradient(135deg, #0A2A28 0%, #1A5A58 100%)',
    author: { initials: 'TK', name: 'TomKowalski' },
    publishedDate: '3 days ago',
    readTime: '6 min read',
  },
];

export const NEWSLETTER_SUBSCRIBE = {
  label: 'THE WEEKLY BENCH',
  description: 'Industry news, forum highlights, and machinery deals — delivered every Tuesday morning.',
};

export const TRENDING_ARTICLES = [
  { rank: 1, title: 'Cabinet & Millwork Revenue Up 8.4% in Q1', meta: 'Industry Report · 18.4K views' },
  { rank: 2, title: 'KCMA 2025 Standards — Key Changes Summarized', meta: 'Standards · 12.2K views' },
  { rank: 3, title: 'CARB Phase 3: Compliance Roadmap for Shops', meta: 'Regulatory · 10.8K views' },
  { rank: 4, title: 'Lumber Futures Dip 4%', meta: 'Markets · 8.6K views' },
  { rank: 5, title: 'Cabinet Wage Pressure Hits 6–8% YoY Increases', meta: 'People · 7.2K views' },
];

export const FORUM_HIGHLIGHTS = [
  { category: 'Cabinet Making', title: 'Best approach for full-overlay frameless on out-of-square?', meta: 'by TomKowalski · 2h ago' },
  { category: 'Finishing', title: "Water-based post-cat lacquer that won't raise grain", meta: 'by ShawnRomero · 4h ago' },
  { category: 'CNC & Software', title: 'Microvellum to Cabinet Vision — learning curve?', meta: 'by MariaLopez · 5h ago' },
  { category: 'Shop Management', title: 'RFID tracking for cabinet shop floor — worth it?', meta: 'by DaveWilson · 9h ago' },
];

export const SPONSOR_AD = {
  label: 'Featured Sponsor',
  title: 'Blum SERVO-DRIVE for Aventos',
  description: 'Effortless electronic opening of lift systems for all panel sizes — touch-to-open, fully integrated.',
};
