import '../styles/supplierProfile.css';
import HeroSection from '../components/supplierProfile/HeroSection.jsx';
import AboutCard from '../components/supplierProfile/AboutCard.jsx';
import ReviewsCard from '../components/supplierProfile/ReviewsCard.jsx';
import ContactCard from '../components/supplierProfile/ContactCard.jsx';
import SalesRepsCard from '../components/supplierProfile/SalesRepsCard.jsx';
import { BREADCRUMB, DOWNLOADS, RELATED_ARTICLES, SIMILAR_SUPPLIERS } from '../data/supplierProfileData.js';

export default function SupplierProfile() {
  return (
    <>
      {/* BREADCRUMB */}
      <div className="bc">
        {BREADCRUMB.map((item, idx) => (
          <div key={idx}>
            {item.current ? (
              <span>{item.label}</span>
            ) : (
              <>
                <a href={item.href}>{item.label}</a>
                <span className="bc-sep">›</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* HERO */}
      <HeroSection />

      {/* CONTENT */}
      <div className="wrap">
        <div>
          <AboutCard />

          <ReviewsCard />

          {/* DOWNLOADS */}
          <div className="card">
            <div className="ch">
              <span className="ch-title">Downloads & Resources</span>
            </div>
            {DOWNLOADS.map((item, idx) => (
              <div key={idx} className="dl">
                <div className="dl-icon">{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="dl-name">{item.name}</div>
                  <div className="dl-meta">{item.meta}</div>
                </div>
                <span className="dl-cta">↓ Download</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="right">
          <ContactCard />
          <SalesRepsCard />

          {/* RELATED WIKI */}
          <div className="sc">
            <div className="sc-head">📖 Related Wiki Articles</div>
            <div className="sc-body">
              {RELATED_ARTICLES.map((article) => (
                <div key={article} className="wiki-row">
                  → {article}
                </div>
              ))}
            </div>
          </div>

          {/* SIMILAR SUPPLIERS */}
          <div className="sc">
            <div className="sc-head">🏢 Similar Suppliers</div>
            <div className="sc-body">
              {SIMILAR_SUPPLIERS.map((supplier) => (
                <div key={supplier.name} className="sim-row">
                  <div
                    className="sim-logo"
                    style={{
                      background: 'linear-gradient(135deg, #6B3F1F, #A0522D)',
                      color: 'white',
                    }}
                  >
                    {supplier.logo}
                  </div>
                  <div>
                    <div className="sim-name">{supplier.name}</div>
                    <div className="sim-cat">{supplier.category}</div>
                  </div>
                  <span className="sim-rating">{supplier.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
