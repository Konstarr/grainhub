import { QUICK_DETAILS } from '../../data/listingData.js';

export default function QuickDetails() {
  return (
    <div className="details-card">
      <div className="dc-header">Quick Details</div>
      <div className="dc-body">
        {QUICK_DETAILS.map((detail, idx) => (
          <div key={idx} className="dc-row">
            <span className="dc-label">{detail.label}</span>
            <span className={`dc-val ${detail.color ? detail.color : ''}`}>{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
