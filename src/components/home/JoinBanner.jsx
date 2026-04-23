import { Link } from 'react-router-dom';

export default function JoinBanner() {
  return (
    <div className="join-banner">
      <div className="join-text">
        <h3>Join 24,800 millwork &amp; cabinet professionals</h3>
        <p>Free membership. No spam. Just the best community in the industry.</p>
      </div>
      <Link to="/signup" className="btn-hero-primary">Create Your Free Account →</Link>
    </div>
  );
}
