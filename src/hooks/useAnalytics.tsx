
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AnalyticsData {
  totalPageViews: number;
  totalEvents: number;
  topPages: Array<{ path: string; count: number }>;
  recentActivity: Array<{
    type: string;
    path?: string;
    timestamp: string;
  }>;
}

const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    totalEvents: 0,
    topPages: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch page views
      let pageViews: any[] = [];
      let events: any[] = [];

      try {
        const { data: pageViewData, error: pageViewError } = await supabase
          .from('page_views')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!pageViewError) {
          pageViews = pageViewData || [];
        }
      } catch (err) {
        console.error('Error fetching page views:', err);
      }

      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!eventError) {
          events = eventData || [];
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }

      // Process the data
      const topPages = pageViews.reduce((acc: Record<string, number>, view) => {
        acc[view.path] = (acc[view.path] || 0) + 1;
        return acc;
      }, {});

      const topPagesArray = Object.entries(topPages)
        .map(([path, count]) => ({ path, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const recentActivity = [
        ...pageViews.slice(0, 10).map(view => ({
          type: 'Page View',
          path: view.path,
          timestamp: view.timestamp
        })),
        ...events.slice(0, 10).map(event => ({
          type: event.action,
          path: event.label,
          timestamp: event.timestamp
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      setData({
        totalPageViews: pageViews.length,
        totalEvents: events.length,
        topPages: topPagesArray,
        recentActivity
      });

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Error fetching analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const trackPageView = async (path: string) => {
    try {
      await supabase
        .from('page_views')
        .insert([{
          path,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          user_agent: navigator.userAgent
        }]);
    } catch (err) {
      console.error('Error tracking page view:', err);
    }
  };

  const trackEvent = async (category: string, action: string, label?: string) => {
    try {
      await supabase
        .from('events')
        .insert([{
          category,
          action,
          label,
          timestamp: new Date().toISOString()
        }]);
    } catch (err) {
      console.error('Error tracking event:', err);
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
    trackPageView,
    trackEvent
  };
};

export default useAnalytics;
