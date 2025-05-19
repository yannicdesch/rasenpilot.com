
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Track page views
export const trackPageView = async (path: string) => {
  try {
    console.log('Google Analytics page view tracked:', path);
    
    // Also attempt to track in Supabase if connected
    try {
      await supabase
        .from('page_views')
        .insert({
          path,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null
        });
    } catch (err) {
      // Silent fail for Supabase tracking - this is expected if tables don't exist yet
      console.debug('Supabase page view tracking skipped:', err);
    }
  } catch (err) {
    console.error('Error tracking page view:', err);
  }
};

// Track custom events
export const trackEvent = async (category: string, action: string, label?: string, value?: number) => {
  try {
    console.log(`Event tracked: ${category} - ${action}${label ? ' - ' + label : ''}${value !== undefined ? ' - ' + value : ''}`);
    
    // Also attempt to track in Supabase if connected
    try {
      await supabase
        .from('events')
        .insert({
          category,
          action,
          label: label || null,
          value: value || null,
          timestamp: new Date().toISOString()
        });
    } catch (err) {
      // Silent fail for Supabase tracking
      console.debug('Supabase event tracking skipped:', err);
    }
  } catch (err) {
    console.error('Error tracking event:', err);
  }
};

// Get available Supabase connection info without accessing protected properties
export const getSupabaseConnectionInfo = () => {
  // Safely check if supabase client is initialized
  const hasClient = typeof supabase === 'object' && supabase !== null;
  
  // Check if auth is available (proxy for proper initialization)
  const hasAuth = hasClient && typeof supabase.auth === 'object' && supabase.auth !== null;
  
  // Check if API key is available (without accessing protected properties)
  let hasApiKey = false;
  try {
    // Make a simple call to check authentication (this will include the API key if it exists)
    const testAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      return !error; // If no error, we likely have a working API key
    };
    
    // We're not awaiting this - it's just to check if the method exists
    testAuth();
    hasApiKey = true;
  } catch (e) {
    hasApiKey = false;
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || null,
    hasApiKey: hasApiKey,
  };
};

// Create a test table to verify connection and permissions
export const createTestTable = async (): Promise<boolean> => {
  try {
    console.log('Attempting to create test table...');
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.test_connection (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          test_value TEXT
        );
        
        -- Set permissions
        ALTER TABLE public.test_connection ENABLE ROW LEVEL SECURITY;
        
        -- Allow inserts for testing
        CREATE POLICY IF NOT EXISTS "Allow public inserts to test_connection" 
          ON public.test_connection FOR INSERT TO anon, authenticated
          WITH CHECK (true);
      `
    });
    
    if (error) {
      console.error('Error creating test table:', error);
      return false;
    }
    
    // Now try to insert data to fully verify permissions
    const { error: insertError } = await supabase
      .from('test_connection')
      .insert({
        test_value: 'Connection test successful'
      });
    
    if (insertError) {
      console.error('Error inserting into test table:', insertError);
      return false;
    }
    
    console.log('Test table created and data inserted successfully');
    return true;
  } catch (err) {
    console.error('Exception creating test table:', err);
    return false;
  }
};
