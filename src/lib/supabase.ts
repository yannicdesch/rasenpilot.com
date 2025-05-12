
import { createClient } from '@supabase/supabase-js';

// Use the provided anon key and a default URL for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ugaxwcslhoppflrbuwxv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Since we're now using fixed values, we can return true
};
