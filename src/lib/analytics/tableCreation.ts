
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Create analytics tables if they don't exist - simplified version
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // Test overall database connection first
    const { testDatabaseConnection } = await import('./connectionUtils');
    
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Database connection failed, cannot create tables');
      toast.error('Datenbankverbindung fehlgeschlagen', {
        description: 'Bitte überprüfen Sie Ihre Supabase-Konfiguration.'
      });
      return false;
    }
    
    // Check if tables already exist
    const { error: pageViewsError } = await supabase
      .from('page_views')
      .select('*', { count: 'exact' })
      .limit(1);
    
    const { error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (!pageViewsError && !eventsError) {
      console.log('Analytics tables already exist');
      toast.success('Analytiktabellen existieren bereits');
      return true;
    }
    
    // Tables don't exist or can't be accessed
    console.log('Analytics tables need to be created via Supabase dashboard or migrations');
    toast.error('Analytiktabellen müssen über das Supabase Dashboard erstellt werden', {
      description: 'Bitte verwenden Sie das SQL-Editor im Supabase Dashboard.'
    });
    
    return false;
  } catch (error: any) {
    console.error('Error creating analytics tables:', error);
    toast.error('Fehler beim Erstellen der Analytiktabellen', {
      description: error.message
    });
    return false;
  }
};

// Check if analytics tables exist
export const checkAnalyticsTablesExist = async (): Promise<Record<string, boolean>> => {
  const tables = ['page_views', 'events'];
  const results: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact' })
        .limit(1);
      
      results[table] = !error;
    } catch (err) {
      console.error(`Error checking ${table}:`, err);
      results[table] = false;
    }
  }
  
  return results;
};

// Get status of analytics setup
export const getAnalyticsSetupStatus = async () => {
  try {
    const tableStatus = await checkAnalyticsTablesExist();
    
    return {
      tablesExist: tableStatus,
      allTablesReady: Object.values(tableStatus).every(exists => exists),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking analytics setup:', error);
    return {
      tablesExist: {},
      allTablesReady: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};
