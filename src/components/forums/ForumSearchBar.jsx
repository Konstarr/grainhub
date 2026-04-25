import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchForumThreads } from '../../lib/forumDb.js';
import { FORUM_GROUPS } from '../../data/forumsData.js';

function findCategoryName(id) {
  for (const g of FORUM_GROUPS) {
    const c = g.categories.find((c) => c.id === id);
    if (c) return c.name;
  }
  return null;
}

function timeAgo(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + 'm';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h';
  const d = Math.floor(hr / 24);
  if (d < 30) return d + 'd';
  return new Date(iso).toLocaleDateString();
}

export default function ForumSearchBar({
  placeholder = 'Search threads…',
  initialValue = '',
  size = 'md',
  className = '',
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); setLoading(false); return; }
    const myReq = ++reqIdRef.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await searchForumThreads(term, { limit: 8 });
      if (myReq !== reqIdRef.current) return;
      setHits(data || []);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const goToResults = () => {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    navigate('/forums/search?q=' + encodeURIComponent(term));
  };

  const goToHit = (h) => {
    setOpen(false);
    navigate('/forums/thread/' + h.slug);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (active >= 0 && hits[active]) {
        e.preventDefault();
        goToHit(hits[active]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const submit = (e) => { e.preventDefault(); goToResults(); };

  return (
    <div ref={wrapRef} className={`fsb-wrap fsb-wrap-${size} ${className}`}>
      <form onSubmit={submit} className={`fsb fsb-${size}`}>
        <span className="fsb-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => { if (q.trim().length >= 2) setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search forum"
          aria-expanded={open}
          autoComplete="off"
          className="fsb-input"
        />
        <button type="submit" className="fsb-submit" disabled={!q.trim()}>
          Search
        </button>
      </form>

      {open && q.trim().length >= 2 && (
        <div className="fsb-dropdown" role="listbox">
          {loading && hits.length === 0 ? (
            <div className="fsb-empty">Searching…</div>
          ) : hits.length === 0 ? (
            <div className="fsb-empty">
              No threads match &ldquo;{q}&rdquo;.
              <button type="button" className="fsb-empty-cta" onClick={goToResults}>
                See all results →
              </button>
            </div>
          ) : (
            <>
              {hits.map((h, i) => (
                <button
                  key={h.id}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={'fsb-hit ' + (i === active ? 'fsb-hit-active' : '')}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => goToHit(h)}
                >
                  <div className="fsb-hit-title">{h.title}</div>
                  <div className="fsb-hit-meta">
                    {findCategoryName(h.category_id) && (
                      <span className="fsb-hit-cat">{findCategoryName(h.category_id)}</span>
                    )}
                    <span>{h.reply_count || 0} replies</span>
                    <span>·</span>
                    <span>{timeAgo(h.last_reply_at || h.created_at)}</span>
                  </div>
                </button>
              ))}
              <button type="button" className="fsb-see-all" onClick={goToResults}>
                See all results for &ldquo;{q}&rdquo; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
