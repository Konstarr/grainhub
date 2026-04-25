/**
 * Forums page hero. Same image + scrim treatment as the homepage Hero
 * (.hero-image / .hero-image-bg / .hero-image-scrim) so the brown band
 * lights up with the workshop photograph and the warm gradient overlay
 * keeps the title legible.
 */
const FORUM_HEADER_BG =
  'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/object/public/media/forum/header_background.jpg';

export default function PageHeader({ data }) {
  return (
    <div className="page-header gh-hero hero-image">
      <img
        className="hero-image-bg"
        src={FORUM_HEADER_BG}
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        decoding="async"
        loading="eager"
      />
      <div className="hero-image-scrim" aria-hidden="true" />

      <div className="header-inner">
        <div className="header-left">
          <div className="page-eyebrow">{data.eyebrow}</div>
          <h1 className="page-title">{data.title}</h1>
          <p className="page-subtitle">{data.subtitle}</p>
        </div>
        <div className="header-right">
          {data.stats.map((stat, idx) => (
            <div key={idx}>
              <div className="hstat-num">{stat.num}</div>
              <div className="hstat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
