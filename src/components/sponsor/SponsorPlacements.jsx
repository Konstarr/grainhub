export default function SponsorPlacements() {
  return (
    <section className="sponsor-section sponsor-placements-section">
      <div className="sponsor-section-inner">
        <div className="sponsor-intro-max sponsor-intro-margin">
          <div className="sponsor-section-eyebrow">Ad Placements</div>
          <h2 className="sponsor-section-title">
            Where your brand <em>actually lives.</em>
          </h2>
          <p className="sponsor-section-sub">
            Every placement is contextual, non-intrusive, and seen by professionals mid-research —
            not mid-scroll on a social feed.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
          {/* SPONSOR STRIP */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--wood-paper)', padding: '1.25rem', borderBottom: '1px solid var(--border)', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                }}
              >
                Homepage Sponsor Strip
              </div>
              <div style={{ background: 'var(--wood-cream)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '36px',
                    background: 'var(--wood-dark)',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: 'var(--wood-light)',
                    flexShrink: 0,
                  }}
                >
                  BLUM
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', flex: 1 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    Blum CLIP top BLUMOTION
                  </strong>
                  <br />
                  ±2mm adjustment · soft-close · 9 opening angles
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--wood-warm)', whiteSpace: 'nowrap' }}>
                  Learn More →
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Appears below the nav on every page for Platinum sponsors
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--white)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Homepage & Sitewide Strip
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                Your logo and tagline appear in the sponsor strip seen by every member on every
                page load. The highest-visibility placement on AWI Florida Chapter.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', color: 'var(--wood-warm)' }}>
                  Included in Platinum
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ~312K impressions/month
                </div>
              </div>
            </div>
          </div>

          {/* FORUM SIDEBAR AD */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--wood-paper)', padding: '1.25rem', borderBottom: '1px solid var(--border)', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                }}
              >
                Forum Sidebar Ad
              </div>
              <div style={{ background: 'linear-gradient(140deg, #1C2E48, #2D4A78)', borderRadius: '8px', padding: '1rem', color: 'white' }}>
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '4px',
                  }}
                >
                  Sponsored · Cabinet Making
                </div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', marginBottom: '4px' }}>
                  Blum CLIP top BLUMOTION
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  Soft-close, ±2mm adjustment. Engineered for frameless installations in
                  imperfect openings.
                </div>
                <button
                  style={{
                    background: '#4A7FE0',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Download Spec Sheet →
                </button>
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--white)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Category Sidebar Ad
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                Right-rail ad inside every thread in your sponsored category. A hinge brand in the
                Cabinet Making forum. A coating brand in Finishing. Always contextual.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', color: 'var(--wood-warm)' }}>
                  From $600/month
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ~28K category impressions/month
                </div>
              </div>
            </div>
          </div>

          {/* INLINE NATIVE AD */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--wood-paper)', padding: '1.25rem', borderBottom: '1px solid var(--border)', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                }}
              >
                Inline Forum Native Ad
              </div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--wood-warm)',
                    flexShrink: 0,
                  }}
                ></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    Best approach for full-overlay frameless on out-of-square opening?
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    TomKowalski · Cabinet Making · 2h ago · 48 replies
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--wood-light)', borderRadius: '7px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                  Sponsored
                </div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)', flex: 1 }}>
                  Blum MERIVOBOX — The drawer system built for custom production at scale
                </div>
                <button
                  style={{
                    background: 'var(--wood-warm)',
                    color: 'white',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', sans-serif",
                    whiteSpace: 'nowrap',
                  }}
                >
                  Learn More →
                </button>
              </div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '7px', padding: '8px 12px', display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.5 }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#1B4332',
                    flexShrink: 0,
                  }}
                ></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    Recommend a water-based lacquer for hard maple?
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    ShawnRomero · Finishing · 4h ago
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--white)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Inline Native Ad
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                A clearly-labeled native unit placed between forum thread listings — blends with
                content, targeted by category, never intrusive. Higher click-through than banner
                ads.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', color: 'var(--wood-warm)' }}>
                  From $800/month
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ~48K forum impressions/month
                </div>
              </div>
            </div>
          </div>

          {/* WIKI ARTICLE SIDEBAR */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--wood-paper)', padding: '1.25rem', borderBottom: '1px solid var(--border)', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                }}
              >
                Wiki Article Sidebar
              </div>
              <div style={{ background: 'linear-gradient(140deg, #2D3A50, #1A2540)', borderRadius: '8px', padding: '0.85rem', color: 'white' }}>
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '4px',
                  }}
                >
                  Article Sponsor
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>
                  Blum CLIP top BLUMOTION
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '7px' }}>
                  Industry's most-specified concealed hinge — 9 opening angles, soft-close
                  integrated.
                </div>
                <button
                  style={{
                    background: '#4A7FE0',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Download Catalog →
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Placed in right rail of wiki articles related to your product category
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--white)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Wiki Article Sidebar
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                Your brand appears in the right rail of wiki articles directly related to your
                product — hardware brands on the hinge article, coating brands on the finishing
                guide. Intent-matched advertising.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', color: 'var(--wood-warm)' }}>
                  From $400/month
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ~18K article views/month avg.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
