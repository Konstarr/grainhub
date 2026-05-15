import { Link } from 'react-router-dom';

export default function JoinBanner() {
  return (
    <div className="join-banner">
      <div className="join-text">
        <h3>Join the AWI Florida Chapter</h3>
        <p>Manufacturer and Supplier membership tiers, regional forums, chapter events, and a member directory built for Florida architectural woodwork pros.</p>
      </div>
      <Link to="/membership" className="btn-hero-primary">See membership tiers →</Link>
    </div>
  );
}
