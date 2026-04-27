import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/supplierProfile.css';
import HeroSection from '../components/supplierProfile/HeroSection.jsx';
import AboutCard from '../components/supplierProfile/AboutCard.jsx';
import ReviewsCard from '../components/supplierProfile/ReviewsCard.jsx';
import ContactCard from '../components/supplierProfile/ContactCard.jsx';
import SalesRepsCard from '../components/supplierProfile/SalesRepsCard.jsx';
import ClaimSection from '../components/suppliers/ClaimSection.jsx';
import PageBack from '../components/shared/PageBack.jsx';
import { fetchSupplierBySlug } from '../lib/supplierClaimsDb.js';
import { DOWNLOADS, RELATED_ARTICLES, SIMILAR_SUPPLIERS, SUPPLIER_HERO } from '../data/supplierProfileData.js';

export default function SupplierProfile() {
  const { slug } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading]   = useState(!!slug);

  useEffect(() => {
    if (!slug) { setSupplier(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchSupplierBySlug(slug).then(({ data }) => {
      if (!cancelled) { setSupplier(data || null); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [slug]);

  // If loading or no row, fall through to the static demo state so the
  // page never blanks. The ClaimSection only shows when supplier exists.
  const display = supplier || null;

  return (
    <>
      <PageBack
        backTo="/suppliers"
        backLabel="Back to Suppliers"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Suppliers', to: '/suppliers' },
          { label: display?.name || SUPPLIER_HERO.name },
        ]}
      />

      <HeroSection supplier={display} />

      {slug && display && (
        <div className="wrap" style={{ marginTop: 16 }}>
          <ClaimSection slug={slug} />
        </div>
      )}

      {slug && !loading && !display && (
        <div className="wrap" style={{ marginTop: 16, padding: '16px 18px', background: '#FBE2E2', border: '1px solid #F1B5B5', borderRadius: 8 }}>
          Supplier not found. <Link to="/suppliers">Browse all suppliers →</Link>
        </div>
      )}

      <div className="wrap">
        <div>
          <AboutCard supplier={display} />
          <ReviewsCard supplier={display} />
          <SalesRepsCard supplier={display} />
        </div>

        <aside>
          <ContactCard supplier={display} />

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><strong>Downloads</strong></div>
            <div className="card-body">
              {DOWNLOADS.map((d) => (
                <div key={d.label} className="dl-row">
                  <span>📄 {d.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.size}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><strong>Related articles</strong></div>
            <div className="card-body">
              {RELATED_ARTICLES.map((a) => (
                <div key={a.title} className="rel-row">
                  <div style={{ fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><strong>Similar suppliers</strong></div>
            <div className="card-body">
              {SIMILAR_SUPPLIERS.map((s) => (
                <Link key={s.name} to="/suppliers" className="sim-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="sim-logo">{s.logo}</div>
                  <div>
                    <div className="sim-name">{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
