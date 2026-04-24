import { Link } from 'react-router-dom';

/**
 * Shared breadcrumb trail at the top of every detail page.
 * We used to render a back pill AND breadcrumbs — that was duplicative
 * since the breadcrumb's section link (e.g. "Forums") is itself a back
 * link. Now it's crumbs only, centered to the page gutter, with proper
 * spacing above/below.
 *
 * Props:
 *   crumbs       – array of { label, to? } where the last crumb is the
 *                  current page (no `to`). The first crumb is typically
 *                  { label: 'Home', to: '/' }. Optional — if omitted, a
 *                  sensible two-crumb trail is built from backTo/backLabel.
 *   backTo       – path used to auto-build the section crumb when `crumbs`
 *                  is not supplied. Also the link target for "Home › X".
 *   backLabel    – text used to derive the section crumb label when
 *                  `crumbs` is not supplied (e.g. "Back to Forums" → "Forums").
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
    <nav className="page-back-bar" aria-label="Breadcrumb">
      <ol className="pb-crumbs">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="pb-crumb">
              {c.to && !last ? (
                <Link to={c.to} className="pb-crumb-link">{c.label}</Link>
              ) : (
                <span className={last ? 'pb-crumb-current' : 'pb-crumb-text'}>{c.label}</span>
              )}
              {!last && (
                <span className="pb-sep" aria-hidden="true">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
