/**
 * Suppliers directory page data.
 *
 * Each SUPPLIER_LIST entry carries:
 *   - name, logo (2-char initials), category (human-facing), rating, reviews
 *   - badges[] - rendered as little tags
 *   - address - full faux US street address (used on map info windows)
 *   - city, state - for list display + coarse filtering
 *   - lat, lng - for map marker placement
 *
 * Addresses are faux - street numbers are fabricated; cities/states are real
 * millwork/cabinet-industry hubs so the map spreads naturally across the US.
 */

export const SUPPLIERS_HEADER = {
  eyebrow: 'AWI Florida Chapter · Member Directory',
  title: 'Member Directory',
  subtitle:
    'Florida\'s architectural woodwork community in one place. Manufacturer Members are the cabinet shops, millwork firms, finishers, and installers building the work. Supplier Members are the hardware, lumber, machinery, finish, and software vendors who supply them. Both are listed below.',
  stats: [
    { num: '—', label: 'Manufacturer members' },
    { num: '—', label: 'Supplier members' },
    { num: 'FL', label: 'Statewide' },
  ],
};

export const SUPPLIER_CATEGORIES = [
  { icon: '\ud83d\udd29', name: 'Hardware & Hinges', count: '340 suppliers', id: 'hardware', active: true },
  { icon: '\ud83e\udeb5', name: 'Lumber & Plywood', count: '280 suppliers', id: 'lumber' },
  { icon: '\ud83d\udccb', name: 'Sheet Goods', count: '165 suppliers', id: 'sheet' },
  { icon: '\ud83c\udfa8', name: 'Finishing & Coatings', count: '220 suppliers', id: 'finishing' },
  { icon: '\u2699\ufe0f', name: 'CNC & Machinery', count: '190 suppliers', id: 'cnc' },
  { icon: '\ud83d\udd27', name: 'Tooling & Bits', count: '175 suppliers', id: 'tooling' },
  { icon: '\u2194\ufe0f', name: 'Edge Banding', count: '84 suppliers', id: 'edgebanding' },
];

export const PLATINUM_SPONSORS = [
  { logo: 'Bl', name: 'Julius Blum GmbH', category: 'Cabinet Hardware', badge: '\u2b50 Platinum Sponsor' },
  { logo: 'He', name: 'Hettich America', category: 'Hinges & Runners', badge: '\u2b50 Platinum Sponsor' },
  { logo: 'Gr', name: 'Grass America', category: 'Drawer Systems', badge: '\u2b50 Platinum Sponsor' },
  { logo: 'Sa', name: 'Salice America', category: 'European Hinges', badge: '\u2b50 Platinum Sponsor' },
  { logo: 'Ho', name: 'Homag Inc.', category: 'CNC Machinery', badge: '\u2b50 Platinum Sponsor' },
];

export const SUPPLIER_LIST = [
  { logo: 'Bl', name: 'Julius Blum GmbH', category: 'Cabinet Hardware', rating: '4.9', reviews: '1,284', address: '1045 Blum Way', city: 'Stanley', state: 'NC', zip: '28164', location: 'Stanley, NC', lat: 35.3540, lng: -81.0937, badges: ['\u2b50 Platinum Sponsor', '\u2713 Verified', 'Manufacturer'] },
  { logo: 'He', name: 'Hettich America', category: 'Hinges & Runners', rating: '4.8', reviews: '892', address: '6225 Hettich Blvd', city: 'Virginia Beach', state: 'VA', zip: '23462', location: 'Virginia Beach, VA', lat: 36.8529, lng: -76.0588, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Gr', name: 'Grass America', category: 'Drawer Systems', rating: '4.7', reviews: '756', address: '1202 Grass Way', city: 'Kernersville', state: 'NC', zip: '27284', location: 'Kernersville, NC', lat: 36.1196, lng: -80.0739, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Sa', name: 'Salice America', category: 'European Hinges', rating: '4.7', reviews: '634', address: '2123 Space Park Dr', city: 'Cranbury', state: 'NJ', zip: '08512', location: 'Cranbury, NJ', lat: 40.3134, lng: -74.5240, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'Ha', name: 'H\u00e4fele America', category: 'Cabinet Hardware', rating: '4.8', reviews: '1,021', address: '3901 Cheyenne Dr', city: 'Archdale', state: 'NC', zip: '27263', location: 'Archdale, NC', lat: 35.9143, lng: -79.9725, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'Ri', name: 'Richelieu Hardware', category: 'Cabinet Hardware', rating: '4.6', reviews: '587', address: '1200 Industrial Park Dr', city: 'Mount Vernon', state: 'WA', zip: '98273', location: 'Mount Vernon, WA', lat: 48.4201, lng: -122.3343, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'KV', name: 'Knape & Vogt', category: 'Drawer Systems', rating: '4.5', reviews: '412', address: '2700 Oak Industrial Dr NE', city: 'Grand Rapids', state: 'MI', zip: '49505', location: 'Grand Rapids, MI', lat: 42.9850, lng: -85.6120, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Su', name: 'Sugatsune America', category: 'Specialty Hardware', rating: '4.6', reviews: '298', address: '221 E Selandia Ln', city: 'Carson', state: 'CA', zip: '90746', location: 'Carson, CA', lat: 33.8462, lng: -118.2690, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'BB', name: 'Baird Brothers Lumber', category: 'Hardwood Lumber', rating: '4.7', reviews: '419', address: '7060 Crory Rd', city: 'Canfield', state: 'OH', zip: '44406', location: 'Canfield, OH', lat: 41.0284, lng: -80.7609, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'Co', name: 'Columbia Forest Products', category: 'Sheet Goods', rating: '4.6', reviews: '534', address: '222 SW Columbia St', city: 'Portland', state: 'OR', zip: '97201', location: 'Portland, OR', lat: 45.5150, lng: -122.6770, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'SL', name: 'Sauers Lumber Co.', category: 'Hardwood Lumber', rating: '4.5', reviews: '267', address: '1330 Wilmington Pike', city: 'West Chester', state: 'PA', zip: '19382', location: 'West Chester, PA', lat: 39.9168, lng: -75.5950, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'WL', name: 'Weyerhaeuser Distribution', category: 'Sheet Goods', rating: '4.4', reviews: '721', address: '220 Occidental Ave S', city: 'Seattle', state: 'WA', zip: '98104', location: 'Seattle, WA', lat: 47.5989, lng: -122.3338, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'RP', name: 'Roseburg Forest Products', category: 'Sheet Goods', rating: '4.5', reviews: '498', address: '3660 Gateway St', city: 'Springfield', state: 'OR', zip: '97477', location: 'Springfield, OR', lat: 44.0462, lng: -123.0220, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Ir', name: 'Irion Lumber', category: 'Hardwood Lumber', rating: '4.9', reviews: '183', address: '1820 Tyler Rd', city: 'Wellsboro', state: 'PA', zip: '16901', location: 'Wellsboro, PA', lat: 41.7481, lng: -77.3025, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'SW', name: 'Sherwin-Williams Industrial', category: 'Finishing & Coatings', rating: '4.5', reviews: '1,455', address: '101 W Prospect Ave', city: 'Cleveland', state: 'OH', zip: '44115', location: 'Cleveland, OH', lat: 41.4993, lng: -81.6944, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'MC', name: 'M.L. Campbell Coatings', category: 'Finishing & Coatings', rating: '4.7', reviews: '612', address: '1920 Industrial Pkwy', city: 'Minneapolis', state: 'MN', zip: '55441', location: 'Minneapolis, MN', lat: 45.0190, lng: -93.3840, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Re', name: 'Renner Italia', category: 'Finishing & Coatings', rating: '4.6', reviews: '211', address: '4500 Renner Dr', city: 'High Point', state: 'NC', zip: '27265', location: 'High Point, NC', lat: 35.9557, lng: -80.0053, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'Ax', name: 'Axalta Wood Coatings', category: 'Finishing & Coatings', rating: '4.5', reviews: '367', address: '2101 Market St', city: 'Philadelphia', state: 'PA', zip: '19103', location: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Ho', name: 'Homag Inc.', category: 'CNC Machinery', rating: '4.8', reviews: '874', address: '3800 Pender Dr, Suite 1000', city: 'Charlotte', state: 'NC', zip: '28262', location: 'Charlotte, NC', lat: 35.3063, lng: -80.7336, badges: ['\u2b50 Platinum Sponsor', '\u2713 Verified', 'Manufacturer'] },
  { logo: 'Fe', name: 'Felder Group USA', category: 'CNC Machinery', rating: '4.7', reviews: '528', address: '2 Lukens Dr, Suite 300', city: 'New Castle', state: 'DE', zip: '19720', location: 'New Castle, DE', lat: 39.6620, lng: -75.5663, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'SC', name: 'SCM Group USA', category: 'CNC Machinery', rating: '4.6', reviews: '462', address: '2475 Satellite Blvd', city: 'Duluth', state: 'GA', zip: '30096', location: 'Duluth, GA', lat: 34.0029, lng: -84.1446, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Bi', name: 'Biesse America', category: 'CNC Machinery', rating: '4.6', reviews: '389', address: '4110 Meadow Oak Ln', city: 'Charlotte', state: 'NC', zip: '28208', location: 'Charlotte, NC', lat: 35.2121, lng: -80.8844, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Th', name: 'Thermwood Corporation', category: 'CNC Routers', rating: '4.8', reviews: '341', address: '904 Buffaloville Rd', city: 'Dale', state: 'IN', zip: '47523', location: 'Dale, IN', lat: 38.1693, lng: -86.9936, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Bu', name: 'Busellato USA', category: 'CNC Machinery', rating: '4.5', reviews: '178', address: '3401 SW 26th Terrace', city: 'Dallas', state: 'TX', zip: '75237', location: 'Dallas, TX', lat: 32.6721, lng: -96.8706, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'Fr', name: 'Freud Tools', category: 'Tooling & Bits', rating: '4.8', reviews: '1,124', address: '218 Feld Ave', city: 'High Point', state: 'NC', zip: '27263', location: 'High Point, NC', lat: 35.9402, lng: -80.0083, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'CM', name: 'CMT USA', category: 'Tooling & Bits', rating: '4.7', reviews: '612', address: '307-F Pomona Dr', city: 'Greensboro', state: 'NC', zip: '27407', location: 'Greensboro, NC', lat: 36.0402, lng: -79.8789, badges: ['\u2713 Verified', 'Distributor'] },
  { logo: 'Le', name: 'Leitz Tooling USA', category: 'Tooling & Bits', rating: '4.7', reviews: '488', address: '4301 E Paris Ave SE', city: 'Grand Rapids', state: 'MI', zip: '49512', location: 'Grand Rapids, MI', lat: 42.8661, lng: -85.5458, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Am', name: 'Amana Tool', category: 'Tooling & Bits', rating: '4.8', reviews: '921', address: '120 Carolyn Blvd', city: 'Farmingdale', state: 'NY', zip: '11735', location: 'Farmingdale, NY', lat: 40.7327, lng: -73.4457, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Wh', name: 'Whiteside Machine Co.', category: 'Tooling & Bits', rating: '4.9', reviews: '784', address: '4506 Shook Rd', city: 'Claremont', state: 'NC', zip: '28610', location: 'Claremont, NC', lat: 35.7140, lng: -81.1465, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Rh', name: 'REHAU Edge Banding', category: 'Edge Banding', rating: '4.6', reviews: '301', address: '1501 Edwards Ferry Rd NE', city: 'Leesburg', state: 'VA', zip: '20176', location: 'Leesburg, VA', lat: 39.1157, lng: -77.5636, badges: ['\u2713 Verified', 'Manufacturer'] },
  { logo: 'Do', name: 'Doellken Woodtape', category: 'Edge Banding', rating: '4.5', reviews: '194', address: '3500 NW 114th Ave', city: 'Miami', state: 'FL', zip: '33178', location: 'Miami, FL', lat: 25.8108, lng: -80.3785, badges: ['\u2713 Verified', 'Distributor'] },
];

// Category id used by Suppliers page tiles -> the category string(s) we match.
// Centralized so the map + list filter with the same logic.
export const CATEGORY_ID_TO_MATCH = {
  hardware: ['Cabinet Hardware', 'Hinges & Runners', 'Drawer Systems', 'European Hinges', 'Specialty Hardware'],
  lumber: ['Hardwood Lumber'],
  sheet: ['Sheet Goods'],
  finishing: ['Finishing & Coatings'],
  cnc: ['CNC Machinery', 'CNC Routers'],
  tooling: ['Tooling & Bits'],
  edgebanding: ['Edge Banding'],
};

export function supplierMatchesCategoryId(supplier, categoryId) {
  if (!categoryId) return true;
  const matches = CATEGORY_ID_TO_MATCH[categoryId];
  if (!matches) return true;
  return matches.includes(supplier.category);
}
