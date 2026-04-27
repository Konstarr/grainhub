/**
 * Shape mappers: convert DB rows -> the shapes the UI components expect.
 */

const LOGO_PALETTE = [
  'cl-blue', 'cl-green', 'cl-teal', 'cl-amber', 'cl-brown',
  'cl-purple', 'cl-red', 'cl-gray',
];

function logoColorForSlug(slug = '') {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return LOGO_PALETTE[Math.abs(h) % LOGO_PALETTE.length];
}

function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDollars(n) {
  if (n == null) return '';
  if (n < 1000) return '$' + n;
  return '$' + Math.round(n / 1000) + 'K';
}

function daysAgo(iso) {
  if (iso == null) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return '1 day ago';
  if (days < 7) return days + ' days ago';
  if (days < 14) return '1 week ago';
  if (days < 30) return Math.floor(days / 7) + ' weeks ago';
  if (days < 60) return '1 month ago';
  return Math.floor(days / 30) + ' months ago';
}

// JOBS
export function mapJobRow(row) {
  const period = row.salary_period || 'year';
  const salaryMin = row.salary_min == null ? null : (period === 'hour' ? '$' + row.salary_min : formatDollars(row.salary_min));
  const salaryMax = row.salary_max == null ? null : (period === 'hour' ? '$' + row.salary_max + '/hr' : formatDollars(row.salary_max));
  const salaryNote = period === 'hour' ? 'Hourly' : 'Annual';

  const tags = [];
  if (row.employment_type) {
    const map = {
      'full-time': { label: 'Full-time', className: 'jt-type' },
      'part-time': { label: 'Part-time', className: 'jt-type' },
      'contract':  { label: 'Contract',  className: 'jt-type' },
      'apprenticeship': { label: 'Apprenticeship', className: 'jt-type' },
    };
    const t = map[row.employment_type];
    if (t) tags.push(t);
  }
  const posted = daysAgo(row.posted_at);
  if (posted === 'Posted today' || posted === '1 day ago') {
    tags.push({ label: 'New', className: 'jt-new' });
  }
  tags.push({ label: 'On-site', className: 'jt-onsite' });

  return {
    id: row.id,
    logo: initials(row.company),
    logoColor: logoColorForSlug(row.company || ''),
    title: row.title,
    company: row.company,
    location: row.location,
    isVerified: false,
    isNew: posted === 'Posted today' || posted === '1 day ago',
    salaryMin,
    salaryMax,
    salaryNote,
    tags,
    description: row.description,
    applyUrl: row.apply_url || null,
    applyEmail: row.apply_email || null,
    metadata: [
      { icon: '\u{1F4CD}', label: row.location },
      { icon: '\u{1F4C5}', label: posted },
    ],
  };
}

// EVENTS
export function mapEventRow(row) {
  const start = row.start_date ? new Date(row.start_date) : null;
  const end = row.end_date ? new Date(row.end_date) : null;
  const fmt = (d) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const sameDay = start && end && start.toDateString() === end.toDateString();
  const dateStr = start && end && (sameDay === false)
    ? fmt(start) + ' - ' + fmt(end)
    : fmt(start);

  const typeMap = {
    'trade-show': { label: 'Trade Show', color: 'green' },
    'conference': { label: 'Conference', color: 'blue' },
    'workshop':   { label: 'Workshop',   color: 'amber' },
    'meetup':     { label: 'Meetup',     color: 'purple' },
  };
  const type = typeMap[row.event_type] || { label: row.event_type || 'Event', color: 'default' };

  const gradients = [
    'linear-gradient(135deg, #1A3A10 0%, #3A6A20 100%)',
    'linear-gradient(135deg, #1C0E05 0%, #6B3820 100%)',
    'linear-gradient(135deg, #0F2838 0%, #2A5880 100%)',
    'linear-gradient(135deg, #3D1A2A 0%, #8B3860 100%)',
    'linear-gradient(135deg, #2A2010 0%, #8B6820 100%)',
    'linear-gradient(135deg, #102828 0%, #2A7070 100%)',
  ];
  let h = 0;
  const s = row.slug || '';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const imgGradient = gradients[Math.abs(h) % gradients.length];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: type.label,
    categoryColor: type.color,
    date: dateStr,
    location: row.is_online ? 'Online' : (row.location || row.venue_name || ''),
    excerpt: row.description ? row.description.slice(0, 240) + (row.description.length > 240 ? '…' : '') : '',
    imgGradient,
    attendees: row.is_online ? 'Online event' : 'In-person',
    price: row.registration_url ? 'Register →' : 'Details',
    registrationUrl: row.registration_url,
    isOnline: Boolean(row.is_online),
    trade: row.trade,
    coverImage: row.cover_image_url || null,
  };
}

// SUPPLIERS
export function mapSupplierRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind || 'vendor',
    name: row.name,
    category: row.category,
    trade: row.trade,
    logo: row.logo_initials || initials(row.name),
    logoColor: logoColorForSlug(row.slug || row.name),
    description: row.description,
    website: row.website,
    phone: row.phone,
    email: row.email,
    address: row.address,
    rating: row.rating == null ? null : Number(row.rating).toFixed(1),
    reviewCount: row.review_count || 0,
    badges: row.badges || [],
    isVerified: Boolean(row.is_verified),
    logoUrl: row.logo_url || null,
  };
}

// WIKI
export function mapWikiRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    trade: row.trade,
    excerpt: row.excerpt,
    body: row.body,
    readTime: row.read_time_minutes ? row.read_time_minutes + ' min read' : '',
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    coverImage: row.cover_image_url || null,
  };
}

// NEWS
export function mapNewsRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    trade: row.trade,
    excerpt: row.excerpt,
    body: row.body,
    date: row.published_at ? new Date(row.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    publishedAt: row.published_at,
    sourceUrl: row.source_url,
    coverImage: row.cover_image_url || null,
  };
}

// MARKETPLACE
export function mapMarketplaceRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    trade: row.trade,
    condition: row.condition,
    price: row.price == null ? null : '$' + Number(row.price).toLocaleString(),
    priceNumeric: row.price,
    description: row.description,
    location: row.location,
    isSold: Boolean(row.is_sold),
    isApproved: row.is_approved !== false,
    sellerId: row.seller_id || null,
    images: row.images || [],
    createdAt: row.created_at,
  };
}

// Strip HTML / markdown / extra whitespace from a post body so we can show a
// clean one-line preview in the activity list.
function snippet(body, max = 180) {
  if (!body) return '';
  const text = String(body)
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

// FORUM THREADS
export function mapThreadRow(row) {
  const la = row.last_author || null;
  const lastAuthorName = (la && (la.full_name || la.username)) || null;
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    title: row.title,
    isPinned: Boolean(row.is_pinned),
    isLocked: Boolean(row.is_locked),
    isSolved: Boolean(row.is_solved),
    viewCount: row.view_count || 0,
    replyCount: row.reply_count || 0,
    createdAt: row.created_at,
    createdAgo: daysAgo(row.created_at),
    lastReplyAt: row.last_reply_at,
    lastReplyAgo: daysAgo(row.last_reply_at),
    lastAuthor: lastAuthorName,
    lastAuthorUsername: la?.username || null,
    lastAuthorAvatar: la?.avatar_url || null,
    lastSnippet: snippet(row.last_post?.body || '', 180),
  };
}
