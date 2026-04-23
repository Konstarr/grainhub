import { Link } from 'react-router-dom';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';

export default function SponsorStrip() {
  const { data: rows } = useSupabaseList('suppliers', {
    filter: (q) => q.eq('is_approved', true).contains('badges', ['Gold Sponsor']),
    order: { column: 'rating', ascending: false },
    limit: 8,
  });

  if (rows.length === 0) return null;

  return (
    <div className="sponsor-strip">
      <span className="sponsor-label">Sponsors</span>
      <div className="sponsor-logos">
        {rows.map((s) => (
          <Link key={s.id} to="/suppliers/profile" className="sponsor-logo">
            {s.name}
          </Link>
        ))}
      </div>
      <Link to="/sponsor" className="sponsor-cta">Become a Sponsor</Link>
    </div>
  );
}
