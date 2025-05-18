// Google Analytics setup
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface WindowWithGA extends Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare const window: WindowWithGA;

// Initialize Google Analytics
export const initializeGA = (measurementId: string = 'G-7F24N28JNH'): void => {
  // Add Google Analytics script to the document
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  // Initialize the data layer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  // Initial configuration
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
};

// Create the execute_sql function in Supabase if it doesn't exist
export const createExecuteSqlFunction = async (): Promise<boolean> => {
  try {
    console.log('Attempting to create execute_sql function...');
    
    // Using raw SQL query instead of RPC since the function doesn't exist yet
    const { error } = await supabase
      .from('_')
      .select('*')
      .eq('id', 0)
      .then(() => {
        // Use functions.invoke instead of rest.post
        return supabase.functions.invoke('execute-sql-creation', {
          body: {
            definition: `
              BEGIN;
              -- Create the execute_sql function if it doesn't exist
              CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
              RETURNS SETOF json
              LANGUAGE plpgsql
              SECURITY DEFINER
              AS $$
              BEGIN
                EXECUTE sql;
                RETURN;
              END;
              $$;
              
              -- Grant execute permission to authenticated and anon roles
              GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
              GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;
              COMMIT;
            `
          }
        });
      });
    
    if (error) {
      console.error('Error creating execute_sql function:', error);
      // Even if there's an error here, try a direct approach as fallback
      try {
        // Try with a direct SQL query to see if we already have access
        const { data } = await supabase.rpc('execute_sql', {
          sql: 'SELECT 1;'
        });
        
        if (data) {
          console.log('execute_sql function already exists and works');
          return true;
        }
      } catch (directErr) {
        console.error('Direct SQL execution also failed:', directErr);
      }
      return false;
    } else {
      console.log('execute_sql function created or already exists');
    }
    
    return true;
  } catch (err) {
    console.error('Error creating execute_sql function:', err);
    return false;
  }
};

// First check if we can execute SQL directly as a fallback
export const testDirectTableAccess = async (): Promise<boolean> => {
  try {
    // Try a simple query to test if we can access the database
    const { data, error } = await supabase
      .from('page_views')
      .select('id')
      .limit(1);
      
    if (error) {
      console.log('Direct table access test failed:', error.message);
      return false;
    }
    
    console.log('Direct table access successful');
    return true;
  } catch (err) {
    console.error('Error testing direct table access:', err);
    return false;
  }
};

// Check if analytics tables exist
export const checkAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Checking if analytics tables exist...');
    
    // First try direct table access
    const directAccessWorks = await testDirectTableAccess();
    if (directAccessWorks) {
      console.log('Tables exist and are accessible directly!');
      return true;
    }
    
    // If direct access fails, tables may not exist, so let's try to create them
    return false;
  } catch (err) {
    console.error('Error in checkAnalyticsTables:', err);
    return false;
  }
};

// Create analytics tables if they don't exist - improved version
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // First ensure the execute_sql function exists
    await createExecuteSqlFunction();
    
    // Use rpc instead of rest.post
    try {
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          -- Create page_views table
          CREATE TABLE IF NOT EXISTS public.page_views (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            path TEXT NOT NULL,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            referrer TEXT,
            user_agent TEXT
          );

          -- Create events table
          CREATE TABLE IF NOT EXISTS public.events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            category TEXT NOT NULL,
            action TEXT NOT NULL, 
            label TEXT,
            value INTEGER,
            timestamp TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Set permissions (CRITICAL)
          ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
          
          -- Allow public insert access
          CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
            ON public.page_views FOR INSERT TO anon, authenticated
            WITH CHECK (true);
            
          CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
            ON public.events FOR INSERT TO anon, authenticated
            WITH CHECK (true);
            
          -- Allow select access
          CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
            ON public.page_views FOR SELECT TO anon, authenticated
            USING (true);
            
          CREATE POLICY IF NOT EXISTS "Allow select access to events" 
            ON public.events FOR SELECT TO anon, authenticated
            USING (true);
        `
      });
      
      if (error) {
        console.error('Error creating analytics tables with execute_sql:', error);
        
        // Try direct SQL as fallback using a functions.invoke call
        try {
          const { error: directError } = await supabase.functions.invoke('execute-sql', {
            body: {
              sql: `
                -- Create page_views table
                CREATE TABLE IF NOT EXISTS public.page_views (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  path TEXT NOT NULL,
                  timestamp TIMESTAMPTZ DEFAULT NOW(),
                  referrer TEXT,
                  user_agent TEXT
                );

                -- Create events table
                CREATE TABLE IF NOT EXISTS public.events (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  category TEXT NOT NULL,
                  action TEXT NOT NULL, 
                  label TEXT,
                  value INTEGER,
                  timestamp TIMESTAMPTZ DEFAULT NOW()
                );
                
                -- Set permissions
                ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
                ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
                
                -- Allow public insert access
                CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
                  ON public.page_views FOR INSERT TO anon, authenticated
                  WITH CHECK (true);
                  
                CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
                  ON public.events FOR INSERT TO anon, authenticated
                  WITH CHECK (true);
                  
                -- Allow select access
                CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
                  ON public.page_views FOR SELECT TO anon, authenticated
                  USING (true);
                  
                CREATE POLICY IF NOT EXISTS "Allow select access to events" 
                  ON public.events FOR SELECT TO anon, authenticated
                  USING (true);
              `
            }
          });
          
          if (directError) {
            console.error('Error with direct execute_sql call too:', directError);
            toast.error('Fehler beim Erstellen der Analytiktabellen', {
              description: `${directError.message || 'Unbekannter Fehler'}`
            });
            return false;
          }
        } catch (fallbackErr) {
          console.error('Fallback execution failed:', fallbackErr);
          return false;
        }
      }
    } catch (err) {
      console.error('Error in initial table creation attempt:', err);
      return false;
    }
    
    // Verify tables with a direct access attempt
    console.log('Tables and policies created, now verifying...');
    
    try {
      // Try accessing the tables directly
      const { data: pageViewsData, error: pageViewsError } = await supabase
        .from('page_views')
        .select('count')
        .limit(1);
        
      if (pageViewsError) {
        console.error('Error verifying page_views table:', pageViewsError);
        return false;
      }
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('count')
        .limit(1);
        
      if (eventsError) {
        console.error('Error verifying events table:', eventsError);
        return false;
      }
      
      console.log('Tables verified successfully');
      toast.success('Analytiktabellen wurden erfolgreich erstellt', {
        description: 'Die Tabellen "page_views" und "events" wurden erstellt und getestet.'
      });
      
      return true;
    } catch (testErr: any) {
      console.error('Error testing table creation:', testErr);
      return false;
    }
  } catch (err: any) {
    console.error('Error creating analytics tables:', err);
    toast.error('Fehler beim Erstellen der Analytiktabellen', {
      description: err.message || 'Ein unerwarteter Fehler ist aufgetreten.'
    });
    return false;
  }
};

// Track page views
export const trackPageView = async (path: string): Promise<void> => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-7F24N28JNH', {
      page_path: path
    });
  }
  
  // Store the page view in our database
  try {
    // Check if tables exist first
    const tablesExist = await checkAnalyticsTables();
    
    if (!tablesExist) {
      console.log('Analytics tables do not exist, skipping database storage');
      return;
    }
    
    console.log('Tracking page view:', path);
    
    // Store the page view with object notation and better error handling
    const { data, error } = await supabase
      .from('page_views')
      .insert({
        path: path,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null
      });
      
    if (error) {
      console.error('Error recording page view:', error);
    } else {
      console.log('Page view recorded successfully:', path);
    }
  } catch (err) {
    console.error('Error logging page view to database:', err);
  }
};

// Track events 
export const trackEvent = async (category: string, action: string, label?: string, value?: number): Promise<void> => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
  
  // Store the event in our database
  try {
    // Check if tables exist first
    const tablesExist = await checkAnalyticsTables();
    
    if (!tablesExist) {
      console.log('Analytics tables do not exist, skipping database storage');
      return;
    }
    
    console.log('Tracking event:', category, action);
    
    // Store the event with object notation
    const { data, error } = await supabase
      .from('events')
      .insert({
        category: category,
        action: action,
        label: label || null,
        value: value || null,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error recording event:', error);
    } else {
      console.log('Event recorded successfully:', category, action);
    }
  } catch (err) {
    console.error('Error logging event to database:', err);
  }
};

// Registration funnel tracking functions
export const trackRegistrationStart = () => {
  trackEvent('registration', 'start', 'Registration form viewed');
};

export const trackRegistrationStep = (step: string, details?: string) => {
  trackEvent('registration', 'step', `Registration step: ${step}`, details ? undefined : undefined);
};

export const trackRegistrationComplete = (method: string = 'email') => {
  trackEvent('registration', 'complete', `Registration completed via ${method}`);
};

export const trackRegistrationAbandoned = (step: string) => {
  trackEvent('registration', 'abandoned', `Registration abandoned at step: ${step}`);
};

// Track form interactions
export const trackFormInteraction = (formName: string, action: 'submit' | 'error' | 'field_complete', details?: string) => {
  trackEvent('form_interaction', action, `Form: ${formName}${details ? ` - ${details}` : ''}`);
};
