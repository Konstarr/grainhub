import { AUDIENCE_STATS, DEMO_DATA } from '../../data/sponsorData.js';

export default function SponsorAudience() {
  return (
    <section className="sponsor-section sponsor-audience-section">
      <div className="sponsor-section-inner">
        <div className="sponsor-audience-grid">
          <div className="sponsor-audience-left">
            <div className="sponsor-section-eyebrow">The Audience</div>
            <h2 className="sponsor-section-title">
              These are the buyers.<br />
              Not hobbyists. <em>Professionals.</em>
            </h2>
            <p className="sponsor-section-sub">
              GrainHub members are working tradespeople with real purchasing authority — they're
              buying edge banders, specifying hinges, choosing coatings, ordering lumber by the
              unit, and hiring for their shops. Your ad reaches them mid-research, not mid-scroll.
            </p>
            <div className="sponsor-audience-stats">
              {AUDIENCE_STATS.map((stat) => (
                <div key={stat.label} className="sponsor-aud-stat">
                  <div className="sponsor-aud-stat-num">{stat.num}</div>
                  <div className="sponsor-aud-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sponsor-audience-right">
            <div className="sponsor-demo-card">
              <div className="sponsor-demo-header">
                <div className="sponsor-demo-header-title">{DEMO_DATA.title}</div>
                <div className="sponsor-demo-header-sub">{DEMO_DATA.subtitle}</div>
              </div>
              <div className="sponsor-demo-body">
                {DEMO_DATA.roles.map((role) => (
                  <div key={role.label} className="sponsor-demo-row">
                    <span className="sponsor-demo-label">{role.label}</span>
                    <div className="sponsor-demo-bar-wrap">
                      <div
                        className="sponsor-demo-bar"
                        style={{ width: `${role.pct}%` }}
                      ></div>
                    </div>
                    <span className="sponsor-demo-pct">{role.pct}%</span>
                  </div>
                ))}

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'var(--text-muted)',
                      marginBottom: '10px',
                    }}
                  >
                    Top Shop Specialties
                  </div>
                </div>

                {DEMO_DATA.specialties.map((spec) => (
                  <div key={spec.label} className="sponsor-demo-row">
                    <span className="sponsor-demo-label">{spec.label}</span>
                    <div className="sponsor-demo-bar-wrap">
                      <div
                        className="sponsor-demo-bar"
                        style={{ width: `${spec.pct}%` }}
                      ></div>
                    </div>
                    <span className="sponsor-demo-pct">{spec.pct}%</span>
                  </div>
                ))}

                <div className="sponsor-demo-tags">
                  {DEMO_DATA.tags.map((tag) => (
                    <span key={tag} className="sponsor-demo-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
