import { createClient } from '@supabase/supabase-js';

// These come from a .env file at the project root:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
//
// Never commit the real values — .env is gitignored. Use .env.example
// as the template. Vercel gets them via Environment Variables in project
// settings (Production, Preview, Development).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in dev, quiet-fail in prod build so the site still renders
  // static pages even if env isn't wired yet.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
        'Auth and DB calls will fail. Copy .env.example to .env and fill in your Supabase project credentials.'
    );
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
