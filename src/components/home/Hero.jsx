import { Link } from 'react-router-dom';

/**
 * Home hero — big image-backed brown band. The stats that used to
 * live on the right have moved to the dedicated StatsStrip below
 * (and are backed by real DB counts there). This hero is pure copy
 * + CTAs now, sitting on an atmospheric workshop photograph.
 */
export default function Hero() {
  return (
    <section className="hero hero-image gh-hero">
      <div className="hero-image-layer" aria-hidden="true" />
      <div className="hero-image-scrim" aria-hidden="true" />

      <div className="hero-inner hero-inner-left">
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
    </section>
  );
}
