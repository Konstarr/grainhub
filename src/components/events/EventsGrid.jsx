export default function EventsGrid({ events }) {
  return (
    <div className="events-grid">
      {events.map((event) => (
        <article key={event.title} className="event-card">
          <div className="ec-img" style={{ background: event.imgGradient }}>
            <span className={`ec-kicker ec-k-${event.categoryColor}`}>{event.category}</span>
          </div>
          <div className="ec-body">
            <h3 className="ec-title">{event.title}</h3>
            <div className="ec-meta">
              <span>{event.date}</span>
              <span className="ec-sep">·</span>
              <span>{event.location}</span>
            </div>
            <p className="ec-excerpt">{event.excerpt}</p>
            <div className="ec-footer">
              <span className="ec-attendees">{event.attendees}</span>
              <span className="ec-price">{event.price}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
