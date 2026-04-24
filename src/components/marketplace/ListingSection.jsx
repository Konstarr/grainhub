import ListingCard from './ListingCard.jsx';

export default function ListingSection({ title, link, listings, viewMode }) {
  const gridClass = viewMode === 'list' ? 'listings-list' : 'listings-grid';
  return (
    <>
      <div className="section-label">
        {title}
        <span className="section-link">{link}</span>
      </div>
      <div className={gridClass}>
        {listings.map((listing, idx) => (
          <ListingCard key={listing.id || idx} listing={listing} section={title} viewMode={viewMode} />
        ))}
      </div>
    </>
  );
}
