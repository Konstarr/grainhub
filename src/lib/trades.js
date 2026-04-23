/**
 * Central trade-discipline taxonomy used by the site-wide SecondaryNav.
 * One source of truth for:
 *  - the 9 trade labels + slugs rendered in the bar
 *  - mapping existing data-file category strings/ids to a trade slug
 *  - helpers every list page uses to filter by the ?trade=<slug> param
 */

export const TRADES = [
  { slug: 'cabinet-making',        label: 'Cabinet Making' },
  { slug: 'millwork-moulding',     label: 'Millwork & Moulding' },
  { slug: 'finishing-coatings',    label: 'Finishing & Coatings' },
  { slug: 'cnc-machining',         label: 'CNC & Machining' },
  { slug: 'business-estimating',   label: 'Business & Estimating' },
  { slug: 'wood-species',          label: 'Wood Species' },
  { slug: 'hardware-accessories',  label: 'Hardware & Accessories' },
  { slug: 'safety-standards',      label: 'Safety & Standards' },
  { slug: 'shop-management',       label: 'Shop Management' },
];

export const TRADE_SLUGS = TRADES.map((t) => t.slug);

/**
 * Maps arbitrary category / id / tag strings from the existing data files
 * to one of the 9 canonical trade slugs. Extend this as the data grows.
 * Keys are compared case-insensitively.
 */
const RAW_MAP = {
  // Forum-group category ids
  'cabinet-making':          'cabinet-making',
  'architectural-millwork':  'millwork-moulding',
  'finishing-coatings':      'finishing-coatings',
  'wood-species':            'wood-species',
  'hardware':                'hardware-accessories',
  'hand-tools':              'cabinet-making',
  'cnc-routers':             'cnc-machining',
  'edge-banders':            'cnc-machining',
  'software-tools':          'business-estimating',
  'shop-automation':         'shop-management',
  'estimating':              'business-estimating',
  'hiring-workforce':        'shop-management',
  'standards-codes':         'safety-standards',
  'safety-dust':             'safety-standards',
  'sales-marketing':         'business-estimating',

  // Free-text category strings used across data files
  'cabinet making':                'cabinet-making',
  'architectural millwork':        'millwork-moulding',
  'millwork':                      'millwork-moulding',
  'millwork & moulding':           'millwork-moulding',
  'finishing':                     'finishing-coatings',
  'finishing & coatings':          'finishing-coatings',
  'cnc':                           'cnc-machining',
  'cnc & machining':               'cnc-machining',
  'cnc operator':                  'cnc-machining',
  'cnc router':                    'cnc-machining',
  'edge bander':                   'cnc-machining',
  'panel saw':                     'cnc-machining',
  'widebelt sander':               'cnc-machining',
  'business':                      'business-estimating',
  'business & estimating':         'business-estimating',
  'estimating & pricing':          'business-estimating',
  'standards & compliance':        'safety-standards',
  'standards, codes & legal':      'safety-standards',
  'safety & dust control':         'safety-standards',
  'safety & standards':            'safety-standards',
  'standards':                     'safety-standards',
  'safety':                        'safety-standards',
  'hardware & accessories':        'hardware-accessories',
  'hardware & fasteners':          'hardware-accessories',
  'cabinet hardware':              'hardware-accessories',
  'hinges & runners':              'hardware-accessories',
  'drawer systems':                'hardware-accessories',
  'wood species & materials':      'wood-species',
  'lumber':                        'wood-species',
  'hardwood':                      'wood-species',
  'hardwood lumber':               'wood-species',
  'sheet goods':                   'wood-species',
  'sheet goods & panel':           'wood-species',
  'plywood':                       'wood-species',
  'shop management':               'shop-management',
  'shop setup & automation':       'shop-management',
  'hiring & workforce':            'shop-management',
  'sales, marketing & growth':     'business-estimating',

  // Job role pills (Jobs.jsx)
  'cabinet maker':                 'cabinet-making',
  'millwork installer':            'millwork-moulding',
  'finisher':                      'finishing-coatings',
  'estimator':                     'business-estimating',
  'shop manager':                  'shop-management',
  'sales rep':                     'business-estimating',

  // News / Events category tags
  'trade show':                    'business-estimating',
  'workshop':                      'shop-management',
};

const LOOKUP = Object.fromEntries(
  Object.entries(RAW_MAP).map(([k, v]) => [k.toLowerCase(), v])
);

/**
 * Resolve a trade slug for a data item. Looks at (in priority order):
 *  1. item.trade — explicit override
 *  2. item.category
 *  3. item.categoryTag
 *  4. item.id
 *  5. any tag in item.tags[]
 *  6. item.name (forum category name)
 * Returns the canonical trade slug, or null when no match.
 */
export function itemTrade(item) {
  if (!item) return null;
  if (item.trade && TRADE_SLUGS.includes(item.trade)) return item.trade;

  const candidates = [item.category, item.categoryTag, item.id, item.name];
  for (const c of candidates) {
    if (typeof c === 'string' && LOOKUP[c.toLowerCase()]) return LOOKUP[c.toLowerCase()];
  }
  if (Array.isArray(item.tags)) {
    for (const t of item.tags) {
      if (typeof t === 'string' && LOOKUP[t.toLowerCase()]) return LOOKUP[t.toLowerCase()];
    }
  }
  return null;
}

export function matchesTrade(item, tradeSlug) {
  if (!tradeSlug) return true;
  return itemTrade(item) === tradeSlug;
}
