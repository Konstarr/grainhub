import '../styles/supplierProfile.css';
import { Link, useParams } from 'react-router-dom';
import ClaimSection from '../components/suppliers/ClaimSection.jsx';
import HeroSection from '../components/supplierProfile/HeroSection.jsx';
import AboutCard from '../components/supplierProfile/AboutCard.jsx';
import ReviewsCard from '../components/supplierProfile/ReviewsCard.jsx';
import ContactCard from '../components/supplierProfile/ContactCard.jsx';
import SalesRepsCard from '../components/supplierProfile/SalesRepsCard.jsx';
import PageBack from '../components/shared/PageBack.jsx';
import { DOWNLOADS, RELATED_ARTICLES, SIMILAR_SUPPLIERS, SUPPLIER_HERO } from '../data/supplierProfileData.js';

export default function SupplierProfile() {
  const { slug } = useParams();
  return (
    <>
      {/* BREADCRUMB */}
      <PageBack
        backTo="/suppliers"
        backLabel="Back to Suppliers"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Suppliers', to: '/suppliers' },
          { label: SUPPLIER_HERO.name },
        ]}
      />

      {/* HERO */}
      <HeroSection />

      {/* CLAIM / OWNER CARD — only renders when route has a slug + DB row exists */}
      {slug && (
        <div className="wrap" style={{ marginTop: 16 }}>
          <ClaimSection slug={slug} />
        </div>
      )}

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
                <Link key={article} to="/wiki/article" className="wiki-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                  → {article}
                </Link>
              ))}
            </div>
          </div>

          {/* SIMILAR SUPPLIERS */}
          <div className="sc">
            <div className="sc-head">🏢 Similar Suppliers</div>
            <div className="sc-body">
              {SIMILAR_SUPPLIERS.map((supplier) => (
                <Link key={supplier.name} to="/suppliers/profile" className="sim-row" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
