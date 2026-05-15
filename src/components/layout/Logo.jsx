import { Link } from 'react-router-dom';

/**
 * AWI Florida Chapter logo.
 *
 * Uses Supabase Storage's image-transform endpoint
 * (`/render/image/public/...?width=...`) to serve a small, cacheable PNG
 * sized for the rendered display height instead of the full-resolution
 * source — keeps initial page paint fast.
 *
 * To swap the source asset later (e.g. once a dedicated AWI Florida
 * Chapter PNG is uploaded), change RENDER_BASE below. Aspect ratio
 * for the existing asset is ~1616×238 ≈ 6.79:1.
 *
 * `size` is the rendered HEIGHT in CSS pixels. The width is computed
 * from the asset's natural aspect ratio so the browser reserves space
 * (no CLS).
 */
const RENDER_BASE =
  'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/render/image/public/media/millwork_logo_transparent_1.png';

// Source PNG natural aspect (width/height). 1616 × 238 → ~6.79.
const ASPECT = 1616 / 238;

function logoSrc(size) {
  // Request 2× the rendered width for retina, capped at a reasonable max.
  const w = Math.min(Math.round((size || 56) * ASPECT * 2), 1200);
  return `${RENDER_BASE}?width=${w}&resize=contain&quality=85`;
}

export default function Logo({ size = 56, as = 'link', style }) {
  const renderH = size;
  const renderW = Math.round(renderH * ASPECT);

  const inner = (
    <img
      src={logoSrc(size)}
      alt="AWI Florida Chapter"
      width={renderW}
      height={renderH}
      loading="eager"
      fetchpriority="high"
      decoding="async"
      draggable={false}
      style={{ display: 'block' }}
    />
  );

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
