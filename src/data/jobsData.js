/**
 * Content for the Jobs page.
 * Job listings, filters, salary data, and employer information.
 */

export const JOBS_PAGE_HEADER = {
  eyebrow: 'Millwork.io Career Center',
  title: 'Jobs in the\nWood Trades',
  subtitle: 'Cabinet makers, CNC operators, estimators, finishing supervisors, millwork installers, shop foremen — find your next role or your next hire, exclusively in the industry.',
  stats: [
    { num: '648', label: 'Open positions' },
    { num: '312', label: 'Hiring companies' },
    { num: '4,800', label: 'Active job seekers' },
  ],
};

export const ROLE_PILLS = [
  { label: 'All Roles', count: 648, isActive: true },
  { label: 'Cabinet Maker', count: 142 },
  { label: 'CNC Operator', count: 118 },
  { label: 'Estimator', count: 84 },
  { label: 'Finishing Tech', count: 76 },
  { label: 'Shop Foreman', count: 58 },
  { label: 'Millwork Installer', count: 62 },
  { label: 'Design / Drafting', count: 48 },
  { label: 'Sales / Account Mgr', count: 36 },
  { label: 'Apprentice', count: 24 },
];

export const FILTER_OPTIONS = {
  jobType: [
    { label: 'Full-time', count: 484, isChecked: true },
    { label: 'Part-time', count: 48, isChecked: false },
    { label: 'Contract', count: 64, isChecked: false },
    { label: 'Temporary / Seasonal', count: 28, isChecked: false },
    { label: 'Apprenticeship', count: 24, isChecked: false },
  ],
  workLocation: [
    { label: 'On-site', count: 528, isChecked: true },
    { label: 'Hybrid', count: 68, isChecked: false },
    { label: 'Remote', count: 52, isChecked: false },
  ],
  experienceLevel: [
    { label: 'Entry level (0–2 yrs)', count: 84, isChecked: false },
    { label: 'Mid level (2–5 yrs)', count: 218, isChecked: true },
    { label: 'Senior (5+ yrs)', count: 242, isChecked: true },
    { label: 'Lead / Supervisor', count: 104, isChecked: false },
  ],
  shopSpecialty: [
    { label: 'Custom Cabinet', count: 194, isChecked: true },
    { label: 'Architectural Millwork', count: 148, isChecked: true },
    { label: 'Commercial Fixture', count: 86, isChecked: false },
    { label: 'Residential Production', count: 112, isChecked: false },
    { label: 'Millwork Distribution', count: 52, isChecked: false },
    { label: 'Finishing / Coating', count: 56, isChecked: false },
  ],
  region: [
    { label: 'Northeast US', count: 118, isChecked: false },
    { label: 'Southeast US', count: 148, isChecked: false },
    { label: 'Midwest US', count: 136, isChecked: false },
    { label: 'West US', count: 164, isChecked: false },
    { label: 'Canada', count: 82, isChecked: false },
  ],
  postedWithin: [
    { label: 'Last 24 hours', count: 18, isChecked: false },
    { label: 'Last 7 days', count: 124, isChecked: false },
    { label: 'Last 30 days', count: 416, isChecked: true },
    { label: 'Any time', count: 648, isChecked: false },
  ],
};

export const JOBS_TOOLBAR_DATA = {
  totalCount: 648,
  sortOptions: [
    { label: 'Most relevant', value: 'relevant' },
    { label: 'Newest first', value: 'newest' },
    { label: 'Salary: High to Low', value: 'salary-high' },
    { label: 'Salary: Low to High', value: 'salary-low' },
  ],
};

export const FEATURED_JOB = {
  id: 'featured-1',
  isFeatured: true,
  logo: 'AW',
  logoColor: 'cl-blue',
  title: 'Director of Operations — Custom Architectural Millwork',
  company: 'Artisan Woodcraft Group',
  location: 'Seattle, WA',
  isVerified: true,
  salaryMin: '$95K',
  salaryMax: '$130K',
  salaryNote: 'Annual + Bonus + Benefits',
  tags: [
    { label: 'Full-time', className: 'jt-type' },
    { label: 'Senior', className: 'jt-senior' },
    { label: 'On-site', className: 'jt-onsite' },
    { label: 'Leadership', className: 'jt-type' },
  ],
  description: 'Lead a 45-person architectural millwork shop through a growth phase — responsible for production scheduling, estimating oversight, QC, and vendor relationships. AWI-certified shop, strong client roster in high-end residential and commercial interiors. 8+ years millwork or cabinet shop management required.',
  metadata: [
    { icon: '📍', label: 'Seattle, WA' },
    { icon: '🏭', label: '45 employees' },
    { icon: '📅', label: 'Posted 2 days ago' },
    { icon: '👁', label: '342 views' },
  ],
};

export const JOB_LISTINGS = [
  {
    id: 'job-1',
    logo: 'HM',
    logoColor: 'cl-brown',
    title: 'Lead Cabinet Maker — Custom Residential',
    company: 'Heritage Millwork Co.',
    location: 'Denver, CO',
    isVerified: true,
    isNew: true,
    salaryMin: '$58K',
    salaryMax: '$75K',
    salaryNote: 'Annual',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: '🟢 New Today', className: 'jt-new' },
      { label: 'On-site', className: 'jt-onsite' },
      { label: '5+ yrs exp.', className: 'jt-type' },
    ],
    description: 'Seeking a skilled cabinet maker to lead a small crew in our custom residential shop. Strong proficiency with frameless construction, edge banding, and on-site installation required. Blum and Grass hardware experience a plus.',
    metadata: [
      { icon: '📍', label: 'Denver, CO' },
      { icon: '📅', label: 'Posted today' },
      { icon: '👁', label: '84 views' },
    ],
  },
  {
    id: 'job-2',
    logo: 'PP',
    logoColor: 'cl-teal',
    title: 'CNC Programmer & Operator — Biesse / Cabinet Vision',
    company: 'Precision Panel Works',
    location: 'Portland, OR',
    isVerified: true,
    salaryMin: '$65K',
    salaryMax: '$85K',
    salaryNote: 'Annual + OT',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: 'On-site', className: 'jt-onsite' },
      { label: 'CNC', className: 'jt-type' },
      { label: '3+ yrs exp.', className: 'jt-type' },
    ],
    description: 'High-volume flat-panel shop looking for a CNC programmer who can handle Biesse Rover nesting, Cabinet Vision output, and on-the-fly program edits. Strong understanding of tooling paths, spoilboard management, and nested-based manufacturing.',
    metadata: [
      { icon: '📍', label: 'Portland, OR' },
      { icon: '📅', label: '3 days ago' },
      { icon: '👁', label: '218 views' },
    ],
  },
  {
    id: 'job-3',
    logo: 'SI',
    logoColor: 'cl-amber',
    title: 'Architectural Millwork Estimator — Commercial Projects',
    company: 'Signature Interiors',
    location: 'Dallas, TX',
    isVerified: false,
    isUrgent: true,
    salaryMin: '$70K',
    salaryMax: '$90K',
    salaryNote: 'Annual + Commission',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: '🔴 Urgent Hire', className: 'jt-urgent' },
      { label: 'Hybrid', className: 'jt-hybrid' },
      { label: 'Senior', className: 'jt-senior' },
    ],
    description: 'Fast-growing commercial millwork firm needs an experienced estimator to handle hotel, restaurant, and office fit-out projects. Proficiency with AWI specifications, CSI divisions, and takeoff software required. AutoCAD and Bluebeam experience strongly preferred.',
    metadata: [
      { icon: '📍', label: 'Dallas, TX' },
      { icon: '📅', label: '5 days ago' },
      { icon: '👁', label: '392 views' },
      { icon: '💼', label: 'Immediate start' },
    ],
  },
  {
    id: 'job-4',
    logo: 'CV',
    logoColor: 'cl-purple',
    title: 'Cabinet Design & Drafting Specialist — Cabinet Vision Expert',
    company: 'ClearView Cabinet Design',
    location: 'Remote (US)',
    isVerified: false,
    isRemote: true,
    salaryMin: '$55K',
    salaryMax: '$72K',
    salaryNote: 'Annual',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: '🌐 Remote', className: 'jt-remote' },
      { label: 'Cabinet Vision', className: 'jt-type' },
    ],
    description: '100% remote role for an expert Cabinet Vision user — produce production-ready drawings and CNC output for a busy custom cabinet shop. Must be fluent in Cabinet Vision Screen to Machine, frameless and face-frame construction, and door/drawer style libraries.',
    metadata: [
      { icon: '🌐', label: 'Remote — US only' },
      { icon: '📅', label: '1 week ago' },
      { icon: '👁', label: '510 views' },
    ],
  },
  {
    id: 'job-5',
    logo: 'AG',
    logoColor: 'cl-green',
    title: 'Finishing Supervisor — Production Cabinet Shop',
    company: 'Alpine Cabinet Group',
    location: 'Salt Lake City, UT',
    isVerified: true,
    salaryMin: '$55K',
    salaryMax: '$68K',
    salaryNote: 'Annual',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: 'On-site', className: 'jt-onsite' },
      { label: 'Finishing', className: 'jt-type' },
      { label: 'Leadership', className: 'jt-type' },
    ],
    description: 'Manage a 6-person finishing department in a 60,000 sq ft production cabinet shop. Expertise in catalyzed lacquer, water-based conversion varnish, and UV curing required. OSHA 10 and spray booth certification a strong plus.',
    metadata: [
      { icon: '📍', label: 'Salt Lake City, UT' },
      { icon: '📅', label: '1 week ago' },
      { icon: '👁', label: '284 views' },
    ],
  },
  {
    id: 'job-6',
    logo: 'CL',
    logoColor: 'cl-red',
    title: 'Shop Foreman — Custom Millwork & Casework',
    company: 'Craftline Woodworks',
    location: 'Nashville, TN',
    isVerified: false,
    salaryMin: '$62K',
    salaryMax: '$78K',
    salaryNote: 'Annual',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: 'On-site', className: 'jt-onsite' },
      { label: 'Senior', className: 'jt-senior' },
    ],
    description: 'Lead a team of 12 in a growing custom millwork and casework shop. Responsible for production flow, quality control, scheduling coordination with project managers, and mentoring junior craftspeople. AWI Premium grade experience preferred.',
    metadata: [
      { icon: '📍', label: 'Nashville, TN' },
      { icon: '📅', label: '10 days ago' },
      { icon: '👁', label: '196 views' },
    ],
  },
  {
    id: 'job-7',
    logo: 'NW',
    logoColor: 'cl-gray',
    title: 'Millwork Installer — High-End Residential',
    company: 'Northwest Woodcraft',
    location: 'Bellevue, WA',
    isVerified: false,
    isNew: true,
    salaryMin: '$32',
    salaryMax: '$44/hr',
    salaryNote: 'Hourly + OT',
    tags: [
      { label: 'Full-time', className: 'jt-type' },
      { label: '🟢 New', className: 'jt-new' },
      { label: 'On-site / Field', className: 'jt-onsite' },
    ],
    description: 'Install custom cabinetry and architectural millwork in high-end residential and estate projects throughout the Seattle metro. Must be meticulous, able to work independently, and comfortable with scribe fitting, on-site adjustments, and punch-list resolution.',
    metadata: [
      { icon: '📍', label: 'Bellevue, WA' },
      { icon: '📅', label: 'Posted today' },
      { icon: '👁', label: '62 views' },
      { icon: '🚗', label: 'Company vehicle' },
    ],
  },
  {
    id: 'job-8',
    logo: 'BW',
    logoColor: 'cl-teal',
    title: 'Cabinet Shop Apprentice — 3-Year Program, JATC Registered',
    company: 'Benchmark Woodworks',
    location: 'Minneapolis, MN',
    isVerified: false,
    salaryMin: '$18',
    salaryMax: '$26/hr',
    salaryNote: 'Hourly · Scaling',
    tags: [
      { label: 'Apprenticeship', className: 'jt-type' },
      { label: 'Entry Level', className: 'jt-entry' },
      { label: 'On-site', className: 'jt-onsite' },
    ],
    description: 'Registered 3-year apprenticeship program combining hands-on shop production with classroom instruction. No experience required — we\'ll teach everything. Must be reliable, mechanically inclined, and willing to learn. Starting wage scales with demonstrated skill.',
    metadata: [
      { icon: '📍', label: 'Minneapolis, MN' },
      { icon: '📅', label: '2 weeks ago' },
      { icon: '👁', label: '428 views' },
      { icon: '🎓', label: 'No exp. required' },
    ],
  },
];

export const PAGINATION_DATA = {
  currentPage: 1,
  totalPages: 18,
  totalResults: 648,
  perPage: 9,
};

export const SALARY_GUIDE = [
  { role: 'Cabinet Maker', rangeMin: '$48K', rangeMax: '$72K', median: '$58K' },
  { role: 'CNC Operator', rangeMin: '$52K', rangeMax: '$80K', median: '$64K' },
  { role: 'Estimator', rangeMin: '$62K', rangeMax: '$92K', median: '$74K' },
  { role: 'Shop Foreman', rangeMin: '$58K', rangeMax: '$84K', median: '$68K' },
  { role: 'Finishing Tech', rangeMin: '$42K', rangeMax: '$66K', median: '$52K' },
  { role: 'Ops Director', rangeMin: '$88K', rangeMax: '$140K', median: '$108K' },
];

export const TOP_HIRING_COMPANIES = [
  { logo: 'AW', logoColor: 'cl-blue', name: 'Artisan Woodcraft Group', meta: 'Seattle, WA · Architectural', openings: 8 },
  { logo: 'AG', logoColor: 'cl-green', name: 'Alpine Cabinet Group', meta: 'Salt Lake City, UT · Production', openings: 6 },
  { logo: 'PP', logoColor: 'cl-teal', name: 'Precision Panel Works', meta: 'Portland, OR · CNC / Custom', openings: 5 },
  { logo: 'SI', logoColor: 'cl-amber', name: 'Signature Interiors', meta: 'Dallas, TX · Commercial', openings: 4 },
  { logo: 'HM', logoColor: 'cl-brown', name: 'Heritage Millwork Co.', meta: 'Denver, CO · Custom Res.', openings: 3 },
];

export const POST_JOB_CTA = {
  eyebrow: 'For Employers',
  title: 'Find Your Next Great Hire',
  description: '24,800 industry professionals see every listing. Reach cabinet makers, CNC operators, estimators, and supervisors who actually know the trade.',
  tiers: [
    { name: 'Single listing', price: '$149 / 30 days' },
    { name: 'Featured listing', price: '$299 / 60 days' },
    { name: 'Company subscription', price: '$499 / month' },
    { name: 'Recruiter account', price: '$899 / month' },
  ],
};

export const TALENT_CTA = {
  title: 'Looking for work?',
  description: 'Create a free talent profile and let employers find you. 312 companies are actively hiring on Millwork.io right now.',
};
