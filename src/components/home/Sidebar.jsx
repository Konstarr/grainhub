import { Link } from 'react-router-dom';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';
import { mapJobRow, mapMarketplaceRow } from '../../lib/mappers.js';

function JobsCard() {
  const { data: rows } = useSupabaseList('jobs', {
    filter: (q) => q.eq('is_approved', true).eq('is_filled', false),
    order: { column: 'posted_at', ascending: false },
    limit: 3,
  });
  const jobs = rows.map(mapJobRow);
  if (jobs.length === 0) return null;
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Latest Job Postings</div>
      <div className="sidebar-card-body">
        {jobs.map((job) => (
          <div key={job.id} className="job-item">
            <div className="job-title">{job.title}</div>
            <div className="job-company">{job.company}</div>
            <div className="job-tags">
              {(job.tags || []).map((t) => (
                <span key={t.label} className={`job-tag ${t.className || ''}`}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        ))}
        <Link to="/sponsor" className="sidebar-post-btn">Post a Job</Link>
        <Link to="/jobs" className="sidebar-outline-btn">Browse All Openings →</Link>
      </div>
    </div>
  );
}

function MachineryCard() {
  const { data: rows } = useSupabaseList('marketplace_listings', {
    filter: (q) => q.eq('is_approved', true).eq('is_sold', false),
    order: { column: 'created_at', ascending: false },
    limit: 3,
  });
  const items = rows.map(mapMarketplaceRow);
  if (items.length === 0) return null;
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Marketplace</div>
      <div className="sidebar-card-body">
        {items.map((m) => (
          <Link key={m.id} to="/marketplace/listing" className="machine-item">
            <div className="machine-thumb">📦</div>
            <div>
              <div className="machine-title">{m.title}</div>
              <div className="machine-price">{m.price || 'Contact'}</div>
              <div className="machine-loc">{m.location || ''}</div>
            </div>
          </Link>
        ))}
        <Link to="/sponsor" className="sidebar-post-btn secondary">List Something</Link>
        <Link to="/marketplace" className="sidebar-outline-btn">Browse Marketplace →</Link>
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
      <JobsCard />
      <MachineryCard />
      <NewsletterCard />
    </aside>
  );
}
