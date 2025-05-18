
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
    
    // Check both tables with a simple direct query approach
    const { data: pageViewsData, error: pageViewsError } = await supabase
      .from('page_views')
      .select('count(*)', { count: 'exact', head: true });
      
    if (pageViewsError) {
      console.log('page_views table does not exist:', pageViewsError.message);
      return false;
    }
    
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('count(*)', { count: 'exact', head: true });
    
    if (eventsError) {
      console.log('events table does not exist:', eventsError.message);
      return false;
    }
    
    console.log('Both analytics tables exist');
    return true;
  } catch (err) {
    console.error('Error checking analytics tables:', err);
    return false;
  }
};

// Create analytics tables if they don't exist
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Creating analytics tables...');
    
    // Create tables using direct SQL for maximum compatibility
    // First create the page_views table
    const { error: pageViewsError } = await supabase
      .rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS page_views (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            path TEXT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            referrer TEXT,
            user_agent TEXT,
            user_id UUID
          );
          CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path);
          CREATE INDEX IF NOT EXISTS page_views_timestamp_idx ON page_views (timestamp);
        `
      });
    
    if (pageViewsError) {
      console.error('Error creating page_views table:', pageViewsError);
      
      // Try alternative approach with simple table creation only
      const { error: fallbackError } = await supabase
        .rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS page_views (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              path TEXT NOT NULL,
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              referrer TEXT,
              user_agent TEXT,
              user_id UUID
            );
          `
        });
      
      if (fallbackError) {
        console.error('Fallback page_views table creation failed:', fallbackError);
        return false;
      }
    }
    
    // Create the events table
    const { error: eventsError } = await supabase
      .rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            category TEXT NOT NULL,
            action TEXT NOT NULL,
            label TEXT,
            value INTEGER,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID
          );
          CREATE INDEX IF NOT EXISTS events_category_action_idx ON events (category, action);
          CREATE INDEX IF NOT EXISTS events_timestamp_idx ON events (timestamp);
        `
      });
    
    if (eventsError) {
      console.error('Error creating events table:', eventsError);
      
      // Try alternative approach with simple table creation only
      const { error: fallbackError } = await supabase
        .rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS events (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              category TEXT NOT NULL,
              action TEXT NOT NULL,
              label TEXT,
              value INTEGER,
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              user_id UUID
            );
          `
        });
      
      if (fallbackError) {
        console.error('Fallback events table creation failed:', fallbackError);
        return false;
      }
    }
    
    // Verify both tables were created
    const tablesExist = await checkAnalyticsTables();
    
    if (tablesExist) {
      console.log('Successfully created analytics tables!');
      toast.success('Analytiktabellen wurden erfolgreich erstellt', {
        description: 'Die Tabellen "page_views" und "events" wurden in der Datenbank angelegt.'
      });
      return true;
    } else {
      console.error('Tables were not created successfully');
      toast.error('Fehler beim Erstellen der Analytiktabellen', {
        description: 'Die Tabellenerstellung scheint fehlgeschlagen zu sein.'
      });
      return false;
    }
  } catch (err) {
    console.error('Error creating analytics tables:', err);
    toast.error('Fehler beim Erstellen der Analytiktabellen', {
      description: 'Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.'
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
    
    // Store the page view
    const { error } = await supabase
      .from('page_views')
      .insert([
        { 
          path,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        }
      ]);
      
    if (error) {
      console.error('Error recording page view:', error);
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
    
    // Store the event
    const { error } = await supabase
      .from('events')
      .insert([
        { 
          category,
          action,
          label,
          value,
          timestamp: new Date().toISOString()
        }
      ]);
      
    if (error) {
      console.error('Error recording event:', error);
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
