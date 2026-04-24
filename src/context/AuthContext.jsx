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

  // Whenever the user changes, pull their profile row.
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
        .select('*')
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
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data);
  };

  const role = profile?.role || 'member';

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
