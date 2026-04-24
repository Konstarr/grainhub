import { Link } from 'react-router-dom';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';
import { mapSupplierRow } from '../../lib/mappers.js';

const MIN_CHIPS_PER_GROUP = 10;
const SECONDS_PER_CHIP = 3.2;

export default function SponsorStrip() {
  const { data: rows } = useSupabaseList('suppliers', {
    filter: (q) => q.eq('is_approved', true),
    order: { column: 'rating', ascending: false },
    limit: 40,
  });

  const sponsors = rows
    .filter((r) => Array.isArray(r.badges) && r.badges.some((b) => /sponsor/i.test(b)))
    .map(mapSupplierRow);

  if (sponsors.length === 0) {
    return null;
  }

  const reps = Math.max(1, Math.ceil(MIN_CHIPS_PER_GROUP / sponsors.length));
  const expanded = Array.from({ length: reps }).flatMap((_, r) =>
    sponsors.map((s) => ({ ...s, _rep: r }))
  );
  const durationSeconds = Math.max(24, Math.round(expanded.length * SECONDS_PER_CHIP));
  const trackStyle = { '--sponsor-duration': durationSeconds + 's' };

  const renderGroup = (keyPrefix) => (
    <div className="sponsor-group" aria-hidden={keyPrefix === 'b' ? 'true' : undefined}>
      {expanded.map((s) => (
        <Link
          key={keyPrefix + '-' + s._rep + '-' + s.id}
          to="/suppliers/profile"
          className="sponsor-logo"
          title={s.name}
        >
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt={s.name + ' logo'}
              className="sponsor-logo-badge sponsor-logo-img"
            />
          ) : (
            <span className={'sponsor-logo-badge ' + (s.logoColor || '')}>{s.logo}</span>
          )}
          <span className="sponsor-logo-name">{s.name}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="sponsor-strip">
      <span className="sponsor-label">Sponsors</span>
      <div className="sponsor-marquee" aria-label="Featured sponsors">
        <div className="sponsor-track" style={trackStyle}>
          {renderGroup('a')}
          {renderGroup('b')}
        </div>
      </div>
      <Link to="/sponsor" className="sponsor-cta">Become a Sponsor</Link>
    </div>
  );
}
