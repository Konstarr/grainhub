import { Link } from 'react-router-dom';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';
import { mapSupplierRow } from '../../lib/mappers.js';

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

  const loop = [...sponsors, ...sponsors];

  return (
    <div className="sponsor-strip">
      <span className="sponsor-label">Sponsors</span>
      <div className="sponsor-marquee" aria-label="Featured sponsors">
        <div className="sponsor-track">
          {loop.map((s, idx) => (
            <Link
              key={s.id + '-' + idx}
              to="/suppliers/profile"
              className="sponsor-logo"
              title={s.name}
            >
              <span className={'sponsor-logo-badge ' + (s.logoColor || '')}>{s.logo}</span>
              <span className="sponsor-logo-name">{s.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <Link to="/sponsor" className="sponsor-cta">Become a Sponsor</Link>
    </div>
  );
}
