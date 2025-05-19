
import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnalyticsHeader from './analytics/AnalyticsHeader';
import TableCreationAlert from './analytics/TableCreationAlert';
import StatisticCards from './analytics/StatisticCards';
import VisitorChart from './analytics/VisitorChart';
import AnalyticsInfoCard from './analytics/AnalyticsInfoCard';

const SiteAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [metricType, setMetricType] = useState('all');
  const { analyticsData, isLoading, refreshAnalytics, tablesExist, createTables } = useAnalytics();
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [tableCreationError, setTableCreationError] = useState<string | null>(null);
  
  // Handle creating tables
  const handleCreateTables = async () => {
    console.log('Creating analytics tables...');
    setIsCreatingTables(true);
    setTableCreationError(null);
    
    try {
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
      
      {tablesExist === false && (
        <TableCreationAlert 
          isCreatingTables={isCreatingTables}
          tableCreationError={tableCreationError}
          handleCreateTables={handleCreateTables}
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
