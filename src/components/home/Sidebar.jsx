import { Link } from 'react-router-dom';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';

/**
 * Home sidebar — chapter-focused. Surfaces upcoming chapter events,
 * a CTA to join the chapter, and the weekly digest signup.
 */

function EventsCard() {
  // Pull the next 3 upcoming chapter events from Supabase.
  const { data: rows } = useSupabaseList('events', {
    filter: (q) => q.eq('is_approved', true).gte('starts_at', new Date().toISOString()),
    order: { column: 'starts_at', ascending: true },
    limit: 3,
  });
  if (!rows || rows.length === 0) {
    return (
      <div className="sidebar-card">
        <div className="sidebar-card-header">Upcoming chapter events</div>
        <div className="sidebar-card-body">
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0' }}>
            No upcoming events scheduled. Check back soon.
          </div>
          <Link to="/events" className="sidebar-outline-btn">Browse all events →</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Upcoming chapter events</div>
      <div className="sidebar-card-body">
        {rows.map((e) => {
          const when = e.starts_at ? new Date(e.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          return (
            <Link key={e.id} to={e.slug ? `/events/${e.slug}` : '/events'} className="job-item">
              <div className="job-title">{e.title}</div>
              <div className="job-company">{when}{e.location ? ` · ${e.location}` : ''}</div>
            </Link>
          );
        })}
        <Link to="/events" className="sidebar-outline-btn">All events →</Link>
      </div>
    </div>
  );
}

function MembershipCard() {
  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">Become a chapter member</div>
      <div className="sidebar-card-body">
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Annual dues, member directory listing, discounted event pricing, and voting rights in chapter elections.
        </div>
        <Link to="/membership" className="sidebar-post-btn">Join the chapter</Link>
        <Link to="/membership" className="sidebar-outline-btn">See all tiers →</Link>
      </div>
    </div>
  );
}

function NewsletterCard() {
  return (
    <div className="newsletter-card">
      <div className="nl-title">Chapter digest</div>
      <div className="nl-sub">
        Monthly chapter updates — events, board news, and AWI announcements. Sent the first Tuesday of every month.
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
      <EventsCard />
      <MembershipCard />
      <NewsletterCard />
    </aside>
  );
}
