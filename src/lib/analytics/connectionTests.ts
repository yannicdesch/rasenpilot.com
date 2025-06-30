
import { supabase } from '@/lib/supabase';

// Simple database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query to test connection
    const { error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
};

// Test specific table access
export const testTableAccess = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName as any)
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error(`Table access test failed for ${tableName}:`, err);
    return false;
  }
};

// Get basic database info
export const getDatabaseInfo = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return {
      connected: true,
      userCount: data?.length || 0,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Failed to get database info:', err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Run all connection tests
export const runAllConnectionTests = async () => {
  try {
    const basicConnection = await testDatabaseConnection();
    
    const tablesExist = await testTableAccess('page_views') && await testTableAccess('events');
    
    return {
      basicConnection,
      sqlFunction: false, // Not available in current setup
      tablesExist,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error running all connection tests:', err);
    return {
      basicConnection: false,
      sqlFunction: false,
      tablesExist: false,
      timestamp: new Date().toISOString()
    };
  }
};
