import { SALES_REPS } from '../../data/supplierProfileData.js';

export default function SalesRepsCard() {
  return (
    <div className="sc">
      <div className="sc-head">👤 Find Your Sales Rep</div>
      <div className="sc-body">
        {SALES_REPS.map((rep) => (
          <div key={rep.name} className="rep-row">
            <div className="rep-av">{rep.av}</div>
            <div>
              <div className="rep-name">{rep.name}</div>
              <div className="rep-region">{rep.region}</div>
            </div>
            <span className="rep-cta">Contact →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
