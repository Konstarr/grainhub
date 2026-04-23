export default function EventsSidebar({ submitCard, saveTheDate, sponsor, newsletter }) {
  return (
    <aside className="sidebar">
      <div className="sponsor-ad">
        <div className="sp-label">{sponsor.label}</div>
        <div className="sp-title">{sponsor.title}</div>
        <div className="sp-sub">{sponsor.description}</div>
        <button className="sp-btn">{sponsor.cta}</button>
      </div>

      <div className="sidebar-card">
        <div className="sidebar-card-header">Save the Date</div>
        <div className="sidebar-card-body">
          {saveTheDate.map((event) => (
            <div key={event.title} className="std-item">
              <div className="std-title">{event.title}</div>
              <div className="std-date">{event.date}</div>
              <div className="std-loc">{event.location}</div>
            </div>
          ))}
          <button className="sidebar-outline-btn">Browse All Events →</button>
        </div>
      </div>

      <div className="submit-event-card">
        <div className="sec-label">{submitCard.label}</div>
        <div className="sec-title">{submitCard.title}</div>
        <div className="sec-sub">{submitCard.description}</div>
        <button className="sidebar-post-btn">{submitCard.cta}</button>
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
