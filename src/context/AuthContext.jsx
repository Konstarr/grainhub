import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// -----------------------------------------------------------------------------
// AuthContext
// -----------------------------------------------------------------------------
// Wraps the whole app. Holds the current Supabase session + profile row, and
// exposes helpers for signup / login / logout. Components that need to know
// "is the user logged in" call useAuth() — no direct supabase imports needed.
// -----------------------------------------------------------------------------

const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the current session on mount, then subscribe to changes.
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // Whenever the user changes, pull their profile row. We deliberately
  // enumerate the columns we need in the app rather than select('*') —
  // moderation-only fields (mod_note, is_shadowbanned) and sensitive
  // notes (sponsor_notes) shouldn't be pulled into client state where
  // they could be surfaced accidentally via devtools or bug reports.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, full_name, bio, avatar_url, trade, location, website,
          role, reputation, thread_count, post_count, joined_at, created_at,
          is_verified, is_suspended,
          account_type, business_name, business_website, business_verified,
          business_contact_email, business_phone, business_trade, business_size,
          sponsor_tier, sponsor_company,
          can_post_forums, can_post_marketplace, can_post_jobs, can_submit_events,
          email_digest, notify_mentions, notify_replies, newsletter_optin,
          profile_public, show_on_leaderboard, email_visible
        `)
        .eq('id', uid)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[auth] failed to load profile', error);
        setProfile(null);
        return;
      }
      setProfile(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signUp = async ({
    email,
    password,
    fullName,
    username,
    accountType = 'individual',     // 'individual' | 'business'
    businessName,
    businessWebsite,
    businessContactEmail,
    businessPhone,
    businessTrade,
    businessSize,
  }) => {
    const metadata = {
      full_name: fullName,
      preferred_username: username,
      account_type: accountType,
    };
    if (accountType === 'business') {
      metadata.business_name           = businessName || null;
      metadata.business_website        = businessWebsite || null;
      metadata.business_contact_email  = businessContactEmail || null;
      metadata.business_phone          = businessPhone || null;
      metadata.business_trade          = businessTrade || null;
      metadata.business_size           = businessSize || null;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) return { error };
    // Profile row is auto-created by the on_auth_user_created trigger
    // (see migration-business-accounts.sql), which reads everything out
    // of the metadata block above. We patch the username as a best-effort
    // in case the caller wanted a value that didn't survive a collision.
    if (data.user && username) {
      await supabase
        .from('profiles')
        .update({ username, full_name: fullName })
        .eq('id', data.user.id);
    }
    return { data };
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    // Use the SECURITY DEFINER RPC so we can read ALL columns on the
    // caller's own row — direct SELECT on public.profiles is column-
    // restricted to the safe public projection (see migration-hardening.sql).
    const { data, error } = await supabase.rpc('get_my_profile');
    if (error) {
      // Fallback: read the safe public projection so the app still boots
      // with the role column populated (admin menu will still work).
      const fb = await supabase
        .from('profiles')
        .select(
          'id, username, full_name, bio, avatar_url, trade, location, website,' +
          'role, reputation, thread_count, post_count, joined_at, created_at,' +
          'is_verified, is_suspended,' +
          'account_type, business_name, business_website, business_verified,' +
          'sponsor_tier, sponsor_company,' +
          'profile_public, show_on_leaderboard, email_visible'
        )
        .eq('id', uid)
        .maybeSingle();
      setProfile(fb.data || null);
      return;
    }
    // RPC returns an array (setof); take the first row.
    setProfile(Array.isArray(data) ? data[0] || null : data || null);
  };

  // Primary source of truth for role: the loaded profile row.
  // Safety backstop: if the profile query silently failed (column grants
  // or missing RPC), fall back to recognizing the hard-coded owner email
  // so staff-gated UI still renders. The DB still enforces admin access
  // on every request — this only controls client-side menu visibility.
  const OWNER_EMAIL = 'apkrichie@gmail.com';
  const emailIsOwner =
    session?.user?.email &&
    session.user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const role = profile?.role || (emailIsOwner ? 'owner' : 'member');

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthed: !!session?.user,
    isModerator: ['moderator', 'admin', 'owner'].includes(role),
    isAdmin: ['admin', 'owner'].includes(role),
    isOwner: role === 'owner',
    isStaff: ['moderator', 'admin', 'owner'].includes(role),
    role,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
