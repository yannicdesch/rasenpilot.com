
import { supabase } from '@/lib/supabase';

// Extract UTM parameters from current URL
const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
  };
};

// Get clean referrer (filter out own domain)
const getCleanReferrer = (): string | null => {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const refUrl = new URL(ref);
    const own = window.location.hostname;
    // Filter out self-referrals and lovable preview domains
    if (refUrl.hostname === own || refUrl.hostname.includes('lovable.app')) {
      return null;
    }
    return ref;
  } catch {
    return ref || null;
  }
};

// Track page views with referrer and UTM params
export const trackPageView = async (path: string, referrer?: string, userAgent?: string) => {
  try {
    const utm = getUtmParams();
    const cleanReferrer = referrer ?? getCleanReferrer();

    const { error } = await supabase
      .from('page_views')
      .insert([{
        path,
        referrer: cleanReferrer,
        user_agent: userAgent || navigator.userAgent,
        timestamp: new Date().toISOString(),
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
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
    const { error: pageViewsError } = await supabase
      .from('page_views')
      .select('*', { count: 'exact' })
      .limit(1);

    const { error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .limit(1);

    return !pageViewsError && !eventsError;
  } catch (err) {
    console.error('Analytics connection test failed:', err);
    return false;
  }
};
