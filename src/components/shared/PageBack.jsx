import { Link } from 'react-router-dom';

/**
 * Shared "you are here / get back" bar that sits at the top of every detail
 * page. Left side: a pill-shaped Back button that goes to the parent list.
 * Right side: a compact breadcrumb trail (Home › Section › Current).
 *
 * Props:
 *   backTo       – path the Back pill navigates to (e.g. "/wiki")
 *   backLabel    – text for the pill (e.g. "Back to Wiki")
 *   crumbs       – array of { label, to? } where the last crumb is the
 *                  current page (no `to`). The first crumb is typically
 *                  { label: 'Home', to: '/' }. Optional — if omitted, a
 *                  sensible two-crumb trail is built from backTo/backLabel.
 */
export default function PageBack({ backTo, backLabel, crumbs }) {
  const trail =
    crumbs && crumbs.length > 0
      ? crumbs
      : [
          { label: 'Home', to: '/' },
          { label: backLabel?.replace(/^Back to\s+/i, '') || 'Back', to: backTo },
        ];

  return (
    <div className="page-back-bar">
      <Link to={backTo} className="pb-back" aria-label={backLabel}>
        <span className="pb-arrow" aria-hidden="true">←</span>
        <span className="pb-back-text">{backLabel}</span>
      </Link>

      <nav className="pb-crumbs" aria-label="Breadcrumb">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <span key={`${c.label}-${i}`} className="pb-crumb">
              {c.to && !last ? (
                <Link to={c.to}>{c.label}</Link>
              ) : (
                <span className={last ? 'pb-crumb-current' : undefined}>{c.label}</span>
              )}
              {!last && <span className="pb-sep" aria-hidden="true">›</span>}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
