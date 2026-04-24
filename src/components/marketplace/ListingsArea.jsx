import ListingSection from './ListingSection.jsx';
import SellCTA from './SellCTA.jsx';

export default function ListingsArea({ listings, totalCount, sortMode, onSortChange, viewMode, onViewChange }) {
  const list = listings || [];
  const filtered = totalCount != null && list.length !== totalCount;

  return (
    <div className="listings-col">
      <div className="listings-toolbar">
        <div className="listings-count">
          Showing <strong>{list.length} listing{list.length === 1 ? '' : 's'}</strong>
          {filtered && <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}> of {totalCount}</span>}
        </div>
        <div className="toolbar-right">
          <select
            className="sort-select"
            value={sortMode || 'newest'}
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div className="view-toggle">
            <button
              type="button"
              className={'view-btn ' + (viewMode === 'grid' ? 'active' : '')}
              title="Grid"
              onClick={() => onViewChange && onViewChange('grid')}
            >
              ⊞
            </button>
            <button
              type="button"
              className={'view-btn ' + (viewMode === 'list' ? 'active' : '')}
              title="List"
              onClick={() => onViewChange && onViewChange('list')}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No listings match your filters. Try clearing them.
        </div>
      ) : (
        <ListingSection
          title="🆕 Latest Listings"
          link={list.length + ' listing' + (list.length === 1 ? '' : 's')}
          listings={list}
          viewMode={viewMode}
        />
      )}

      <SellCTA />
    </div>
  );
}
