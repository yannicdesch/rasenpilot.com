import { supabase } from '@/lib/supabase';
import { createExecuteSqlFunction } from './sqlFunctions';

// Test if we can connect to Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  console.log('Testing Supabase connection...');
  try {
    // We need to handle this differently since .catch() doesn't exist on PostgrestFilterBuilder
    try {
      const { data, error } = await supabase.from('_test_connection_').select('*').limit(1);
      
      // If we get an error about table not existing, that means the connection worked
      // If we get a connection error, then we know the connection failed
      const errorMessage = error?.message?.toLowerCase() || '';
      const isConnectionError = errorMessage.includes('network') || 
                               errorMessage.includes('connection') ||
                               errorMessage.includes('fetch') || 
                               errorMessage.includes('timeout');
      
      // If it's specifically a connection error, return false
      if (isConnectionError) {
        console.error('Connection to Supabase failed:', error);
        return false;
      }
      
      // Otherwise, even if there's an error about the table not existing,
      // the connection itself worked, so return true
      console.log('Supabase connection successful');
      return true;
    } catch (e) {
      // This happens if the connection fails entirely
      console.error('Connection to Supabase failed completely:', e);
      return false;
    }
    
  } catch (e) {
    console.error('Error testing Supabase connection:', e);
    return false;
  }
};

// Test direct table access to see if we can perform operations
export const testDirectTableAccess = async (): Promise<boolean> => {
  console.log('Testing direct table access...');
  try {
    // Attempt to create a temporary test table
    const tempTableName = `_temp_test_${Math.floor(Math.random() * 1000000)}`;
    
    // Try to create the table
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ${tempTableName} (
          id SERIAL PRIMARY KEY,
          test_value TEXT
        );
      `
    });
    
    if (createError) {
      console.error('Error creating test table:', createError);
      return false;
    }
    
    // Try to insert data
    const { error: insertError } = await supabase.rpc('execute_sql', {
      sql: `
        INSERT INTO ${tempTableName} (test_value) VALUES ('test');
      `
    });
    
    if (insertError) {
      console.error('Error inserting into test table:', insertError);
      return false;
    }
    
    // Try to select data
    const { error: selectError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT * FROM ${tempTableName} LIMIT 1;
      `
    });
    
    if (selectError) {
      console.error('Error selecting from test table:', selectError);
      return false;
    }
    
    // Clean up - drop the table
    const { error: dropError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS ${tempTableName};
      `
    });
    
    if (dropError) {
      console.error('Error dropping test table:', dropError);
      // Continue anyway, as the main tests passed
    }
    
    console.log('Direct table access successful');
    return true;
  } catch (e) {
    console.error('Error testing direct table access:', e);
    return false;
  }
};

// More comprehensive test of all connection aspects
export const runAllConnectionTests = async (): Promise<{[key: string]: boolean}> => {
  console.log('Starting comprehensive Supabase connection test...');
  
  const results: {[key: string]: boolean} = {
    basicConnection: false,
    sqlFunction: false,
    analyticsTablesExist: false,
    insertPermissions: false
  };
  
  // Test 1: Basic connection
  console.log('Testing general database connectivity...');
  results.basicConnection = await testSupabaseConnection();
  
  if (!results.basicConnection) {
    console.error('Basic connection failed, stopping further tests');
    return results;
  }
  
  // Test 2: SQL function exists and works
  console.log('Testing SQL function existence and functionality...');
  try {
    // First check if it exists
    try {
      const { error } = await supabase.rpc('execute_sql', {
        sql: 'SELECT 1 as test;'
      });
      
      if (!error) {
        results.sqlFunction = true;
      } else {
        // Try to create it
        const created = await createExecuteSqlFunction();
        results.sqlFunction = created;
      }
    } catch (e) {
      console.error('Error testing SQL function:', e);
      results.sqlFunction = false;
    }
  } catch (e) {
    console.error('Error during SQL function test:', e);
    results.sqlFunction = false;
  }
  
  // Test 3: Analytics tables exist
  console.log('Testing if analytics tables exist...');
  try {
    // Check page_views - use try-catch instead of catch on the query
    try {
      const { error: pvError } = await supabase
        .from('page_views')
        .select('count(*)')
        .limit(1);
        
      const pvTableExists = !pvError;
      
      // Check events
      const { error: evError } = await supabase
        .from('events')
        .select('count(*)')
        .limit(1);
        
      const evTableExists = !evError;
      
      results.analyticsTablesExist = pvTableExists && evTableExists;
    } catch (e) {
      console.error('Error querying analytics tables:', e);
      results.analyticsTablesExist = false;
    }
  } catch (e) {
    console.error('Error checking analytics tables:', e);
    results.analyticsTablesExist = false;
  }
  
  // Test 4: Insert permissions
  console.log('Testing insert permissions...');
  if (results.analyticsTablesExist) {
    try {
      // Try to insert a test page view
      const { error: insertError } = await supabase
        .from('page_views')
        .insert({
          path: '/test-connection',
          timestamp: new Date().toISOString(),
          referrer: 'connection-test',
          user_agent: 'connection-test'
        })
        .select();
        
      results.insertPermissions = !insertError;
      
      if (insertError) {
        console.error('Insert permission test failed:', insertError);
      }
    } catch (e) {
      console.error('Error testing insert permissions:', e);
      results.insertPermissions = false;
    }
  } else {
    results.insertPermissions = false;
  }
  
  console.log('Connection test results:', results);
  return results;
};
