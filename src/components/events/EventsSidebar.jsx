import { Link } from 'react-router-dom';

export default function EventsSidebar({ submitCard, newsletter }) {
  return (
    <aside className="sidebar">
      <div className="submit-event-card">
        <div className="sec-label">{submitCard.label}</div>
        <div className="sec-title">{submitCard.title}</div>
        <div className="sec-sub">{submitCard.description}</div>
        <Link to="/sponsor" className="sidebar-post-btn">{submitCard.cta}</Link>
      </div>

      <div className="newsletter-card">
        <div className="nl-title">{newsletter.title}</div>
        <div className="nl-sub">{newsletter.description}</div>
        <div className="nl-input-row">
          <input className="nl-input" type="email" placeholder="your@email.com" />
          <button className="nl-btn">Subscribe</button>
        </div>
      </div>
    </aside>
  );
}
