export default function WikiLinks({ links }) {
  return (
    <div className="rs-card">
      <div className="rs-header">Wiki: Related Articles</div>
      <div className="rs-body">
        {links.map((link, idx) => (
          <a key={idx} className="wiki-link" href="#">
            {link.emoji} {link.text}
          </a>
        ))}
      </div>
    </div>
  );
}
