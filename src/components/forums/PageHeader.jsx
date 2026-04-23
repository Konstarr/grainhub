export default function PageHeader({ data }) {
  return (
    <div className="page-header">
      <div className="header-inner">
        <div className="header-left">
          <div className="page-eyebrow">{data.eyebrow}</div>
          <h1 className="page-title">{data.title}</h1>
          <p className="page-subtitle">{data.subtitle}</p>
        </div>
        <div className="header-right">
          {data.stats.map((stat, idx) => (
            <div key={idx}>
              <div className="hstat-num">{stat.num}</div>
              <div className="hstat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
