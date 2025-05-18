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
    
    // Check if page_views table exists by querying it directly
    const { count: pageViewsCount, error: pageViewsError } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });
    
    if (pageViewsError) {
      if (pageViewsError.code === '42P01') { // Table doesn't exist code
        console.log('page_views table does not exist');
        return false;
      }
      console.error('Error checking page_views table:', pageViewsError);
    }
    
    // Check if events table exists by querying it directly
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (eventsError) {
      if (eventsError.code === '42P01') { // Table doesn't exist code
        console.log('events table does not exist');
        return false;
      }
      console.error('Error checking events table:', eventsError);
    }
    
    // If we get here without errors or with non-42P01 errors, tables likely exist
    const tablesExist = !pageViewsError || pageViewsError.code !== '42P01';
    console.log('Tables exist check result:', tablesExist);
    return tablesExist;
  } catch (err) {
    console.error('Error in checkAnalyticsTables:', err);
    return false;
  }
};

// Create analytics tables if they don't exist
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // Create page_views table
    const createPageViewsResult = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          path TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          referrer TEXT,
          user_agent TEXT
        );
      `
    });
    
    if (createPageViewsResult.error) {
      console.error('Error creating page_views table:', createPageViewsResult.error);
      toast.error('Fehler beim Erstellen der page_views Tabelle', {
        description: createPageViewsResult.error.message
      });
      return false;
    }
    
    console.log('page_views table created successfully');
    
    // Create events table
    const createEventsResult = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category TEXT NOT NULL,
          action TEXT NOT NULL,
          label TEXT,
          value INTEGER,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (createEventsResult.error) {
      console.error('Error creating events table:', createEventsResult.error);
      toast.error('Fehler beim Erstellen der events Tabelle', {
        description: createEventsResult.error.message
      });
      return false;
    }
    
    console.log('events table created successfully');
    
    // Verify tables were created
    const tablesExist = await checkAnalyticsTables();
    
    if (tablesExist) {
      console.log('Successfully created analytics tables!');
      toast.success('Analytiktabellen wurden erfolgreich erstellt', {
        description: 'Die Tabellen "page_views" und "events" wurden in der Datenbank angelegt.'
      });
      return true;
    } else {
      console.error('Tables were not successfully created');
      toast.error('Fehler beim Erstellen der Tabellen', {
        description: 'Die Tabellen konnten nicht erstellt werden.'
      });
      return false;
    }
  } catch (err: any) {
    console.error('Error creating analytics tables:', err);
    toast.error('Fehler beim Erstellen der Analytiktabellen', {
      description: err.message || 'Bitte überprüfen Sie die Konsolenausgabe für Details.'
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
