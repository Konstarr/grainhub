import { DESCRIPTION } from '../../data/listingData.js';

export default function DescriptionSection() {
  return (
    <div className="desc-section">
      <div className="desc-title">Seller's Description</div>
      <div className="desc-body">
        {DESCRIPTION.paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}

        <ul>
          {DESCRIPTION.bullets.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>

        {DESCRIPTION.closing.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    </div>
  );
}
