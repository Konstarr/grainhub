import { Link } from 'react-router-dom';

/** Title + trailing link, used above every major content block. */
export default function SectionHeader({ title, linkLabel, linkTo }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {linkLabel && linkTo ? (
        <Link to={linkTo} className="section-link">{linkLabel}</Link>
      ) : (
        linkLabel && <span className="section-link">{linkLabel}</span>
      )}
    </div>
  );
}
