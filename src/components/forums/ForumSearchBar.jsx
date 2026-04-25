import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForumSearchBar({
  placeholder = 'Search threads…',
  initialValue = '',
  size = 'md',
  className = '',
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initialValue);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate('/forums/search?q=' + encodeURIComponent(term));
  };

  return (
    <form onSubmit={submit} className={`fsb fsb-${size} ${className}`}>
      <span className="fsb-icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search forum"
        className="fsb-input"
      />
      <button type="submit" className="fsb-submit" disabled={!q.trim()}>
        Search
      </button>
    </form>
  );
}
