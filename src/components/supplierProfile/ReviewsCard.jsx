import { Link } from 'react-router-dom';
import { RATING_BREAKDOWN, SAMPLE_REVIEWS } from '../../data/supplierProfileData.js';

export default function ReviewsCard() {
  return (
    <div className="card">
      <div className="ch">
        <span className="ch-title">Member Reviews</span>
        <span className="ch-link">All {RATING_BREAKDOWN.count} →</span>
      </div>

      <div className="rating-block">
        <div>
          <div className="big-score">{RATING_BREAKDOWN.average}</div>
          <div className="big-stars">{RATING_BREAKDOWN.stars}</div>
          <div className="big-count">{RATING_BREAKDOWN.count} reviews</div>
        </div>
        <div className="bars">
          {RATING_BREAKDOWN.distribution.map((dist) => (
            <div key={dist.star} className="bar-r">
              <span className="bar-lbl">{dist.star}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${dist.percent}%` }}></div>
              </div>
              <span className="bar-pct">{dist.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cat-scores">
        {RATING_BREAKDOWN.categories.map((cat) => (
          <div key={cat.label} className="cs-item">
            <div className="cs-label">{cat.label}</div>
            <div className="cs-score">{cat.score}</div>
            <div className="cs-stars">{cat.stars}</div>
          </div>
        ))}
      </div>

      {SAMPLE_REVIEWS.map((review, idx) => (
        <div key={idx} className="review">
          <div className="rev-top">
            <div className="rev-av">{review.av}</div>
            <div style={{ flex: 1 }}>
              <div className="rev-name">{review.name}</div>
              <div className="rev-sub">{review.role}</div>
            </div>
            <div className="rev-stars">{review.stars}</div>
            <div className="rev-date">{review.date}</div>
          </div>
          <div className="rev-tag">{review.tag}</div>
          <div className="rev-body">{review.body}</div>
          <div className="rev-foot">{review.helpful}</div>
        </div>
      ))}

      <Link to="/signup" className="write-rev">✏ Write a Review</Link>
    </div>
  );
}
