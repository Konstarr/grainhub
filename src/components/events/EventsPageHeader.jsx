export default function EventsPageHeader({ data }) {
  return (
    <header className="events-page-header gh-hero">
      <div className="events-page-header-inner">
        <div className="events-eyebrow">{data.eyebrow}</div>
        <h1 className="events-title">{data.title}</h1>
        <p className="events-subtitle">{data.subtitle}</p>
      </div>
    </header>
  );
}
