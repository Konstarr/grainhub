export default function ThreadTools({ tools }) {
  return (
    <div className="rs-card">
      <div className="rs-header">Thread Tools</div>
      <div className="rs-body" style={{ padding: '0.6rem 1.1rem' }}>
        {tools.map((tool, idx) => (
          <a
            key={idx}
            className="tool-link"
            href="#"
            style={tool.isReport ? { color: '#A32D2D' } : {}}
          >
            {tool.icon} {tool.text}
          </a>
        ))}
      </div>
    </div>
  );
}
