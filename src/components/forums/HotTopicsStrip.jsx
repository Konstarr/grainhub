export default function HotTopicsStrip({ topics }) {
  return (
    <div className="hot-strip">
      <span className="hot-label">🔥 Trending</span>
      <div className="hot-topics">
        {topics.map((topic, idx) => (
          <span key={idx} className="hot-topic">
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
