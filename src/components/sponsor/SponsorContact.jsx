import { useState } from 'react';
import { FAQS } from '../../data/sponsorData.js';

export default function SponsorContact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    budgetRange: '',
    interestedIn: '',
    goals: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sponsor inquiry form submitted:', formData);
    alert('Thank you for your inquiry! We will be in touch within 24 hours.');
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      budgetRange: '',
      interestedIn: '',
      goals: '',
    });
  };

  return (
    <section className="sponsor-section sponsor-contact-section" id="sponsor-contact">
      <div className="sponsor-section-inner">
        <div className="sponsor-contact-grid">
          <div>
            <div className="sponsor-section-eyebrow">Get In Touch</div>
            <h2 className="sponsor-section-title" style={{ marginBottom: '1.5rem' }}>
              Let's build the right<br />
              <em>package for you.</em>
            </h2>

            <div className="sponsor-contact-detail">
              <div className="sponsor-cd-icon">📧</div>
              <div>
                <div className="sponsor-cd-title">Email Us</div>
                <div className="sponsor-cd-text">
                  <a className="sponsor-cd-link" href="mailto:sponsors@millwork.io">
                    sponsors@millwork.io
                  </a>
                  <br />
                  We respond within one business day.
                </div>
              </div>
            </div>

            <div className="sponsor-contact-detail">
              <div className="sponsor-cd-icon">📞</div>
              <div>
                <div className="sponsor-cd-title">Call Us</div>
                <div className="sponsor-cd-text">
                  <a className="sponsor-cd-link" href="tel:+18005551234">
                    1-800-555-1234
                  </a>
                  <br />
                  Mon–Fri, 9am–5pm Eastern
                </div>
              </div>
            </div>

            <div className="sponsor-contact-detail">
              <div className="sponsor-cd-icon">📄</div>
              <div>
                <div className="sponsor-cd-title">Download the Media Kit</div>
                <div className="sponsor-cd-text">
                  Full audience data, ad specs, editorial calendar, and rate card —{' '}
                  <a className="sponsor-cd-link" href="#">
                    download PDF
                  </a>
                  .
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Frequently Asked Questions
              </div>
              {FAQS.map((faq) => (
                <div key={faq.q} className="sponsor-faq-item">
                  <div className="sponsor-faq-q">{faq.q}</div>
                  <div className="sponsor-faq-a">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sponsor-contact-form">
            <div className="sponsor-cf-header">
              <div className="sponsor-cf-header-title">Request a Sponsorship Package</div>
              <div className="sponsor-cf-header-sub">
                We'll follow up within one business day with a custom proposal.
              </div>
            </div>
            <div className="sponsor-cf-body">
              <form onSubmit={handleSubmit}>
                <div className="sponsor-form-row">
                  <div className="sponsor-form-group">
                    <label className="sponsor-form-label">First Name</label>
                    <input
                      className="sponsor-form-input"
                      type="text"
                      placeholder="Jane"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sponsor-form-group">
                    <label className="sponsor-form-label">Last Name</label>
                    <input
                      className="sponsor-form-input"
                      type="text"
                      placeholder="Smith"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sponsor-form-group">
                  <label className="sponsor-form-label">Company</label>
                  <input
                    className="sponsor-form-input"
                    type="text"
                    placeholder="Acme Hardware Co."
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="sponsor-form-group">
                  <label className="sponsor-form-label">Email</label>
                  <input
                    className="sponsor-form-input"
                    type="email"
                    placeholder="jane@company.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="sponsor-form-row">
                  <div className="sponsor-form-group">
                    <label className="sponsor-form-label">Phone</label>
                    <input
                      className="sponsor-form-input"
                      type="tel"
                      placeholder="(555) 000-0000"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sponsor-form-group">
                    <label className="sponsor-form-label">Budget Range</label>
                    <select
                      className="sponsor-form-select"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                    >
                      <option value="">Select a range</option>
                      <option value="under-1k">Under $1,000/month</option>
                      <option value="1k-3k">$1,000–$3,000/month</option>
                      <option value="3k-6k">$3,000–$6,000/month</option>
                      <option value="6k-plus">$6,000+/month (Platinum)</option>
                    </select>
                  </div>
                </div>

                <div className="sponsor-form-group">
                  <label className="sponsor-form-label">Interested In</label>
                  <select
                    className="sponsor-form-select"
                    name="interestedIn"
                    value={formData.interestedIn}
                    onChange={handleChange}
                  >
                    <option value="">Select a package</option>
                    <option value="category">Category Sponsor ($600/mo)</option>
                    <option value="site">Site Sponsor ($2,400/mo)</option>
                    <option value="platinum">Platinum Partner (Custom)</option>
                    <option value="newsletter">Newsletter Sponsorship ($800/issue)</option>
                    <option value="alacarte">À La Carte Placement</option>
                    <option value="unsure">Not sure — tell me what fits</option>
                  </select>
                </div>

                <div className="sponsor-form-group">
                  <label className="sponsor-form-label">Tell Us About Your Goals</label>
                  <textarea
                    className="sponsor-form-textarea"
                    placeholder="What products or categories are you promoting? Who are you trying to reach? Any specific goals or timeline?"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button type="submit" className="sponsor-form-submit">
                  Send Request →
                </button>
                <div className="sponsor-form-note">
                  No commitment required. We'll send a custom proposal within 24 hours.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
