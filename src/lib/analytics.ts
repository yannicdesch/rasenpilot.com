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
    
    // Check if the tables exist using a direct query approach
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['page_views', 'events']);
      
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return false;
    }
    
    // If we got data back, check if both tables exist
    if (tablesData) {
      const tableNames = tablesData.map(t => t.table_name);
      const pageViewsExists = tableNames.includes('page_views');
      const eventsExists = tableNames.includes('events');
      
      console.log('Table check results:', { pageViewsExists, eventsExists });
      
      return pageViewsExists && eventsExists;
    }
    
    return false;
  } catch (err) {
    console.error('Error in checkAnalyticsTables:', err);
    return false;
  }
};

// Create analytics tables if they don't exist
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // Create page_views table with a direct SQL query
    const createPageViewsQuery = `
      CREATE TABLE IF NOT EXISTS page_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        path TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        referrer TEXT,
        user_agent TEXT,
        user_id UUID
      );
    `;
    
    const { error: pageViewsError } = await supabase.from('_sql').rpc('run', {
      query: createPageViewsQuery
    });
    
    if (pageViewsError) {
      console.error('Error creating page_views table:', pageViewsError);
      toast.error('Fehler beim Erstellen der page_views Tabelle', {
        description: pageViewsError.message
      });
      return false;
    }
    
    // Create indexes for page_views table
    const createPageViewsIndexesQuery = `
      CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path);
      CREATE INDEX IF NOT EXISTS page_views_timestamp_idx ON page_views (timestamp);
    `;
    
    // Try to create indexes but continue if it fails
    try {
      await supabase.from('_sql').rpc('run', {
        query: createPageViewsIndexesQuery
      });
    } catch (indexError) {
      console.warn('Could not create indexes for page_views, but continuing:', indexError);
    }
    
    // Create events table with a direct SQL query
    const createEventsQuery = `
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category TEXT NOT NULL,
        action TEXT NOT NULL,
        label TEXT,
        value INTEGER,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID
      );
    `;
    
    const { error: eventsError } = await supabase.from('_sql').rpc('run', {
      query: createEventsQuery
    });
    
    if (eventsError) {
      console.error('Error creating events table:', eventsError);
      toast.error('Fehler beim Erstellen der events Tabelle', {
        description: eventsError.message
      });
      return false;
    }
    
    // Create indexes for events table
    const createEventsIndexesQuery = `
      CREATE INDEX IF NOT EXISTS events_category_action_idx ON events (category, action);
      CREATE INDEX IF NOT EXISTS events_timestamp_idx ON events (timestamp);
    `;
    
    // Try to create indexes but continue if it fails
    try {
      await supabase.from('_sql').rpc('run', {
        query: createEventsIndexesQuery
      });
    } catch (indexError) {
      console.warn('Could not create indexes for events, but continuing:', indexError);
    }
    
    // Try alternative approach if the first doesn't work - using raw SQL
    const tryDirectSqlApproach = async () => {
      try {
        // Check if tables exist after creation attempts
        const tablesExist = await checkAnalyticsTables();
        
        if (tablesExist) {
          console.log('Tables were created successfully!');
          toast.success('Analytiktabellen wurden erfolgreich erstellt', {
            description: 'Die Tabellen "page_views" und "events" wurden in der Datenbank angelegt.'
          });
          return true;
        }
        
        // If tables don't exist, try a very simple approach with minimal SQL
        console.log('Trying simplified table creation...');
        
        // Simple page_views table
        const simplePageViewsQuery = `
          CREATE TABLE IF NOT EXISTS page_views (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            path TEXT NOT NULL,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            referrer TEXT,
            user_agent TEXT
          );
        `;
        
        await supabase.from('_sql').rpc('run', { query: simplePageViewsQuery });
        
        // Simple events table
        const simpleEventsQuery = `
          CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            category TEXT NOT NULL,
            action TEXT NOT NULL,
            label TEXT,
            value INTEGER,
            timestamp TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        
        await supabase.from('_sql').rpc('run', { query: simpleEventsQuery });
        
        // Final check
        const finalCheck = await checkAnalyticsTables();
        if (finalCheck) {
          console.log('Tables were created with simplified approach!');
          toast.success('Analytiktabellen wurden erfolgreich erstellt', {
            description: 'Die Tabellen wurden mit einem vereinfachten Ansatz erstellt.'
          });
          return true;
        } else {
          console.error('Failed to create tables with all approaches');
          return false;
        }
      } catch (directError) {
        console.error('Failed with direct SQL approach:', directError);
        return false;
      }
    };
    
    // Verify tables were created
    const tablesExist = await checkAnalyticsTables();
    
    if (tablesExist) {
      console.log('Successfully created analytics tables!');
      toast.success('Analytiktabellen wurden erfolgreich erstellt', {
        description: 'Die Tabellen "page_views" und "events" wurden in der Datenbank angelegt.'
      });
      return true;
    } else {
      // Try the alternative approach
      return await tryDirectSqlApproach();
    }
  } catch (err) {
    console.error('Error creating analytics tables:', err);
    toast.error('Fehler beim Erstellen der Analytiktabellen', {
      description: 'Bitte überprüfen Sie die Konsolenausgabe für Details.'
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
