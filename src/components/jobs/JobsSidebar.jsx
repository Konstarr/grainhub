import { Link } from 'react-router-dom';
import { SponsorSidebar } from '../sponsors/AdSlot.jsx';

export default function JobsSidebar({ postJobCta, talentCta }) {
  return (
    <aside className="right-col">
      <SponsorSidebar />
      <div className="post-job-card">
        <div className="pjc-eyebrow">{postJobCta.eyebrow}</div>
        <div className="pjc-title">{postJobCta.title}</div>
        <div className="pjc-sub">{postJobCta.description}</div>
        <Link to="/admin/jobs/new" className="pjc-btn">Post a Job Now →</Link>
        <div className="pjc-pricing">
          {postJobCta.tiers.map((tier, idx) => (
            <div key={idx} className="pjc-tier">
              <span className="pjc-tier-name">{tier.name}</span>
              <span className="pjc-tier-price">{tier.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="talent-card">
        <div className="tc-title">{talentCta.title}</div>
        <div className="tc-sub">{talentCta.description}</div>
        <Link to="/signup" className="tc-btn">Create Your Profile →</Link>
      </div>
    </aside>
  );
}
