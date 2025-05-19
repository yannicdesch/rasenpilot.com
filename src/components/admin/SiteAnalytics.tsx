
import React, { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnalyticsHeader from './analytics/AnalyticsHeader';
import TableCreationAlert from './analytics/TableCreationAlert';
import StatisticCards from './analytics/StatisticCards';
import VisitorChart from './analytics/VisitorChart';
import AnalyticsInfoCard from './analytics/AnalyticsInfoCard';
import { getSupabaseConnectionInfo } from '@/lib/analytics';
import { testSupabaseConnection } from '@/lib/analytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const SiteAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [metricType, setMetricType] = useState('all');
  const { analyticsData, isLoading, refreshAnalytics, tablesExist, createTables } = useAnalytics();
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [tableCreationError, setTableCreationError] = useState<string | null>(null);
  const [supabaseInfo, setSupabaseInfo] = useState({
    url: null as string | null,
    hasApiKey: false,
    connectionStatus: 'testing' as 'testing' | 'connected' | 'error'
  });
  
  // Get Supabase connection info and test the connection
  useEffect(() => {
    const connectionInfo = getSupabaseConnectionInfo();
    setSupabaseInfo(prev => ({ 
      ...prev, 
      ...connectionInfo, 
      connectionStatus: 'testing' 
    }));
    
    // Test the connection
    const testConnection = async () => {
      try {
        const connected = await testSupabaseConnection();
        setSupabaseInfo(prev => ({ 
          ...prev, 
          connectionStatus: connected ? 'connected' : 'error'
        }));
      } catch (err) {
        console.error('Error testing connection:', err);
        setSupabaseInfo(prev => ({ 
          ...prev, 
          connectionStatus: 'error'
        }));
      }
    };
    
    testConnection();
  }, []);
  
  // Handle creating tables
  const handleCreateTables = async () => {
    console.log('Creating analytics tables...');
    setIsCreatingTables(true);
    setTableCreationError(null);
    
    try {
      // First check if Supabase is connected
      if (supabaseInfo.connectionStatus === 'error') {
        setTableCreationError('Keine Verbindung zur Datenbank möglich. Bitte überprüfen Sie Ihre Supabase-Konfiguration.');
        setIsCreatingTables(false);
        return;
      }
      
      // Call the createTables function directly from useAnalytics
      const success = await createTables();
      
      console.log('Table creation result:', success);
      
      if (success) {
        // Refresh analytics to show real data
        refreshAnalytics();
      } else {
        setTableCreationError('Die Tabellenerstellung ist fehlgeschlagen. Bitte überprüfen Sie die Konsolenausgabe für Details.');
      }
    } catch (error: any) {
      console.error('Error creating tables:', error);
      setTableCreationError(error.message || 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsCreatingTables(false);
    }
  };
  
  // Select data based on timeframe
  const chartData = timeFrame === 'daily' ? analyticsData.dailyVisitors : 
                    timeFrame === 'weekly' ? analyticsData.weeklyVisitors : analyticsData.monthlyVisitors;
  
  // Get summary statistics
  const totalVisits = analyticsData.totalVisits;
  const totalSignups = analyticsData.totalSignups;
  const conversionRate = analyticsData.conversionRate.toFixed(1);
  
  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        refreshAnalytics={refreshAnalytics}
        isLoading={isLoading}
      />
      
      {/* Connection error alert */}
      {supabaseInfo.connectionStatus === 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Verbindung zur Supabase-Datenbank fehlgeschlagen. Analytics-Daten sind möglicherweise nicht verfügbar.
            Bitte überprüfen Sie Ihre Supabase-Konfiguration.
          </AlertDescription>
        </Alert>
      )}
      
      {tablesExist === false && supabaseInfo.connectionStatus === 'connected' && (
        <TableCreationAlert 
          isCreatingTables={isCreatingTables}
          tableCreationError={tableCreationError}
          handleCreateTables={handleCreateTables}
          supabaseInfo={supabaseInfo}
        />
      )}
      
      <StatisticCards 
        totalVisits={totalVisits}
        totalSignups={totalSignups}
        conversionRate={conversionRate}
      />
      
      <VisitorChart 
        chartData={chartData}
        metricType={metricType}
        setMetricType={setMetricType}
        isLoading={isLoading}
        tablesExist={tablesExist}
      />
      
      <AnalyticsInfoCard tablesExist={tablesExist} />
    </div>
  );
};

export default SiteAnalytics;
