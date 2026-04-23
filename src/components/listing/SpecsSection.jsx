import { SPECS } from '../../data/listingData.js';

export default function SpecsSection() {
  return (
    <div className="specs-section">
      <div className="specs-header">
        <div className="specs-header-title">Machine Specifications</div>
        <div className="specs-header-badge">As verified by seller</div>
      </div>
      <div className="specs-body">
        <div className="specs-grid">
          {SPECS.map((spec, idx) => (
            <div key={idx} className="spec-cell">
              <span className="spec-label">{spec.label}</span>
              <span className={`spec-val ${spec.color ? spec.color : ''}`}>{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
