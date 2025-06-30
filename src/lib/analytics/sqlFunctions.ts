
// Simplified SQL functions that don't rely on non-existent database functions
import { supabase } from '@/lib/supabase';

export const createBasicAnalyticsTables = async (): Promise<boolean> => {
  try {
    // We can't create tables directly from the client side in Supabase
    // This would need to be done via migrations or the dashboard
    console.log('Table creation should be done via Supabase migrations or dashboard');
    return false;
  } catch (error) {
    console.error('Error in table creation:', error);
    return false;
  }
};

export const checkAnalyticsTablesExist = async (): Promise<Record<string, boolean>> => {
  const tables = ['page_views', 'events'];
  const results: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select('count(*)', { count: 'exact' })
        .limit(1);
      
      results[table] = !error;
    } catch (err) {
      console.error(`Error checking ${table}:`, err);
      results[table] = false;
    }
  }
  
  return results;
};

export const getAnalyticsTableStatus = async () => {
  const tableStatus = await checkAnalyticsTablesExist();
  
  return {
    allTablesExist: Object.values(tableStatus).every(exists => exists),
    tableStatus,
    timestamp: new Date().toISOString()
  };
};
