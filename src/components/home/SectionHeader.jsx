/** Title + trailing link, used above every major content block. */
export default function SectionHeader({ title, linkLabel }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {linkLabel && <span className="section-link">{linkLabel}</span>}
    </div>
  );
}
