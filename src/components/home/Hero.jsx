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
        <div className="hero-eyebrow">Architectural Woodwork Institute · Florida Chapter</div>
        <h1>
          Florida's <em>architectural</em>
          <br />
          woodwork community.
        </h1>
        <p className="hero-sub">
          The official home of the AWI Florida Chapter — chapter events, member directory,
          technical resources, and forums for architectural woodwork professionals across the state.
        </p>
        <div className="hero-actions">
          <Link to="/membership" className="btn-hero-primary">Join the Chapter →</Link>
          <Link to="/events" className="btn-hero-outline">See upcoming events</Link>
        </div>
      </div>
    </section>
  );
}
