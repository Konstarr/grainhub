import { CONDITION_ITEMS } from '../../data/listingData.js';

export default function ConditionSection() {
  return (
    <div className="condition-section">
      <div className="condition-header">
        <div className="condition-title">Condition Report</div>
        <span className="condition-badge-large">✓ Excellent</span>
      </div>
      <div className="condition-items">
        {CONDITION_ITEMS.map((item, idx) => (
          <div key={idx} className="condition-item">
            <div className="ci-icon">{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="ci-label">{item.label}</div>
              <div className="ci-desc">{item.description}</div>
            </div>
            <span className={`ci-status ${item.statusClass}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
