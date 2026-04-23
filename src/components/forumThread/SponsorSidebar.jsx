export default function SponsorSidebar({ data }) {
  return (
    <div className="sponsor-sidebar">
      <div className="sp-label">{data.label}</div>
      <div className="sp-title">{data.title}</div>
      <div className="sp-sub">{data.subtitle}</div>
      <button className="sp-btn">{data.ctaText}</button>
    </div>
  );
}
