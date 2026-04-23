import { CONTACT_INFO } from '../../data/supplierProfileData.js';

export default function ContactCard() {
  return (
    <div className="contact">
      <div className="contact-head">
        <div className="contact-head-title">Contact Blum</div>
        <div className="contact-head-sub">US team responds within 1 business day</div>
      </div>
      <div className="contact-rows">
        <div className="cro">
          <span className="cro-icon">🌐</span>
          <div>
            <div className="cro-lbl">Website</div>
            <div className="cro-val">
              <a href="#">{CONTACT_INFO.website}</a>
            </div>
          </div>
        </div>
        <div className="cro">
          <span className="cro-icon">📞</span>
          <div>
            <div className="cro-lbl">US Toll-Free</div>
            <div className="cro-val">{CONTACT_INFO.phone}</div>
          </div>
        </div>
        <div className="cro">
          <span className="cro-icon">📧</span>
          <div>
            <div className="cro-lbl">Email</div>
            <div className="cro-val">
              <a href="#">{CONTACT_INFO.email}</a>
            </div>
          </div>
        </div>
        <div className="cro">
          <span className="cro-icon">📍</span>
          <div>
            <div className="cro-lbl">US Headquarters</div>
            <div className="cro-val">{CONTACT_INFO.address}</div>
          </div>
        </div>
        <div className="cro">
          <span className="cro-icon">🕐</span>
          <div>
            <div className="cro-lbl">Support Hours</div>
            <div className="cro-val">{CONTACT_INFO.hours}</div>
          </div>
        </div>
      </div>
      <div className="contact-btns">
        <button className="cta1">Send a Message →</button>
        <button className="cta2">Request Samples</button>
        <button className="cta2">↓ Download Catalog</button>
      </div>
    </div>
  );
}
