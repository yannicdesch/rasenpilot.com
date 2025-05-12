
import { createClient } from '@supabase/supabase-js';

// Default URL for development (replace with your actual Supabase URL)
const defaultSupabaseUrl = 'https://your-supabase-project.supabase.co';
// Default anon key for development (replace with your actual anon key)
const defaultSupabaseAnonKey = 'your-supabase-anon-key';

// Get environment variables or use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

// Log warning if using default credentials
if (supabaseUrl === defaultSupabaseUrl || supabaseAnonKey === defaultSupabaseAnonKey) {
  console.warn('Using default Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
