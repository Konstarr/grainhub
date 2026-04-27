import { Link } from 'react-router-dom';

/**
 * The Millwork.io logo. Uses Supabase Storage's image-transform endpoint
 * (`/render/image/public/...?width=...`) to serve a small, cacheable PNG
 * sized for the rendered display height instead of the full-resolution
 * source. This keeps initial page paint fast.
 *
 * `size` is the rendered HEIGHT in CSS pixels. We request roughly 2x
 * that width so retina displays still look crisp.
 */
const RENDER_BASE =
  'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/render/image/public/media/millwork_logo_transparent_1.png';

function logoSrc(size) {
  // 2x for retina, capped at the source's reasonable max.
  const w = Math.min(Math.round((size || 56) * 6), 800);
  return `${RENDER_BASE}?width=${w}&resize=contain&quality=85`;
}

export default function Logo({ size = 56, as = 'link', style }) {
  // Source PNG is 1616x238 → aspect ratio ~6.79. Provide explicit
  // width/height so the browser reserves space (no CLS).
  const renderH = size;
  const renderW = Math.round(renderH * (1616 / 238));
  const inner = (
    <img
      src={logoSrc(size)}
      alt="Millwork.io"
      width={renderW}
      height={renderH}
      loading="eager"
      fetchpriority="high"
      decoding="async"
      draggable={false}
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
    <Link to="/" className="logo" style={style} aria-label="Millwork.io home">
      {inner}
    </Link>
  );
}
