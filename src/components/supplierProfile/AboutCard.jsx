import { ABOUT, PRODUCT_CATEGORIES } from '../../data/supplierProfileData.js';

export default function AboutCard({ supplier }) {
  const description = supplier?.description || ABOUT.paragraphs[0];
  const paragraphs = supplier?.description
    ? supplier.description.split(/\n{2,}/).filter(Boolean)
    : ABOUT.paragraphs;

  // Real DB-backed details when we have a supplier; otherwise demo.
  const details = supplier
    ? [
        supplier.category && { label: 'Category', value: supplier.category },
        supplier.trade    && { label: 'Trade',    value: supplier.trade    },
        supplier.address  && { label: 'HQ',       value: supplier.address  },
        supplier.website  && { label: 'Website',  value: supplier.website, link: true },
      ].filter(Boolean)
    : ABOUT.details;

  return (
    <div className="card">
      <div className="ch">
        <span className="ch-title">About</span>
      </div>
      <div className="cb">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="about-p">{para}</p>
        ))}
        {details.length > 0 && (
          <div className="about-details">
            {details.map((detail) => (
              <div key={detail.label} className="ad">
                <div className="ad-label">{detail.label}</div>
                <div className="ad-val">
                  {detail.link
                    ? <a href={detail.value.startsWith('http') ? detail.value : 'https://' + detail.value} target="_blank" rel="noreferrer">{detail.value}</a>
                    : detail.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!supplier && (
        <>
          <div className="ch">
            <span className="ch-title">Product Categories</span>
          </div>
          <div className="cats">
            {PRODUCT_CATEGORIES.map((cat) => (
              <div key={cat.name} className="cat">
                <span className="cat-icon">{cat.icon}</span>
                {cat.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
