import { Link } from 'react-router-dom';
import { JOB_LISTINGS, MACHINERY_LISTINGS, SUPPLIER_LINKS } from '../../data/homeData.js';

function SponsorAd() {
  return (
    <div className="sponsor-ad">
      <div className="sp-label">Featured Sponsor</div>
      <div className="sp-title">Blum SERVO-DRIVE for Aventos</div>
      <div className="sp-sub">
        Effortless electronic opening of lift systems for all panel sizes — touch-to-open, fully
        integrated.
      </div>
      <Link to="/sponsor" className="sp-btn">Learn More &amp; Download Spec →</Link>
    </div>
  );
}

function JobsCard() {
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Latest Job Postings</div>
      <div className="sidebar-card-body">
        {JOB_LISTINGS.map((job) => (
          <div key={job.title} className="job-item">
            <div className="job-title">{job.title}</div>
            <div className="job-company">{job.company}</div>
            <div className="job-tags">
              {job.tags.map((t) => (
                <span key={t.label} className={`job-tag ${t.kind}`}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        ))}
        <Link to="/sponsor" className="sidebar-post-btn">Post a Job — from $149/month</Link>
        <Link to="/jobs" className="sidebar-outline-btn">Browse All 142 Openings →</Link>
      </div>
    </div>
  );
}

function MachineryCard() {
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Machinery Marketplace</div>
      <div className="sidebar-card-body">
        {MACHINERY_LISTINGS.map((m) => (
          <Link key={m.title} to="/marketplace/listing" className="machine-item">
            <div className="machine-thumb">{m.thumb}</div>
            <div>
              <div className="machine-title">{m.title}</div>
              <div className="machine-price">{m.price}</div>
              <div className="machine-loc">{m.loc}</div>
            </div>
          </Link>
        ))}
        <Link to="/sponsor" className="sidebar-post-btn secondary">List Your Machine — from $29</Link>
        <Link to="/marketplace" className="sidebar-outline-btn">Browse 890 Listings →</Link>
      </div>
    </div>
  );
}

function SupplierCard() {
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Supplier Directory</div>
      <div className="sidebar-card-body compact">
        <div className="supplier-links">
          {SUPPLIER_LINKS.map((s) => (
            <Link key={s.label} to="/suppliers/profile" className="supplier-link">
              <span className="supplier-icon">{s.icon}</span>
              {s.label}
            </Link>
          ))}
        </div>
        <Link to="/sponsor" className="sidebar-outline-btn">List Your Company — from $299/yr</Link>
      </div>
    </div>
  );
}

function NewsletterCard() {
  return (
    <div className="newsletter-card">
      <div className="nl-title">The Weekly Grain</div>
      <div className="nl-sub">
        Industry news, forum highlights, and machinery deals — delivered every Tuesday morning.
      </div>
      <div className="nl-input-row">
        <input className="nl-input" type="email" placeholder="your@email.com" />
        <button className="nl-btn">Subscribe</button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <SponsorAd />
      <JobsCard />
      <MachineryCard />
      <SupplierCard />
      <NewsletterCard />
    </aside>
  );
}
