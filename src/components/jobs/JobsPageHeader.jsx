export default function JobsPageHeader({ data }) {
  const titleLines = data.title.split('\n');

  return (
    <div className="page-header gh-hero">
      <div className="header-inner">
        <div className="header-top">
          <div>
            <div className="page-eyebrow">{data.eyebrow}</div>
            <h1 className="page-title">
              {titleLines.map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="page-subtitle">{data.subtitle}</p>
          </div>
          <div className="header-stats">
            {data.stats.map((stat, idx) => (
              <div key={idx}>
                <div className="hstat-num">{stat.num}</div>
                <div className="hstat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
