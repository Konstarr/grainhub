const SPONSORS = [
  'Blum Hardware',
  'Biesse America',
  'Lamello AG',
  'SCM Group',
  'Dürr Systems',
  'Homag Group',
];

export default function SponsorStrip() {
  return (
    <div className="sponsor-strip">
      <span className="sponsor-label">Platinum Sponsors</span>
      <div className="sponsor-logos">
        {SPONSORS.map((name) => (
          <div key={name} className="sponsor-logo">
            {name}
          </div>
        ))}
      </div>
      <span className="sponsor-cta">Become a Sponsor →</span>
    </div>
  );
}
