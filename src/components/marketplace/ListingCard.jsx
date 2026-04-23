export default function ListingCard({ listing, section }) {
  // Determine category badge color based on section
  let catBadgeClass = 'cb-machinery';
  if (section.includes('Lumber')) catBadgeClass = 'cb-lumber';
  else if (section.includes('Sheet')) catBadgeClass = 'cb-sheet';
  else if (section.includes('Vehicle')) catBadgeClass = 'cb-vehicle';
  else if (section.includes('Surplus')) catBadgeClass = 'cb-surplus';
  else if (section.includes('Finishing')) catBadgeClass = 'cb-finishing';

  // Determine condition badge color
  let condClass = 'cond-excellent';
  if (listing.condition.includes('Good')) condClass = 'cond-good';
  else if (listing.condition.includes('Fair')) condClass = 'cond-fair';
  else if (listing.condition.includes('New')) condClass = 'cond-new';

  return (
    <div className="listing-card">
      <div className={`card-img-area ${listing.imgClass}`} style={listing.imgStyle}>
        {listing.emoji}
        <button className="card-save-btn">🔖</button>
        {listing.isNew && <span className="new-badge">NEW</span>}
        {listing.badge && <span className="new-badge">{listing.badge}</span>}
      </div>
      <div className="card-content">
        <div className="card-cat-row">
          <span className={`cat-badge ${catBadgeClass}`}>{listing.category}</span>
          <span className={`cond-badge ${condClass}`}>{listing.condition}</span>
        </div>
        <div className="card-title">{listing.title}</div>
        <div className="card-specs">
          {listing.year && (
            <div className="card-spec">
              📅 {listing.year} &nbsp;·&nbsp; 📍 {listing.location}
            </div>
          )}
          {!listing.year && (
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
    </div>
  );
}
