import { SAFETY_TIPS } from '../../data/listingData.js';

export default function SafetyCard() {
  return (
    <div className="safety-card">
      <div className="safety-title">🛡 Buying Safely on AWI Florida Chapter</div>
      <div className="safety-items">
        {SAFETY_TIPS.map((tip, idx) => (
          <div key={idx} className="safety-item">
            <span className="safety-check">✓</span>
            {tip.replace('✓ ', '')}
          </div>
        ))}
      </div>
      <div className="report-link">🚩 Report this listing as suspicious</div>
    </div>
  );
}
