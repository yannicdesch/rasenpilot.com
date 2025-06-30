
import { supabase } from '@/lib/supabase';

// Track page views
export const trackPageView = async (path: string, referrer?: string, userAgent?: string) => {
  try {
    const { error } = await supabase
      .from('page_views')
      .insert([{
        path,
        referrer,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error tracking page view:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in trackPageView:', err);
    return false;
  }
};

// Track custom events
export const trackEvent = async (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  try {
    const { error } = await supabase
      .from('events')
      .insert([{
        category,
        action,
        label,
        value,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error tracking event:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in trackEvent:', err);
    return false;
  }
};

// Get analytics data
export const getAnalyticsData = async () => {
  try {
    // Get page views
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('page_views')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (pageViewsError) {
      console.error('Error fetching page views:', pageViewsError);
    }

    // Get events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    return {
      pageViews: pageViews || [],
      events: events || [],
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error getting analytics data:', err);
    return {
      pageViews: [],
      events: [],
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Test analytics functionality
export const testAnalyticsConnection = async (): Promise<boolean> => {
  try {
    // Test if we can access the analytics tables
    const { error: pageViewsError } = await supabase
      .from('page_views')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    const { error: eventsError } = await supabase
      .from('events')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    return !pageViewsError && !eventsError;
  } catch (err) {
    console.error('Analytics connection test failed:', err);
    return false;
  }
};
