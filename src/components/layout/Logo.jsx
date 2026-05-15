import { Link } from 'react-router-dom';

/**
 * AWI Florida Chapter wordmark.
 *
 * USAGE NOTE FOR THE OWNER:
 *   Until you upload an AWI Florida Chapter logo PNG to Supabase Storage
 *   (`media/awi-florida-logo.png`), this component renders a clean
 *   typographic wordmark. To swap to an image-based logo later, set
 *   `useImage = true` and update RENDER_BASE to your uploaded file.
 *
 * `size` is the rendered HEIGHT in CSS pixels.
 */
const useImage = false; // flip to true once an AWI FL logo is uploaded
const RENDER_BASE =
  'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/render/image/public/media/awi-florida-logo.png';

function logoSrc(size) {
  const w = Math.min(Math.round((size || 56) * 6), 800);
  return `${RENDER_BASE}?width=${w}&resize=contain&quality=85`;
}

function WordmarkSVG({ height = 56 }) {
  // Compact typographic mark. Width auto-derived so callers can drop it
  // anywhere height-constrained (e.g. the site nav).
  // Aspect ratio ~6:1 (matches the previous AWI Florida Chapter logo so layout
  // doesn't shift after the swap).
  const w = Math.round(height * 6);
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 360 60"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AWI Florida Chapter"
      style={{ display: 'block' }}
    >
      {/* AWI badge */}
      <rect x="0" y="6" width="48" height="48" rx="6" fill="#F5EAD6" />
      <text
        x="24" y="38"
        textAnchor="middle"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="1"
        fill="#1F4534"
      >AWI</text>

      {/* Wordmark */}
      <text
        x="60" y="30"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="0.5"
        fill="#F5EAD6"
      >Florida Chapter</text>
      <text
        x="60" y="48"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="500"
        fontSize="11"
        letterSpacing="2"
        fill="rgba(245,234,214,0.7)"
      >ARCHITECTURAL WOODWORK INSTITUTE</text>
    </svg>
  );
}

export default function Logo({ size = 56, as = 'link', style }) {
  let inner;
  if (useImage) {
    // 2x for retina, capped at the source's reasonable max.
    const renderH = size;
    // Update aspect ratio here to match the uploaded asset.
    const renderW = Math.round(renderH * (6));
    inner = (
      <img
        src={logoSrc(size)}
        alt="AWI Florida Chapter"
        width={renderW}
        height={renderH}
        loading="eager"
        fetchpriority="high"
        decoding="async"
        draggable={false}
      />
    );
  } else {
    inner = <WordmarkSVG height={size} />;
  }

  if (as === 'div') {
    return (
      <div className="logo" style={style}>
        {inner}
      </div>
    );
  }
  return (
    <Link to="/" className="logo" style={style} aria-label="AWI Florida Chapter — home">
      {inner}
    </Link>
  );
}
