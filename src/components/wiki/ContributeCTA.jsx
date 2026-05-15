export default function ContributeCTA() {
  return (
    <div className="contribute-cta">
      <div>
        <div className="cc-title">Know something worth sharing?</div>
        <div className="cc-sub">
          The AWI Florida Chapter Wiki is written by working professionals — shop owners, machinists, estimators, and finishers who've learned things the hard way and want to pass it on. Every article starts with one expert's knowledge.
        </div>
        <div className="cc-actions">
          <button className="btn-contribute">✏ Write an Article</button>
          <button className="btn-contribute-outline">Improve an Existing Article</button>
        </div>
      </div>
      <div className="cc-right">
        <div className="cc-stat">
          <div className="cc-stat-num">142</div>
          <div className="cc-stat-label">Active contributors</div>
        </div>
        <div className="cc-stat">
          <div className="cc-stat-num">634</div>
          <div className="cc-stat-label">Edits this month</div>
        </div>
        <div className="cc-stat">
          <div className="cc-stat-num">⭐ Pts</div>
          <div className="cc-stat-label">Earn rep for every edit</div>
        </div>
      </div>
    </div>
  );
}
