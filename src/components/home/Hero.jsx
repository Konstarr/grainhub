import { Link } from 'react-router-dom';

/**
 * Home hero — big image-backed brown band. The hero image is rendered
 * as a real <img> (not a CSS background) so it can carry priority
 * hints for LCP: fetchpriority="high", decoding="async",
 * loading="eager". A matching <link rel="preload"> in index.html
 * starts the download before React even mounts.
 */
const HERO_IMAGE_URL =
  'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/object/public/media/homepage/museums-victoria-U01ptiZV3Uo-unsplash.jpg';

export default function Hero() {
  return (
    <section className="hero hero-image gh-hero">
      <img
        className="hero-image-bg"
        src={HERO_IMAGE_URL}
        alt=""
        aria-hidden="true"
        width={1920}
        height={720}
        fetchpriority="high"
        decoding="async"
        loading="eager"
      />
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
