import { SALES_REPS } from '../../data/supplierProfileData.js';

// supplier prop accepted for forward-compat; sales reps still pulled
// from the static demo data until we wire a supplier_sales_reps table.
export default function SalesRepsCard({ supplier }) { // eslint-disable-line no-unused-vars
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
