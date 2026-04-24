import { NEWS_PAGE_HEADER, NEWSLETTER_SUBSCRIBE } from '../../data/newsData.js';

export default function NewsPageHeader() {
  return (
    <div className="page-header gh-hero">
      <div className="page-header-inner">
        <div className="page-header-left">
          <div className="page-eyebrow">{NEWS_PAGE_HEADER.eyebrow}</div>
          <h1 className="page-title">{NEWS_PAGE_HEADER.title}</h1>
          <p className="page-subtitle">{NEWS_PAGE_HEADER.subtitle}</p>
        </div>
        <div className="newsletter-inline">
          <div className="nl-label">{NEWSLETTER_SUBSCRIBE.label}</div>
          <div className="nl-desc">{NEWSLETTER_SUBSCRIBE.description}</div>
          <div className="nl-row">
            <input className="nl-input" type="email" placeholder="your@email.com" />
            <button className="nl-btn">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
