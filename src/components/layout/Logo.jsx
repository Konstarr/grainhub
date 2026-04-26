import { Link } from 'react-router-dom';

/**
 * The Millwork.io logo mark + wordmark.
 * Accepts a `size` prop (SVG pixel size) so the footer can render it smaller.
 */
export default function Logo({ size = 36, as = 'link', style }) {
  const inner = (
    <>
      <svg viewBox="0 0 36 36" fill="none" width={size} height={size}>
        <rect width="36" height="36" rx="7" fill="#A0522D" opacity="0.3" />
        <path
          d="M7 26 L18 9 L29 26"
          stroke="#D2925A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M7 26 L29 26" stroke="#D2925A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 26 L15 20 L21 20 L21 26" stroke="#A0522D" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="logo-text">
        Millwork<span>.io</span>
      </span>
    </>
  );

  if (as === 'div') {
    return (
      <div className="logo" style={style}>
        {inner}
      </div>
    );
  }
  return (
    <Link to="/" className="logo" style={style}>
      {inner}
    </Link>
  );}
