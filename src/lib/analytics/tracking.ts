
import { supabase } from '@/lib/supabase';
import { checkAnalyticsTables } from './tableFunctions';

interface WindowWithGA extends Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare const window: WindowWithGA;

// Get Supabase connection info for debugging without accessing protected properties
export const getSupabaseConnectionInfo = () => {
  return {
    url: typeof supabase !== 'undefined' ? 'configured' : null,
    hasApiKey: typeof supabase !== 'undefined'
  };
};

// Test Supabase connection with a dummy request
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection with a dummy request...');
    
    // Try a simple query that doesn't modify data
    const { data, error } = await supabase
      .from('page_views')
      .select('count(*)')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.log('Supabase connection test failed:', error.message);
      
      // Check if table doesn't exist vs other errors
      if (error.code === '42P01') {
        console.log('Table does not exist - this is expected if tables are not created yet');
        return true; // Connection works, just table missing
      }
      
      return false;
    }
    
    console.log('Supabase connection test succeeded:', data);
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
};

// Track page views with improved error handling
export const trackPageView = async (path: string): Promise<void> => {
  // Google Analytics tracking
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-7F24N28JNH', {
      page_path: path
    });
    console.log('Google Analytics page view tracked:', path);
  } else {
    console.log('Google Analytics not available, skipping GA tracking');
  }
  
  // Store the page view in our database
  try {
    // Check if tables exist first
    const tablesExist = await checkAnalyticsTables();
    
    if (!tablesExist) {
      console.log('Analytics tables do not exist, skipping database storage');
      return;
    }
    
    console.log('Tracking page view in database:', path);
    
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
      // Check if we're getting permission errors which might indicate RLS issues
      if (error.message.includes('permission') || error.code === 'PGRST301') {
        console.error('Permission error - check RLS policies on page_views table');
      }
    } else {
      console.log('Page view recorded successfully:', path);
    }
  } catch (err) {
    console.error('Error logging page view to database:', err);
  }
};

// Track events with GA4 optimized naming and improved error handling
export const trackEvent = async (category: string, action: string, label?: string, value?: number): Promise<void> => {
  // Google Analytics tracking
  if (typeof window.gtag !== 'undefined') {
    // For GA4, we'll use the event name as the action for better categorization
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
    console.log('Google Analytics event tracked:', category, action, label);
  } else {
    console.log('Google Analytics not available, skipping GA tracking');
  }
  
  // Store the event in our database
  try {
    // Check if tables exist first
    const tablesExist = await checkAnalyticsTables();
    
    if (!tablesExist) {
      console.log('Analytics tables do not exist, skipping database storage');
      return;
    }
    
    console.log('Tracking event in database:', category, action);
    
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
      // Check if we're getting permission errors which might indicate RLS issues
      if (error.message.includes('permission') || error.code === 'PGRST301') {
        console.error('Permission error - check RLS policies on events table');
      }
    } else {
      console.log('Event recorded successfully:', category, action);
    }
  } catch (err) {
    console.error('Error logging event to database:', err);
  }
};
