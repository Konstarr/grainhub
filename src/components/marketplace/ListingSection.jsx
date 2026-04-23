import ListingCard from './ListingCard.jsx';

export default function ListingSection({ title, link, listings }) {
  return (
    <>
      <div className="section-label">
        {title}
        <span className="section-link">{link}</span>
      </div>
      <div className="listings-grid">
        {listings.map((listing, idx) => (
          <ListingCard key={idx} listing={listing} section={title} />
        ))}
      </div>
    </>
  );
}
