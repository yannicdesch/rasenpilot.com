import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface PageView {
  id: string;
  path: string;
  timestamp: string;
  referrer: string | null;
  user_agent: string | null;
}

export interface Event {
  id: string;
  category: string;
  action: string;
  label: string | null;
  value: number | null;
  timestamp: string;
}

export interface AnalyticsData {
  dailyVisitors: { name: string; visitors: number; signups: number }[];
  weeklyVisitors: { name: string; visitors: number; signups: number }[];
  monthlyVisitors: { name: string; visitors: number; signups: number }[];
  totalVisits: number;
  totalSignups: number;
  conversionRate: number;
}

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyVisitors: [],
    weeklyVisitors: [],
    monthlyVisitors: [],
    totalVisits: 0,
    totalSignups: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching analytics data from Supabase...');
      
      // Check if the page_views table exists by directly querying it
      const { data: pageViewsData, error: pageViewsError } = await supabase.rpc('execute_sql', {
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'page_views'
        );`
      });
      
      const hasPageViewsTable = !pageViewsError && pageViewsData?.[0]?.exists;
      
      // Check if the events table exists by directly querying it
      const { data: eventsData, error: eventsError } = await supabase.rpc('execute_sql', {
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'events'
        );`
      });
      
      const hasEventsTable = !eventsError && eventsData?.[0]?.exists;
      
      if (!hasPageViewsTable || !hasEventsTable) {
        console.log('Analytics tables do not exist, using example data');
        
        // Return example data
        const exampleData = generateExampleData();
        setAnalyticsData(exampleData);
        
        toast.warning('Analytiktabellen existieren nicht in der Datenbank', {
          description: 'Erstellen Sie die Tabellen "page_views" und "events" in Supabase für echte Daten.'
        });
        
        return;
      }
      
      // For a real implementation, we would fetch actual analytics data from Supabase here
      // Since we're just demonstrating the structure, we'll use example data for now
      const exampleData = generateExampleData();
      setAnalyticsData(exampleData);
      
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      
      // Use example data as fallback
      const exampleData = generateExampleData();
      setAnalyticsData(exampleData);
      
      toast.error('Fehler beim Abrufen der Analysedaten', {
        description: 'Verwende Beispieldaten als Fallback.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  // Generate example data when no real data is available
  const generateExampleData = (): AnalyticsData => {
    return {
      dailyVisitors: [
        { name: 'Mo', visitors: 240, signups: 20 },
        { name: 'Di', visitors: 300, signups: 25 },
        { name: 'Mi', visitors: 280, signups: 18 },
        { name: 'Do', visitors: 320, signups: 30 },
        { name: 'Fr', visitors: 400, signups: 45 },
        { name: 'Sa', visitors: 380, signups: 38 },
        { name: 'So', visitors: 290, signups: 22 },
      ],
      weeklyVisitors: [
        { name: 'KW18', visitors: 1800, signups: 180 },
        { name: 'KW19', visitors: 2000, signups: 210 },
        { name: 'KW20', visitors: 2400, signups: 250 },
        { name: 'KW21', visitors: 1900, signups: 190 },
      ],
      monthlyVisitors: [
        { name: 'Jan', visitors: 6500, signups: 650 },
        { name: 'Feb', visitors: 5800, signups: 580 },
        { name: 'Mär', visitors: 7800, signups: 780 },
        { name: 'Apr', visitors: 8900, signups: 890 },
        { name: 'Mai', visitors: 9500, signups: 950 },
      ],
      totalVisits: 38500,
      totalSignups: 3850,
      conversionRate: 10
    };
  };

  return { 
    analyticsData,
    isLoading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};
