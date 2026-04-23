import { useState } from 'react';
import { WOOD_SPECIES_ITEMS } from '../../data/wikiData.js';

export default function SpeciesDirectory() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filterButtons = [
    'All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ];

  const disabledLetters = ['E', 'G', 'I', 'J', 'K', 'N', 'Q', 'U', 'V', 'X', 'Y', 'Z'];

  return (
    <div className="species-section">
      <div className="species-header">
        <div className="species-title">🌲 Wood Species Directory</div>
        <span style={{ fontSize: '13px', color: 'var(--wood-warm)', cursor: 'pointer', fontWeight: '500' }}>
          All 214 species →
        </span>
      </div>

      <div className="az-filter">
        {filterButtons.map((letter) => {
          const isDisabled = disabledLetters.includes(letter);
          return (
            <button
              key={letter}
              className={`az-btn ${activeFilter === letter ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && setActiveFilter(letter)}
              disabled={isDisabled}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="species-grid">
        {WOOD_SPECIES_ITEMS.map((species) => (
          <div key={species.name} className="species-item">
            <div className="species-swatch" style={{ background: species.swatchGradient }}></div>
            <div>
              <div className="species-name">{species.name}</div>
              <div className="species-type">{species.type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
