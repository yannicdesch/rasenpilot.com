
// Google Analytics setup
import { supabase } from '@/lib/supabase';

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

// Track page views
export const trackPageView = async (path: string): Promise<void> => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-7F24N28JNH', {
      page_path: path
    });
  }
  
  // Store the page view in our database
  try {
    // Check if analytics table exists by directly querying it
    const { error: tableCheckError } = await supabase
      .from('page_views')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, we'll just log this and return
    if (tableCheckError && !tableCheckError.message.includes('permission')) {
      console.log('page_views table may not exist');
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
    // Check if analytics table exists by directly querying it
    const { error: tableCheckError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, we'll just log this and return
    if (tableCheckError && !tableCheckError.message.includes('permission')) {
      console.log('events table may not exist');
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
