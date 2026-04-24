import { QUICK_DETAILS } from '../../data/listingData.js';

export default function QuickDetails({ listing }) {
  const rows = listing ? [
    { label: 'Category', value: listing.category || '—' },
    { label: 'Condition', value: listing.condition || '—' },
    { label: 'Location', value: listing.location || '—' },
    { label: 'Price', value: listing.price || '—' },
    listing.trade && { label: 'Trade', value: listing.trade },
  ].filter(Boolean) : QUICK_DETAILS;

  return (
    <div className="details-card">
      <div className="dc-header">Quick Details</div>
      <div className="dc-body">
        {rows.map((detail, idx) => (
          <div key={idx} className="dc-row">
            <span className="dc-label">{detail.label}</span>
            <span className={'dc-val ' + (detail.color || '')}>{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
