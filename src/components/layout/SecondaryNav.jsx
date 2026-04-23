import { useState } from 'react';

const CATEGORIES = [
  'Cabinet Making',
  'Millwork & Moulding',
  'Finishing & Coatings',
  'CNC & Machining',
  'Business & Estimating',
  'Wood Species',
  'Hardware & Accessories',
  'Safety & Standards',
  'Shop Management',
];

export default function SecondaryNav({ initial = 'Cabinet Making' }) {
  const [active, setActive] = useState(initial);

  return (
    <div className="secondary-nav">
      {CATEGORIES.map((cat) => (
        <div
          key={cat}
          className={`sec-item ${active === cat ? 'active' : ''}`}
          onClick={() => setActive(cat)}
        >
          {cat}
        </div>
      ))}
    </div>
  );
}
