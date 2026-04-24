import { Link } from 'react-router-dom';

export default function ListingCard({ listing, section }) {
  let catBadgeClass = 'cb-machinery';
  if (section && section.includes('Lumber')) catBadgeClass = 'cb-lumber';
  else if (section && section.includes('Sheet')) catBadgeClass = 'cb-sheet';
  else if (section && section.includes('Vehicle')) catBadgeClass = 'cb-vehicle';
  else if (section && section.includes('Surplus')) catBadgeClass = 'cb-surplus';
  else if (section && section.includes('Finishing')) catBadgeClass = 'cb-finishing';

  const condition = listing.condition || '';
  let condClass = 'cond-excellent';
  if (condition.includes('Good')) condClass = 'cond-good';
  else if (condition.includes('Fair')) condClass = 'cond-fair';
  else if (condition.includes('New')) condClass = 'cond-new';

  const firstImage = Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : null;
  const imgStyle = firstImage
    ? { background: 'url("' + firstImage + '") center/cover no-repeat' }
    : listing.imgStyle;

  return (
    <Link to="/marketplace/listing" className="listing-card">
      <div className={'card-img-area ' + (firstImage ? '' : (listing.imgClass || ''))} style={imgStyle}>
        {firstImage ? null : listing.emoji}
        <button className="card-save-btn">🔖</button>
        {listing.isNew && <span className="new-badge">NEW</span>}
        {listing.badge && <span className="new-badge">{listing.badge}</span>}
      </div>
      <div className="card-content">
        <div className="card-cat-row">
          <span className={'cat-badge ' + catBadgeClass}>{listing.category}</span>
          <span className={'cond-badge ' + condClass}>{listing.condition}</span>
        </div>
        <div className="card-title">{listing.title}</div>
        <div className="card-specs">
          {listing.year && (
            <div className="card-spec">
              📅 {listing.year} &nbsp;·&nbsp; 📍 {listing.location}
            </div>
          )}
          {listing.year === undefined && (
            <div className="card-spec">
              📍 {listing.location} &nbsp;·&nbsp; {listing.shipping}
            </div>
          )}
          {listing.specs && <div className="card-spec">{listing.specs}</div>}
          {listing.meta && <div className="card-spec">{listing.meta}</div>}
        </div>
        <div className="card-footer">
          <div className="card-price" style={listing.price === 'Make Offer' ? { fontSize: '14px', fontFamily: "'DM Sans',sans-serif", color: 'var(--text-secondary)' } : {}}>
            {listing.price}
            {listing.priceUnit && <span style={{ fontSize: '12px', fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)' }}>{listing.priceUnit}</span>}
          </div>
          <button className="card-contact">Contact</button>
        </div>
      </div>
    </Link>
  );
}
