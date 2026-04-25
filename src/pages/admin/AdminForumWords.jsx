import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  listBlockedWords,
  addBlockedWord,
  removeBlockedWord,
} from '../../lib/forumAdminDb.js';

/**
 * /admin/forums/words — manage the server-side blocked-word list.
 *
 * Words added here are checked by BEFORE INSERT triggers on
 * forum_threads (title) and forum_posts (body). Match → reject
 * with a "language we don't allow" error. Staff users bypass.
 *
 * Three severity buckets just so the table reads cleaner:
 *   profanity / slur / minor (sexualized minor terms)
 */
export default function AdminForumWords() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [okMsg, setOkMsg] = useState(null);
  const [newWord, setNewWord] = useState('');
  const [newSeverity, setNewSeverity] = useState('profanity');

  const reload = async () => {
    setLoading(true);
    const { data, error } = await listBlockedWords();
    setRows(data);
    setErr(error?.message || null);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setErr(null); setOkMsg(null);
    if (!newWord.trim()) return;
    setBusy(true);
    const { error } = await addBlockedWord(newWord, newSeverity);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setNewWord('');
    setOkMsg('Added.');
    setTimeout(() => setOkMsg(null), 2500);
    reload();
  };

  const handleRemove = async (row) => {
    if (!window.confirm(`Remove "${row.word}" from the blocklist?`)) return;
    setBusy(true);
    const { error } = await removeBlockedWord(row.id);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    reload();
  };

  // Group for cleaner reading
  const grouped = {
    slur:      rows.filter((r) => r.severity === 'slur'),
    minor:     rows.filter((r) => r.severity === 'minor'),
    profanity: rows.filter((r) => r.severity === 'profanity'),
  };

  return (
    <AdminLayout
      title="Blocked words"
      subtitle="Server-enforced filter for thread titles and post bodies."
      actions={
        <Link to="/admin/forums" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
          ← Back to forum mod.
        </Link>
      }
    >
      {/* Add form */}
      <form onSubmit={handleAdd} style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '0.85rem 1rem',
      }}>
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Word or phrase to block…"
          maxLength={80}
          style={{
            flex: 1, minWidth: 180,
            padding: '0.55rem 0.85rem',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'inherit',
          }}
          disabled={busy}
        />
        <select
          value={newSeverity}
          onChange={(e) => setNewSeverity(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13.5,
            fontFamily: 'inherit',
            background: 'var(--white)',
          }}
          disabled={busy}
        >
          <option value="profanity">Profanity</option>
          <option value="slur">Slur</option>
          <option value="minor">Minor (zero-tolerance)</option>
        </select>
        <button
          type="submit"
          className="cart-btn primary"
          disabled={busy || !newWord.trim()}
          style={{ padding: '0.55rem 1rem', fontSize: 13.5 }}
        >
          {busy ? 'Adding…' : 'Add to list'}
        </button>
      </form>

      {err && <div className="cart-err" style={{ marginBottom: '1rem' }}>{err}</div>}
      {okMsg && <div className="cart-ok" style={{ marginBottom: '1rem' }}>{okMsg}</div>}

      {/* Rate-limit info card */}
      <RateLimitCard />

      {/* Word list, grouped */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No words on the blocklist.
        </div>
      ) : (
        <>
          <WordGroup label="Slurs" rows={grouped.slur} onRemove={handleRemove} busy={busy} />
          <WordGroup label="Zero-tolerance" rows={grouped.minor} onRemove={handleRemove} busy={busy} />
          <WordGroup label="Profanity" rows={grouped.profanity} onRemove={handleRemove} busy={busy} />
        </>
      )}
    </AdminLayout>
  );
}

function WordGroup({ label, rows, onRemove, busy }) {
  if (!rows || rows.length === 0) return null;
  return (
    <section style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '1rem 1.1rem',
      marginBottom: '0.85rem',
    }}>
      <h3 style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        margin: '0 0 0.65rem',
      }}>{label} · {rows.length}</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <span key={r.id} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 4px 4px 10px',
            background: '#FDFBF5',
            border: '1px solid var(--border-light)',
            borderRadius: 999,
            fontSize: 13,
            fontFamily: 'monospace',
          }}>
            {r.word}
            <button
              type="button"
              onClick={() => onRemove(r)}
              disabled={busy}
              aria-label={'Remove ' + r.word}
              title="Remove"
              style={{
                width: 22, height: 22,
                borderRadius: '50%',
                border: 'none',
                background: '#fef2f2',
                color: '#991b1b',
                cursor: busy ? 'wait' : 'pointer',
                fontSize: 14,
                lineHeight: 1,
                fontFamily: 'inherit',
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}

function RateLimitCard() {
  return (
    <div style={{
      background: '#FDF6E8',
      border: '1px solid #E5C77A',
      borderRadius: 10,
      padding: '0.85rem 1.1rem',
      marginBottom: '1rem',
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.55,
    }}>
      <strong style={{ color: 'var(--text-primary)', fontFamily: 'Montserrat, sans-serif' }}>
        Current rate limits
      </strong>
      <ul style={{ margin: '6px 0 0', paddingLeft: '1.2rem' }}>
        <li>Threads: <strong>2 per author per hour</strong></li>
        <li>Replies: <strong>30 per author per hour</strong></li>
        <li>Staff (moderator / admin / owner) bypass both</li>
      </ul>
      <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
        To change, edit the constants in{' '}
        <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4 }}>
          supabase/migration-forum-moderation.sql
        </code>{' '}
        and re-run the migration.
      </div>
    </div>
  );
}
