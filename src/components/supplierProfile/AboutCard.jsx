import { ABOUT, PRODUCT_CATEGORIES } from '../../data/supplierProfileData.js';

export default function AboutCard() {
  return (
    <div className="card">
      <div className="ch">
        <span className="ch-title">About</span>
      </div>
      <div className="cb">
        {ABOUT.paragraphs.map((para, idx) => (
          <p key={idx} className="about-p">
            {para}
          </p>
        ))}
        <div className="about-details">
          {ABOUT.details.map((detail) => (
            <div key={detail.label} className="ad">
              <div className="ad-label">{detail.label}</div>
              <div className="ad-val">
                {detail.link ? <a href="#">{detail.value}</a> : detail.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ch">
        <span className="ch-title">Product Categories</span>
        <span className="ch-link">Visit blum.com →</span>
      </div>
      <div className="cats">
        {PRODUCT_CATEGORIES.map((cat) => (
          <div key={cat.name} className="cat">
            <span className="cat-icon">{cat.icon}</span>
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
}
