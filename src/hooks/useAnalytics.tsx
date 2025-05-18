
import { useState, useEffect } from 'react';
import { checkAnalyticsTables } from '@/lib/analytics';
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
      
      console.log('Checking analytics tables and fetching data...');
      
      // Check if the tables exist using our improved function
      const tablesExist = await checkAnalyticsTables();
      
      if (!tablesExist) {
        console.log('Analytics tables do not exist, using example data');
        
        // Return example data
        const exampleData = generateExampleData();
        setAnalyticsData(exampleData);
        return;
      }
      
      // For now we'll still use example data, but in a real implementation
      // you would fetch actual data from the tables here
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
