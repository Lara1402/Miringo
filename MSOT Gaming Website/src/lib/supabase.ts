import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rjwjanjpctypununlzbv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_publishable_key' &&
  !supabaseAnonKey.startsWith('placeholder')
);

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase is not fully configured. Please provide VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
  );
}

// Fallback client to prevent import errors if keys are not yet set
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'dummy-key-for-initialization',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
