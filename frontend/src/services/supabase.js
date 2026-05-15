import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const invalidUrl = !SUPABASE_URL || SUPABASE_URL.includes('your-supabase-project-url');
const invalidKey = !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-public-anon-key');

if (invalidUrl || invalidKey) {
  throw new Error(
    'Invalid Supabase config. Replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or .env.local with your real Supabase project values.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
