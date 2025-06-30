
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { trackPageView, trackEvent } from '@/lib/analytics';

export interface AnalyticsData {
  totalPageViews: number;
  totalEvents: number;
  topPages: Array<{ path: string; count: number }>;
  recentActivity: Array<{ type: string; path?: string; timestamp: string }>;
}

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    totalEvents: 0,
    topPages: [],
    recentActivity: []
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch page views
      const { data: pageViews, error: pageViewError } = await supabase
        .from('page_views')
        .select('*')
        .order('timestamp', { ascending: false });

      if (pageViewError) {
        console.error('Error fetching page views:', pageViewError);
        throw new Error('Failed to fetch page views');
      }

      // Fetch events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error('Failed to fetch events');
      }

      // Check if we have basic database functions - simplified check
      try {
        await supabase.rpc('get_current_user_id');
        console.log('Basic database functions are available');
      } catch (functionError) {
        console.log('Some database functions may not be available:', functionError);
      }

      // Process the data
      const totalPageViews = pageViews?.length || 0;
      const totalEvents = events?.length || 0;

      // Calculate top pages
      const pageViewCounts: Record<string, number> = {};
      pageViews?.forEach(view => {
        pageViewCounts[view.path] = (pageViewCounts[view.path] || 0) + 1;
      });

      const topPages = Object.entries(pageViewCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get recent activity
      const allActivity = [
        ...(pageViews?.slice(0, 10).map(view => ({
          type: 'page_view',
          path: view.path,
          timestamp: view.timestamp || new Date().toISOString()
        })) || []),
        ...(events?.slice(0, 10).map(event => ({
          type: event.action,
          timestamp: event.timestamp || new Date().toISOString()
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 20);

      setData({
        totalPageViews,
        totalEvents,
        topPages,
        recentActivity: allActivity
      });

    } catch (err: any) {
      console.error('Error in fetchAnalytics:', err);
      setError(err.message);
      toast.error('Fehler beim Laden der Analytics-Daten', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackCustomEvent = async (action: string, category: string = 'custom', label?: string, value?: number) => {
    try {
      await trackEvent(action, category, label, value);
      // Refresh analytics data
      await fetchAnalytics();
      toast.success('Event erfolgreich getrackt');
    } catch (error: any) {
      console.error('Error tracking custom event:', error);
      toast.error('Fehler beim Tracken des Events', {
        description: error.message
      });
    }
  };

  const trackCustomPageView = async (path: string, referrer?: string) => {
    try {
      await trackPageView(path, referrer);
      // Refresh analytics data
      await fetchAnalytics();
      toast.success('Page View erfolgreich getrackt');
    } catch (error: any) {
      console.error('Error tracking custom page view:', error);
      toast.error('Fehler beim Tracken des Page Views', {
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
    trackCustomEvent,
    trackCustomPageView
  };
};
