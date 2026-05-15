import { useState } from 'react';
import { PRICE_INFO } from '../../data/listingData.js';

export default function PriceCard({ listing }) {
  const [modalOpen, setModalOpen] = useState(false);

  const displayPrice = listing && listing.price ? listing.price : PRICE_INFO.main;
  const displayNote = listing ? '' : PRICE_INFO.note;
  const displayFinancing = listing ? '' : PRICE_INFO.financing;

  return (
    <>
      <div className="price-card">
        <div className="price-card-header">
          <div className="price-main">{displayPrice}</div>
          {displayNote && <div className="price-note">{displayNote}</div>}
          {displayFinancing && <div className="price-financing">{displayFinancing}</div>}
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
              {listing && (
                <div className="modal-listing-ref">
                  <div className="mlr-icon">🖥️</div>
                  <div className="mlr-text">
                    <strong>{listing.title}</strong>
                    {listing.price} · {listing.location}
                  </div>
                </div>
              )}
              <div className="modal-fields">
                <div className="mf-row">
                  <div>
                    <div className="mf-label">Your Name</div>
                    <input className="mf-input" type="text" placeholder="Your name" />
                  </div>
                  <div>
                    <div className="mf-label">Phone</div>
                    <input className="mf-input" type="tel" placeholder="(555) 000-0000" />
                  </div>
                </div>
                <div>
                  <div className="mf-label">Email</div>
                  <input className="mf-input" type="email" placeholder="you@example.com" />
                </div>
                <div>
                  <div className="mf-label">Your Message</div>
                  <textarea className="mf-textarea" placeholder="Hi — I'm interested in this listing. Can you share more details?" defaultValue="" />
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
                Your contact info is shared only with this seller. AWI Florida Chapter does not share your details with third parties.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
