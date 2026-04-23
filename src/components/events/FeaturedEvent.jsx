export default function FeaturedEvent({ event }) {
  return (
    <div className="featured-event">
      <div className="fe-img" style={{ background: event.imgGradient }}>
        <span className="fe-eyebrow">{event.eyebrow}</span>
      </div>
      <div className="fe-body">
        <div className="fe-cat">{event.category}</div>
        <h2 className="fe-title">{event.title}</h2>
        <div className="fe-meta">
          <span className="fe-date">{event.date}</span>
          <span className="fe-sep">·</span>
          <span className="fe-loc">{event.location}</span>
        </div>
        <p className="fe-excerpt">{event.excerpt}</p>
        <div className="fe-tags">
          {event.tags.map((tag) => (
            <span key={tag} className="fe-tag">
              {tag}
            </span>
          ))}
        </div>
        <button className="fe-cta">Register / Add to Calendar →</button>
      </div>
    </div>
  );
}
