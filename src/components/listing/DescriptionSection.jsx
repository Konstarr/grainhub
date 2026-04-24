import { DESCRIPTION } from '../../data/listingData.js';

export default function DescriptionSection({ listing }) {
  if (listing && listing.description) {
    const paras = String(listing.description).split(/\n\n+/).filter(Boolean);
    return (
      <div className="desc-section">
        <div className="desc-title">Seller's Description</div>
        <div className="desc-body">
          {paras.map((para, idx) => (
            <p key={idx} style={{ whiteSpace: 'pre-line' }}>{para}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="desc-section">
      <div className="desc-title">Seller's Description</div>
      <div className="desc-body">
        {DESCRIPTION.paragraphs.map((para, idx) => (<p key={idx}>{para}</p>))}
        <ul>
          {DESCRIPTION.bullets.map((b, idx) => (<li key={idx}>{b}</li>))}
        </ul>
        {DESCRIPTION.closing.map((para, idx) => (<p key={idx}>{para}</p>))}
      </div>
    </div>
  );
}
