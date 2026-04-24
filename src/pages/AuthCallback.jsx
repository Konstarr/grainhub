import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

/**
 * /auth/callback — the page every OAuth provider redirects to after
 * a successful sign-in. Supabase has already exchanged the code +
 * written the session cookie by the time React mounts this page.
 *
 * What we do here:
 *   1) Wait for supabase.auth.getSession() to report a session.
 *   2) If we see a "signup:accountType" in sessionStorage, use it to
 *      patch the caller's profile with account_type = 'business' |
 *      'individual' (the OAuth handshake creates a profile row via
 *      the handle_new_user trigger, but it defaults to individual —
 *      we want to honor the persona picker).
 *   3) Route the user to /pricing (business) or the homepage.
 *
 * This page also doubles as the sign-IN callback for returning
 * users — in that case there's no accountType in sessionStorage
 * and we just bounce them to home.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Signing you in…');
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Give Supabase a beat to process the URL hash/query params.
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error || !data?.session) {
        setErr(error?.message || 'Could not complete sign-in.');
        return;
      }
      const uid = data.session.user.id;

      // Honor the persona the user selected in the picker before
      // they clicked an OAuth button.
      let redirect = '/';
      try {
        const persona = sessionStorage.getItem('signup:accountType');
        if (persona === 'business' || persona === 'individual') {
          setStatus('Finishing account setup…');
          const { error: patchErr } = await supabase
            .from('profiles')
            .update({ account_type: persona })
            .eq('id', uid);
          if (patchErr) {
            // eslint-disable-next-line no-console
            console.warn('[auth callback] account_type patch failed:', patchErr.message);
          }
          // Businesses land on the pricing page so they can pick
          // role packs right away; individuals go to their feed.
          redirect = persona === 'business' ? '/pricing?persona=business' : '/';
          sessionStorage.removeItem('signup:accountType');
        }
      } catch (_) { /* storage disabled — skip */ }

      if (!cancelled) navigate(redirect, { replace: true });
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Montserrat, sans-serif',
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(43, 26, 14, 0.08)',
      }}>
        {err ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Sign-in didn't complete
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {err}
            </div>
            <button
              type="button"
              onClick={() => navigate('/signup', { replace: true })}
              style={{
                marginTop: '1.25rem',
                padding: '10px 20px',
                background: 'var(--wood-warm)',
                color: '#fff',
                border: 0,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <div style={{
              width: 40,
              height: 40,
              margin: '0 auto 1rem',
              border: '3px solid var(--wood-cream)',
              borderTopColor: 'var(--wood-warm)',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {status}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
              Hold tight — this takes a second.
            </div>
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
          </>
        )}
      </div>
    </div>
  );
}
