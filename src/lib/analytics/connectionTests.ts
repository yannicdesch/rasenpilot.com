
import { supabase } from '@/lib/supabase';
import { testDatabaseConnection, runDatabaseDiagnostics } from './connectionUtils';

// A comprehensive test function to check Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  console.log('Starting comprehensive Supabase connection test...');
  
  // First try the basic connection test
  const isConnected = await testDatabaseConnection();
  console.log('Basic database connection test result:', isConnected);
  
  if (!isConnected) {
    console.error('Basic database connection test failed');
    return false;
  }

  // If basic connection works, run more detailed diagnostics
  try {
    const results = await runDatabaseDiagnostics();
    
    console.log('Comprehensive diagnostics results:', results);
    
    // Consider test successful if at least connection and one other test passes
    const isSuccessful = results.connection && 
      (results.sqlFunction || results.pageViewsTable || results.eventsTable);
    
    return isSuccessful;
  } catch (err) {
    console.error('Error during comprehensive connection test:', err);
    return isConnected; // Fall back to basic connection result
  }
};

// Test specifically for SQL function availability
export const testSqlFunctionAvailability = async (): Promise<boolean> => {
  try {
    console.log('Testing SQL function availability...');
    
    const { error } = await supabase.rpc('execute_sql', { 
      sql: 'SELECT 1 as test;' 
    });
    
    const success = !error;
    console.log('SQL function test result:', success ? 'Available' : 'Not available');
    
    if (error) {
      console.log('SQL function error:', error.message);
    }
    
    return success;
  } catch (err) {
    console.error('Exception testing SQL function:', err);
    return false;
  }
};

// Test if analytics tables exist
export const testAnalyticsTables = async (): Promise<{ 
  pageViewsExists: boolean; 
  eventsExists: boolean;
}> => {
  const result = {
    pageViewsExists: false,
    eventsExists: false
  };
  
  try {
    console.log('Testing if analytics tables exist...');
    
    // Try page_views table
    try {
      const { error: pageViewsError } = await supabase
        .from('page_views')
        .select('count(*)')
        .limit(1);
      
      result.pageViewsExists = !pageViewsError || pageViewsError.code === '42501'; // Table exists even if permission denied
      
      console.log('page_views table test:', result.pageViewsExists ? 'Exists' : 'Not found');
      if (pageViewsError && pageViewsError.code !== '42501') {
        console.log('page_views error:', pageViewsError.message);
      }
    } catch (err) {
      console.error('Exception testing page_views table:', err);
    }
    
    // Try events table
    try {
      const { error: eventsError } = await supabase
        .from('events')
        .select('count(*)')
        .limit(1);
      
      result.eventsExists = !eventsError || eventsError.code === '42501'; // Table exists even if permission denied
      
      console.log('events table test:', result.eventsExists ? 'Exists' : 'Not found');
      if (eventsError && eventsError.code !== '42501') {
        console.log('events error:', eventsError.message);
      }
    } catch (err) {
      console.error('Exception testing events table:', err);
    }
    
    return result;
  } catch (err) {
    console.error('Error in testAnalyticsTables:', err);
    return result;
  }
};

// Test if insert permissions are available
export const testInsertPermissions = async (): Promise<boolean> => {
  const testId = `test-${Date.now()}`;
  let inserted = false;
  
  try {
    console.log('Testing insert permissions...');
    
    // First ensure the tables exist
    const tablesExist = await testAnalyticsTables();
    
    if (!tablesExist.pageViewsExists) {
      console.log('Cannot test insert permissions - page_views table does not exist');
      return false;
    }
    
    // Try inserting a test record
    const { error } = await supabase
      .from('page_views')
      .insert({
        id: testId,
        path: '/test-permissions',
        timestamp: new Date().toISOString()
      });
    
    inserted = !error;
    
    console.log('Insert permission test:', inserted ? 'Success' : 'Failed');
    if (error) {
      console.log('Insert error:', error.message);
    }
    
    // If inserted, try to clean up
    if (inserted) {
      try {
        await supabase
          .from('page_views')
          .delete()
          .eq('id', testId);
        console.log('Test record cleanup successful');
      } catch (cleanupErr) {
        console.log('Could not clean up test record:', cleanupErr);
      }
    }
    
    return inserted;
  } catch (err) {
    console.error('Error testing insert permissions:', err);
    
    // Try to clean up in case of error
    if (inserted) {
      try {
        await supabase
          .from('page_views')
          .delete()
          .eq('id', testId);
      } catch (cleanupErr) {
        // Silent failure on cleanup
      }
    }
    
    return false;
  }
};

// Run all tests at once
export const runAllConnectionTests = async (): Promise<Record<string, boolean>> => {
  console.log('Running all connection tests...');
  
  const results: Record<string, boolean | object> = {
    basicConnection: false,
    sqlFunction: false,
    analyticsTablesExist: false,
    insertPermissions: false
  };
  
  // Test basic connection first
  results.basicConnection = await testDatabaseConnection();
  
  // Only run other tests if basic connection succeeds
  if (results.basicConnection) {
    results.sqlFunction = await testSqlFunctionAvailability();
    
    const tablesTest = await testAnalyticsTables();
    results.analyticsTablesExist = tablesTest.pageViewsExists && tablesTest.eventsExists;
    
    // Only test permissions if tables exist
    if (tablesTest.pageViewsExists) {
      results.insertPermissions = await testInsertPermissions();
    }
  }
  
  console.log('All connection tests completed:', results);
  return results as Record<string, boolean>;
};
