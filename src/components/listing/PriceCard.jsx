import { useState } from 'react';
import { PRICE_INFO } from '../../data/listingData.js';

export default function PriceCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="price-card">
        <div className="price-card-header">
          <div className="price-main">{PRICE_INFO.main}</div>
          <div className="price-note">{PRICE_INFO.note}</div>
          <div className="price-financing">{PRICE_INFO.financing}</div>
        </div>

        <div className="price-card-body">
          <button className="btn-contact-seller" onClick={() => setModalOpen(true)}>
            📞 Contact Seller
          </button>
          <button className="btn-make-offer" onClick={() => setModalOpen(true)}>
            💬 Make an Offer
          </button>
          <div className="btn-row">
            <button className="btn-icon">🔖 Save</button>
            <button className="btn-icon">↗ Share</button>
            <button className="btn-icon">🖨 Print</button>
            <button className="btn-icon">⚠️ Report</button>
          </div>
        </div>

        <div className="price-card-footer">
          {PRICE_INFO.checks.map((check, idx) => (
            <div key={idx} className="pf-item">
              <span className="pf-check">✓</span>
              {check}
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT MODAL */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Contact Seller</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-listing-ref">
                <div className="mlr-icon">🖥️</div>
                <div className="mlr-text">
                  <strong>Biesse Rover A FT 1536 CNC — 5-Axis</strong>
                  Listing #GH-4821 &nbsp;·&nbsp; $68,500 &nbsp;·&nbsp; Seattle, WA
                </div>
              </div>
              <div className="modal-fields">
                <div className="mf-row">
                  <div>
                    <div className="mf-label">Your Name</div>
                    <input className="mf-input" type="text" placeholder="Tom Kowalski" />
                  </div>
                  <div>
                    <div className="mf-label">Phone</div>
                    <input className="mf-input" type="tel" placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div>
                  <div className="mf-label">Email</div>
                  <input className="mf-input" type="email" placeholder="tom@heritagemill.com" />
                </div>
                <div>
                  <div className="mf-label">Your Message</div>
                  <textarea className="mf-textarea" placeholder="Hi — I'm interested in the Biesse Rover A FT. Can you share the full service records? I'm in Colorado and can arrange transport. What's your timeline for the sale?">
                    Hi — I'm interested in the Biesse Rover A FT. Can you share the full service records? I'm in Colorado and can arrange transport. What's your timeline for the sale?
                  </textarea>
                </div>
              </div>
              <div className="modal-checkboxes">
                <label>
                  <input type="checkbox" defaultChecked /> I'm interested in arranging an inspection
                </label>
                <label>
                  <input type="checkbox" /> I'm interested in financing options
                </label>
                <label>
                  <input type="checkbox" /> I can arrange local pickup
                </label>
              </div>
              <button className="modal-submit">Send Message to Seller →</button>
              <div className="modal-note">
                Your contact info is shared only with this seller. GrainHub does not share your details with third parties.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
