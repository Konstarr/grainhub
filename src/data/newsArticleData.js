/**
 * Content for the News Article page.
 */

export const NEWS_ARTICLE = {
  category: 'Industry Report',
  categoryColor: 'default',
  tag: { label: 'Featured', variant: 'featured' },
  title: 'Cabinet & Millwork Revenue Up 8.4% in Q1 as Custom Residential Demand Accelerates Nationwide',
  deck: "AWMAC's quarterly index shows strong demand driven by high-end remodels and new custom residential builds, while commercial office millwork softens. Material costs are stabilizing after two years of significant volatility in hardwood and sheet goods.",
  author: { initials: 'JK', name: 'Jonah Kirk', role: 'Senior Industry Reporter' },
  published: 'March 15, 2025',
  readTime: '8 min read',
  heroImgGradient: 'linear-gradient(135deg, #0F2A1F 0%, #3D2010 35%, #6B3820 65%, #9A5030 100%)',
  heroCaption: 'Custom residential cabinet production continues to drive industry growth.',
};

export const NEWS_ARTICLE_BODY = `
<p>The Cabinet Manufacturers Association's latest quarterly economic report signals sustained strength in the residential custom cabinet market, with Q1 2025 revenue climbing 8.4% year-over-year despite persistent headwinds in commercial office buildout.</p>

<h2>Residential Demand Accelerates</h2>
<p>High-end residential remodels and new construction are fueling the surge. Kitchen and bath renovations, in particular, continue at robust levels, driven by consumer spending on home improvement and a strong housing market in key regions (Southwest, Southeast, and Colorado Front Range showing strongest growth).</p>
<p>"We're seeing a return to custom work after years of semi-custom and RTA dominance," notes CMA Executive Director, Linda Paulson. "Consumers are investing in quality and personalization, and that benefits cabinet shops with the capability to deliver custom solutions quickly."</p>

<h2>Commercial Millwork Softens</h2>
<p>The commercial office segment, however, continues to struggle. Post-pandemic office buildout has slowed as companies embrace hybrid work models. Class A office space vacancy rates remain elevated in major markets, reducing demand for built-in cabinetry and architectural millwork. Some shops report a shift to hospitality and restaurant work as an offset.</p>

<h2>Material Costs Stabilize</h2>
<p>Hardwood lumber futures have stabilized after volatility in late 2024. Softwood plywood prices remain steady. Veneer and edge-banding costs, which spiked in 2023, have normalized. This stability is allowing shops to lock in material costs with greater confidence and improve margins on fixed-price bids.</p>

<p><strong>Volatility Index (CMAI Lumber Stability Index):</strong> 34 (down from 52 in Q4 2024). Below 40 is considered "stable"—the first time in 18 months the industry has seen this level.</p>

<h2>Labor Market Remains Tight</h2>
<p>Wage pressures persist. CNC operators and estimators remain in short supply, with average compensation climbing 6–8% year-over-year. Retention initiatives (bonuses, flexible scheduling, career pathing) have become competitive differentiators.</p>

<h2>Industry Outlook: Q2–Q4 2025</h2>
<p>The CMA projects continued growth in residential custom cabinets (4–6% for remainder of 2025), with seasonal variation. Spring/early summer typically see peak demand. Material availability should remain stable. Regulatory headwinds (CARB Phase 3 effective Jan 1, 2026) may drive some pre-compliance purchasing in Q4 2025.</p>

<p><em>The Cabinet Manufacturers Association surveyed 247 manufacturers with combined revenue of $18.2 billion (representing ~45% of the North American market) for this report.</em></p>
`;

export const PULL_QUOTE = {
  text: '"Custom work is back, and shops that can deliver both quality and speed will win market share."',
  attribution: '— Linda Paulson, CMA Executive Director',
};

export const DATA_CALLOUT = {
  label: 'Q1 2025 Market Performance',
  stats: [
    { num: '+8.4%', desc: 'Residential cabinet revenue YoY' },
    { num: '-2.3%', desc: 'Commercial millwork decline YoY' },
    { num: '34', desc: 'Material stability index (stable < 40)' },
  ],
};

export const INLINE_CHART = {
  title: 'Quarterly Revenue Trend (Residential Cabinets)',
  data: [
    { label: 'Q1 2025', pct: 68, direction: 'up' },
    { label: 'Q4 2024', pct: 62, direction: 'up' },
    { label: 'Q3 2024', pct: 58, direction: 'flat' },
    { label: 'Q2 2024', pct: 52, direction: 'down' },
  ],
  source: 'Cabinet Manufacturers Association Economic Index',
};

export const INFO_BOX = {
  label: 'Key Takeaway',
  text: 'Custom cabinet demand is strong and material costs are stable — a favorable environment for shops with execution speed and quality control.',
};

export const ARTICLE_TAGS = [
  'Industry Report',
  'Market Data',
  'Residential',
  'Manufacturing',
  'Economics',
];

export const ARTICLE_FOOTER_DATA = {
  author: { initials: 'JK', name: 'Jonah Kirk', bio: 'Senior Industry Reporter covering cabinet manufacturing, materials, and market trends. Jonah has written for Woodworking Business, FDMC, and the American Woodworking Federation.' },
};

export const RELATED_NEWS = [
  {
    num: 1,
    title: 'Lumber Futures Dip 4% as Pacific Northwest Supply Recovers',
    meta: 'Markets · 312 views',
  },
  {
    num: 2,
    title: 'CARB Phase 3 Compliance: What Cabinet Shops Need to Know',
    meta: 'Regulatory · 289 views',
  },
  {
    num: 3,
    title: 'Cabinet Wage Pressure Hits 6–8% YoY as CNC Shortage Continues',
    meta: 'People & Hiring · 256 views',
  },
];

export const FORUM_RELATED = [
  { category: 'Business & Estimating', title: 'Pricing custom cabinets in high-demand market', meta: '14 replies' },
  { category: 'Shop Management', title: 'Labor retention strategies during wage growth', meta: '9 replies' },
];
