import { Link } from 'react-router-dom';
import { HERO_STATS } from '../../data/homeData.js';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">The Industry's Knowledge Hub</div>
          <h1>
            Built by <em>makers,</em>
            <br />
            for makers.
          </h1>
          <p className="hero-sub">
            The modern community for millwork and cabinet professionals — industry news, expert
            forums, machinery listings, job postings, and a living wiki. All in one place.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-hero-primary">Join Free — It Takes 30 Seconds →</Link>
            <Link to="/wiki" className="btn-hero-outline">Browse the Wiki</Link>
          </div>
        </div>

        <div className="hero-stats">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
