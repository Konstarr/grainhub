/**
 * Inline blue verified check. Renders only when `verified` is truthy.
 * Drop next to a username or display name to mark a user as
 * staff-verified.
 */
export default function VerifiedCheck({ verified, size = 14, title = 'Verified' }) {
  if (!verified) return null;
  return (
    <span
      className="verified-check"
      title={title}
      aria-label={title}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 22 22" width={size} height={size} aria-hidden="true">
        <path
          fill="#1D9BF0"
          d="M11 0C5 0 0 5 0 11s5 11 11 11 11-5 11-11S17 0 11 0zm5.7 8.4-6.1 6.1a1.2 1.2 0 0 1-1.7 0L5.3 10.9a1.2 1.2 0 0 1 1.7-1.7l2.7 2.7 5.3-5.3a1.2 1.2 0 0 1 1.7 1.7z"
        />
      </svg>
    </span>
  );
}
