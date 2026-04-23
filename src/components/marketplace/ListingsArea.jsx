import ListingSection from './ListingSection.jsx';
import SellCTA from './SellCTA.jsx';

export default function ListingsArea({ recent }) {
  const list = recent || [];
  return (
    <div className="listings-col">
      <div className="listings-toolbar">
        <div className="listings-count">
          Showing <strong>{list.length} listings</strong>
        </div>
        <div className="toolbar-right">
          <select className="sort-select">
            <option>Newest first</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Ending soon (Auction)</option>
            <option>Closest to me</option>
          </select>
          <div className="view-toggle">
            <button className="view-btn active" title="Grid">
              ⊞
            </button>
            <button className="view-btn" title="List">
              ☰
            </button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No listings yet. Be the first to post.
        </div>
      ) : (
        <ListingSection title="🆕 Latest Listings" link={`${list.length} listings`} listings={list} />
      )}

      <SellCTA />
    </div>
  );
}
