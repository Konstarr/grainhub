import { Link } from 'react-router-dom';

export default function EventsGrid({ events }) {
  return (
    <div className="events-grid">
      {(events || []).map((event) => {
        const href = event.slug ? '/events/' + event.slug : '/events';
        return (
          <Link
            key={event.id || event.slug || event.title}
            to={href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article className="event-card">
              <div
                className="ec-img"
                style={{
                  background: event.coverImage
                    ? 'url("' + event.coverImage + '") center/cover no-repeat, ' + event.imgGradient
                    : event.imgGradient,
                }}
              >
                <span className={'ec-kicker ec-k-' + event.categoryColor}>{event.category}</span>
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
          </Link>
        );
      })}
    </div>
  );
}
