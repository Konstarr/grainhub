import '../styles/marketplace.css';
import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CategoryHighway from '../components/marketplace/CategoryHighway.jsx';
import FilterSidebar from '../components/marketplace/FilterSidebar.jsx';
import ListingsArea from '../components/marketplace/ListingsArea.jsx';
import { MARKETPLACE_HEADER } from '../data/marketplaceData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapMarketplaceRow } from '../lib/mappers.js';
import { haversineMiles } from '../lib/geocode.js';

const COND_LABEL = {
  'new': 'New',
  'used-excellent': 'Excellent',
  'used-good': 'Good',
  'used-fair': 'Fair',
};
const EMOJI_BY_CAT = {
  'CNC Machinery': 'CNC',
  'Edgebanders': 'EB',
  'Moulders': 'M',
  'Finishing': 'F',
  'Stationary Tools': 'ST',
  'Combination': 'C',
  'Hand/Power Tools': 'HT',
  'Panel Saws': 'PS',
  'Dust Collection': 'DC',
  'Lumber': 'LB',
  'Sheet Goods': 'SG',
  'Hardware': 'HW',
  'Sanders': 'S',
  'Tooling': 'T',
};

const DEFAULT_FILTERS = {
  categories: [],
  conditions: ['New', 'Excellent', 'Good', 'Fair'],
  priceMin: '',
  priceMax: '',
  listingTypes: [],
  locations: [],
  timeframe: '',
  distanceZip: '',
  distanceLat: null,
  distanceLng: null,
  distanceRadius: 50,
};

const HIGHWAY_PATTERN = {
  'all': () => true,
  'machinery': (c) => /machin|cnc|edgeband|moulder|saw|sander|dust|combin/i.test(c),
  'lumber': (c) => /lumber/i.test(c),
  'sheet': (c) => /sheet/i.test(c),
  'hardware': (c) => /hardware/i.test(c),
  'finishing': (c) => /finish|coat/i.test(c),
  'tooling': (c) => /tool|bit/i.test(c),
  'vehicles': (c) => /vehicle|trailer|truck/i.test(c),
  'shop': (c) => /shop|office|fixture/i.test(c),
  'surplus': (c) => /surplus|closeout/i.test(c),
};

const SEARCH_CATEGORY_MAP = {
  'All Categories': 'all',
  'Machinery & Equipment': 'machinery',
  'Lumber & Hardwood': 'lumber',
  'Sheet Goods & Panel': 'sheet',
  'Hardware & Fasteners': 'hardware',
  'Finishing & Coatings': 'finishing',
  'Tooling & Bits': 'tooling',
  'Vehicles & Trailers': 'vehicles',
  'Shop Fixtures & Furniture': 'shop',
  'Surplus & Closeout': 'surplus',
};

const SIDEBAR_CAT_LABEL_PATTERN = {
  'Machinery': /machin|cnc|edgeband|moulder|saw|sander|dust|combin|panel/i,
  'Lumber & Hardwood': /lumber|hardwood/i,
  'Sheet Goods': /sheet/i,
  'Hardware': /hardware/i,
  'Finishing & Coatings': /finish|coat/i,
  'Tooling & Bits': /tool|bit/i,
  'Vehicles & Trailers': /vehicle|trailer|truck/i,
  'Shop & Office': /shop|office|fixture/i,
  'Surplus & Closeout': /surplus|closeout/i,
};

const LOCATION_LABEL_PATTERN = {
  'Northeast US': /\b(ME|NH|VT|MA|RI|CT|NY|NJ|PA|Massachusetts|New York|Pennsylvania|New Jersey|Connecticut)\b/i,
  'Southeast US': /\b(DE|MD|VA|WV|NC|SC|GA|FL|AL|TN|KY|MS|Virginia|Carolina|Georgia|Florida|Alabama|Tennessee|Kentucky)\b/i,
  'Midwest US': /\b(OH|IN|IL|MI|WI|MN|IA|MO|ND|SD|NE|KS|Ohio|Indiana|Illinois|Michigan|Wisconsin|Minnesota|Iowa|Missouri|Kansas)\b/i,
  'West US': /\b(MT|WY|CO|NM|ID|UT|AZ|NV|WA|OR|CA|AK|HI|Washington|Oregon|California|Colorado|Arizona|Nevada|Utah|Idaho|Montana)\b/i,
  'Canada': /\b(Canada|ON|QC|BC|AB|MB|SK|NS|NB|NL|PE|Ontario|Quebec|British Columbia|Alberta)\b/i,
  'Ships Anywhere': /ships anywhere|nationwide|any/i,
};

const TIMEFRAME_MS = {
  'Last 24 hours': 24 * 3600 * 1000,
  'Last 7 days': 7 * 24 * 3600 * 1000,
  'Last 30 days': 30 * 24 * 3600 * 1000,
  'Any time': Infinity,
};

function toListingCard(row) {
  const m = mapMarketplaceRow(row);
  const priceStr = String(row.price_type || '').toLowerCase();
  let inferredType = 'Fixed Price';
  if (priceStr === 'offer' || (m.price || '').toLowerCase().includes('offer')) inferredType = 'Make an Offer';
  else if (priceStr === 'auction') inferredType = 'Auction';
  else if (priceStr === 'free' || m.priceNumeric === 0) inferredType = 'Free / Take It';

  return {
    id: m.id,
    slug: m.slug,
    category: m.category || 'Misc',
    condition: COND_LABEL[m.condition] || 'Used',
    title: m.title,
    description: m.description || '',
    location: m.location || 'U.S.',
    shipping: 'Local pickup',
    price: m.price || 'Contact',
    priceNumeric: m.priceNumeric,
    priceUnit: '',
    emoji: EMOJI_BY_CAT[m.category] || '?',
    imgClass: 'mk-img-default',
    imgStyle: { background: 'linear-gradient(135deg, #1B3A2E, #2D5A3D)' },
    specs: m.description ? m.description.slice(0, 80) + (m.description.length > 80 ? '...' : '') : '',
    isNew: false,
    images: m.images,
    createdAt: row.created_at,
    listingType: inferredType,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    zipCode: row.zip_code || null,
  };
}

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const tradeSlug = searchParams.get('trade') || '';

  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortMode, setSortMode] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const [searchRegion, setSearchRegion] = useState('Anywhere');
  const listingsRef = useRef(null);

  const { data: rows } = useSupabaseList('marketplace_listings', {
    filter: (q) => {
      let out = q.eq('is_approved', true).eq('is_sold', false);
      if (tradeSlug) {
        const tradeTerm = tradeSlug.replace(/-/g, ' ')
          .replace(/[%_]/g, (c) => '\\' + c)
          .replace(/[,()]/g, ' ');
        out = out.or('trade.ilike.%' + tradeTerm + '%,title.ilike.%' + tradeTerm + '%,description.ilike.%' + tradeTerm + '%');
      }
      return out;
    },
    order: { column: 'created_at', ascending: false },
    limit: 200,
    deps: [tradeSlug],
  });

  const allListings = useMemo(() => rows.map(toListingCard), [rows]);

  const visible = useMemo(() => {
    const highway = HIGHWAY_PATTERN[activeCategory] || (() => true);
    const searchHighwayId = SEARCH_CATEGORY_MAP[searchCategory] || 'all';
    const searchHighway = HIGHWAY_PATTERN[searchHighwayId] || (() => true);
    const q = (searchQuery || '').trim().toLowerCase();
    const regionRe = LOCATION_LABEL_PATTERN[searchRegion];
    const min = filters.priceMin === '' ? null : Number(filters.priceMin);
    const max = filters.priceMax === '' ? null : Number(filters.priceMax);
    const conds = filters.conditions || [];
    const sidebarCats = filters.categories || [];
    const types = filters.listingTypes || [];
    const locs = filters.locations || [];
    const tfMs = TIMEFRAME_MS[filters.timeframe];

    let out = allListings.filter((l) => {
      if (highway(l.category) === false) return false;
      if (searchHighway(l.category) === false) return false;
      if (q) {
        const hay = (l.title + ' ' + l.description + ' ' + l.category + ' ' + l.location).toLowerCase();
        if (hay.includes(q) === false) return false;
      }
      if (regionRe && regionRe.test(l.location || '') === false) return false;
      if (sidebarCats.length > 0) {
        const anyMatch = sidebarCats.some((label) => {
          const re = SIDEBAR_CAT_LABEL_PATTERN[label];
          return re ? re.test(l.category) : false;
        });
        if (!anyMatch) return false;
      }
      if (conds.length > 0 && !conds.includes(l.condition)) return false;
      if (min !== null && !Number.isNaN(min) && (l.priceNumeric == null || l.priceNumeric < min)) return false;
      if (max !== null && !Number.isNaN(max) && (l.priceNumeric == null || l.priceNumeric > max)) return false;
      if (types.length > 0 && !types.includes(l.listingType)) return false;
      if (locs.length > 0) {
        const anyLoc = locs.some((label) => {
          const re = LOCATION_LABEL_PATTERN[label];
          return re ? re.test(l.location || '') : false;
        });
        if (!anyLoc) return false;
      }
      if (tfMs && tfMs !== Infinity && l.createdAt) {
        const ageMs = Date.now() - new Date(l.createdAt).getTime();
        if (ageMs > tfMs) return false;
      }
      // Distance filter - only applies when the buyer has typed a zip
      // and we successfully geocoded it. Listings without lat/lng are
      // excluded so they don't appear as 0-mile false positives.
      if (filters.distanceLat != null && filters.distanceLng != null) {
        if (l.latitude == null || l.longitude == null) return false;
        const radius = Number(filters.distanceRadius) || 50;
        const miles = haversineMiles(
          filters.distanceLat, filters.distanceLng,
          l.latitude, l.longitude
        );
        if (miles > radius) return false;
      }
      return true;
    });

    if (sortMode === 'price-asc') {
      out = [...out].sort((a, b) => (a.priceNumeric ?? Infinity) - (b.priceNumeric ?? Infinity));
    } else if (sortMode === 'price-desc') {
      out = [...out].sort((a, b) => (b.priceNumeric ?? -Infinity) - (a.priceNumeric ?? -Infinity));
    }
    return out;
  }, [allListings, activeCategory, filters, sortMode, searchQuery, searchCategory, searchRegion]);

  const handleSearchSubmit = () => {
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div className="page-header gh-hero">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <div className="page-eyebrow">{MARKETPLACE_HEADER.eyebrow}</div>
              <h1 className="page-title">{MARKETPLACE_HEADER.title}</h1>
              <p className="page-subtitle">{MARKETPLACE_HEADER.subtitle}</p>
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  to="/marketplace/new"
                  className="search-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  + Post a listing
                </Link>
                <Link
                  to="/account/subscription"
                  style={{
                    color: '#fff',
                    opacity: 0.85,
                    textDecoration: 'underline',
                    fontSize: 14,
                    alignSelf: 'center',
                  }}
                >
                  Vendor pack pricing
                </Link>
              </div>
            </div>
            <div className="header-stats">
              {MARKETPLACE_HEADER.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="hstat-num">{stat.num}</div>
                  <div className="hstat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="search-hero">
            <div className="search-hero-input">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#7A8B82" strokeWidth="1.5" />
                <path d="M11 11 L14 14" stroke="#7A8B82" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search for machinery, lumber, hardware, trucks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
              />
            </div>
            <select
              className="search-select"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              {Object.keys(SEARCH_CATEGORY_MAP).map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <select
              className="search-select"
              style={{ minWidth: '130px' }}
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
            >
              <option value="Anywhere">Anywhere</option>
              <option value="Northeast US">Northeast US</option>
              <option value="Southeast US">Southeast US</option>
              <option value="Midwest US">Midwest US</option>
              <option value="West US">West US</option>
              <option value="Canada">Canada</option>
            </select>
            <button type="button" className="search-btn" onClick={handleSearchSubmit}>
              Search Listings
            </button>
          </div>
        </div>
      </div>

      <CategoryHighway activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

      <div className="mk-wrap" ref={listingsRef}>
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearAll={() => {
            setFilters(DEFAULT_FILTERS);
            setActiveCategory('all');
            setSearchQuery('');
            setSearchCategory('All Categories');
            setSearchRegion('Anywhere');
          }}
        />
        <ListingsArea
          listings={visible}
          totalCount={allListings.length}
          sortMode={sortMode}
          onSortChange={setSortMode}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />
      </div>
    </>
  );
}
