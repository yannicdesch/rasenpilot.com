
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

// Check if analytics tables exist
export const checkAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Checking if analytics tables exist...');
    
    // Check if we can access the page_views table
    const { data: pageViewsData, error: pageViewsError } = await supabase
      .from('page_views')
      .select('count(*)')
      .limit(1)
      .single();
    
    if (pageViewsError) {
      console.log('Error checking page_views:', pageViewsError.message);
      return false;
    }
    
    // Also check events table
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('count(*)')
      .limit(1)
      .single();
    
    if (eventsError) {
      console.log('Error checking events table:', eventsError.message);
      return false;
    }
    
    console.log('Analytics tables exist!', { pageViewsData, eventsData });
    return true;
  } catch (err) {
    console.error('Error in checkAnalyticsTables:', err);
    return false;
  }
};

// Create analytics tables if they don't exist - improved version
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // Create page_views table with a simpler approach - one SQL statement for both tables
    const createTablesResult = await supabase.rpc('execute_sql', {
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
        CREATE POLICY "Allow public inserts to page_views" 
          ON public.page_views FOR INSERT TO anon, authenticated
          WITH CHECK (true);
          
        CREATE POLICY "Allow public inserts to events" 
          ON public.events FOR INSERT TO anon, authenticated
          WITH CHECK (true);
      `
    });
    
    if (createTablesResult.error) {
      console.error('Error creating analytics tables:', createTablesResult.error);
      toast.error('Fehler beim Erstellen der Analytiktabellen', {
        description: `${createTablesResult.error.message}`
      });
      return false;
    }
    
    console.log('Tables and policies created, now verifying...');
    
    // Verify tables were created by trying to insert test records
    const testPageView = await supabase
      .from('page_views')
      .insert({
        path: '/test-page-view',
        timestamp: new Date().toISOString(),
        referrer: 'test-referrer',
        user_agent: 'test-agent'
      })
      .select()
      .single();
      
    const testEvent = await supabase
      .from('events')
      .insert({
        category: 'test',
        action: 'create-tables-verification',
        label: 'test-label',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    // Check if we got any errors during the test insertions
    if (testPageView.error || testEvent.error) {
      console.error('Error testing table access:', { 
        pageViewError: testPageView.error, 
        eventError: testEvent.error 
      });
      
      toast.error('Tabellen wurden erstellt, aber Schreibzugriff fehlgeschlagen', {
        description: 'Berechtigungen könnten nicht korrekt eingerichtet sein.'
      });
      
      return false;
    }
    
    // If we got here, tables were created and are accessible
    console.log('Successfully created and verified analytics tables!');
    toast.success('Analytiktabellen wurden erfolgreich erstellt', {
      description: 'Die Tabellen "page_views" und "events" wurden erstellt und getestet.'
    });
    
    return true;
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
