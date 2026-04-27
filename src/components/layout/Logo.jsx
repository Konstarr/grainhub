import { Link } from 'react-router-dom';

const LOGO_URL =
  'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/object/public/media/millwork_logo_transparent_1.png';

/**
 * The Millwork.io logo. Renders the supplied transparent PNG so the
 * mark + wordmark stay locked together visually. The `size` prop sets
 * the rendered HEIGHT in pixels; width is computed from the image's
 * intrinsic aspect ratio so the logo never gets squished.
 *
 * Used by Nav (size=36) and Footer (size=32). If a parent needs a
 * pure visual (no link), pass `as="div"`.
 */
export default function Logo({ size = 36, as = 'link', style }) {
  const inner = (
    <img
      src={LOGO_URL}
      alt="Millwork.io"
      height={size}
      style={{ height: size, width: 'auto', display: 'block' }}
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
