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
      <button className="sp-btn">Learn More &amp; Download Spec →</button>
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
        <button className="sidebar-post-btn">Post a Job — from $149/month</button>
        <button className="sidebar-outline-btn">Browse All 142 Openings →</button>
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
          <div key={m.title} className="machine-item">
            <div className="machine-thumb">{m.thumb}</div>
            <div>
              <div className="machine-title">{m.title}</div>
              <div className="machine-price">{m.price}</div>
              <div className="machine-loc">{m.loc}</div>
            </div>
          </div>
        ))}
        <button className="sidebar-post-btn secondary">List Your Machine — from $29</button>
        <button className="sidebar-outline-btn">Browse 890 Listings →</button>
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
            <div key={s.label} className="supplier-link">
              <span className="supplier-icon">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
        <button className="sidebar-outline-btn">List Your Company — from $299/yr</button>
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
