
import { createClient } from '@supabase/supabase-js';

// We'll use empty strings as fallbacks instead of placeholders
// This makes it clearer that these are missing values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// This will be true if either URL or key is missing
const isUsingDefaultCredentials = !supabaseUrl || !supabaseAnonKey;

// Log warning if using default/empty credentials
if (isUsingDefaultCredentials) {
  console.warn('Using default Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

// Create the client only if we have both URL and key
export const supabase = isUsingDefaultCredentials 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};
