
import { supabase } from '@/lib/supabase';

// Test if we can connect to Supabase at all
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    // Simple query to see if we can connect to Supabase
    const { error } = await supabase.from('_unused_name').select('*').limit(1);
    
    // If we get a specific error code, it means we connected but the table doesn't exist
    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      console.log('Supabase connection successful (table not found but that\'s ok)');
      return true;
    } else if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection exception:', err);
    return false;
  }
};

// Test if the execute_sql function exists
export const testExecuteSqlFunction = async (): Promise<boolean> => {
  try {
    console.log('Testing execute_sql function...');
    const { error } = await supabase.rpc('execute_sql', {
      sql: 'SELECT 1 as test;'
    });
    
    if (error) {
      console.error('execute_sql function error:', error.message);
      return false;
    }
    
    console.log('execute_sql function exists and works');
    return true;
  } catch (err) {
    console.error('execute_sql function exception:', err);
    return false;
  }
};

// Test if analytics tables exist
export const testAnalyticsTablesExist = async (): Promise<boolean> => {
  try {
    console.log('Testing if analytics tables exist...');
    
    // Check page_views table
    const { error: pvError } = await supabase
      .from('page_views')
      .select('count(*)')
      .limit(1);
      
    if (pvError) {
      console.error('page_views table error:', pvError.message);
      return false;
    }
    
    // Check events table
    const { error: evError } = await supabase
      .from('events')
      .select('count(*)')
      .limit(1);
      
    if (evError) {
      console.error('events table error:', evError.message);
      return false;
    }
    
    console.log('Analytics tables exist');
    return true;
  } catch (err) {
    console.error('Analytics tables check exception:', err);
    return false;
  }
};

// Run all connection tests at once for more efficient checking
export const runAllConnectionTests = async (): Promise<{
  basicConnection: boolean;
  sqlFunction: boolean;
  tablesExist: boolean | null;
}> => {
  try {
    // Test basic connection first
    const basicConnection = await testSupabaseConnection();
    
    // If basic connection fails, don't try other tests
    if (!basicConnection) {
      return {
        basicConnection: false,
        sqlFunction: false,
        tablesExist: null
      };
    }
    
    // Test SQL function
    const sqlFunction = await testExecuteSqlFunction();
    
    // Test tables existence only if SQL function works
    const tablesExist = sqlFunction ? await testAnalyticsTablesExist() : null;
    
    return {
      basicConnection,
      sqlFunction,
      tablesExist
    };
  } catch (err) {
    console.error('Error running all connection tests:', err);
    return {
      basicConnection: false,
      sqlFunction: false,
      tablesExist: null
    };
  }
};
