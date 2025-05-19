
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Test general database connectivity (not just specific tables)
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing general database connectivity...');
    
    // Method 1: Try with auth API first (most reliable)
    try {
      console.log('Testing connection via auth API...');
      const { error } = await supabase.auth.getSession();
      
      // If we can reach the auth API, the connection is working
      if (!error) {
        console.log('Database connection test successful via auth API');
        return true;
      } else {
        console.log('Auth API test returned error:', error.message);
      }
    } catch (authErr: any) {
      console.error('Auth API test exception:', authErr);
    }
    
    // Method 2: Try to use any RPC that should be available
    try {
      console.log('Testing connection via version RPC...');
      const { error } = await supabase.rpc('version', {});
      
      if (!error) {
        console.log('Database connection test successful via RPC');
        return true;
      } else if (error.message.includes('not found')) {
        // This is normal if the function doesn't exist
        console.log('Version RPC not found, this is expected');
      } else {
        console.log('Version RPC test error:', error.message);
      }
    } catch (rpcErr: any) {
      console.error('RPC test exception:', rpcErr);
    }
    
    // Method 3: Try to get project configuration
    try {
      console.log('Testing connection via custom RPC...');
      const { error } = await supabase.rpc('get_project_settings', {});
      
      if (!error) {
        console.log('Database connection test successful with RPC');
        return true;
      } else if (error.message.includes('not found')) {
        // This is normal if the function doesn't exist
        console.log('get_project_settings function not found, this is expected');
      } else {
        console.log('RPC test error:', error.message);
      }
    } catch (rpcErr: any) {
      console.error('Custom RPC test exception:', rpcErr);
    }
    
    // Method 4: Try with execute_sql RPC if it exists
    try {
      console.log('Testing connection via execute_sql RPC...');
      const { error } = await supabase.rpc('execute_sql', { 
        sql: 'SELECT 1 as connection_test;' 
      });
      
      if (!error) {
        console.log('Database connection test successful with execute_sql');
        return true;
      } else if (error.message.includes('not found')) {
        // This is normal if the function doesn't exist
        console.log('execute_sql function not found, this is expected');
      } else {
        console.log('execute_sql test error:', error.message);
      }
    } catch (sqlErr: any) {
      console.error('execute_sql test exception:', sqlErr);
    }
    
    // Method 5: Try to access any table directly
    try {
      console.log('Testing direct table access...');
      const tables = ['page_views', 'events', 'profiles', 'users', 'site_settings'];
      
      for (const table of tables) {
        console.log(`Attempting to query ${table}...`);
        const { error } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1);
          
        if (!error) {
          console.log(`Successfully connected via ${table} table`);
          return true;
        } else if (error.code === '42P01') {
          // Table doesn't exist, try next one
          console.log(`Table ${table} doesn't exist, trying next`);
          continue;
        } else if (error.code === '42501' || error.message.includes('permission')) {
          // Permission error means we connected but don't have permission
          console.log(`Permission error on ${table}, but connection works`);
          return true;
        } else {
          console.log(`Error querying ${table}:`, error);
        }
      }
    } catch (tableErr: any) {
      console.error('Table access test exception:', tableErr);
    }
    
    console.error('All connection tests failed');
    return false;
  } catch (err: any) {
    console.error('Error in database connection test:', err);
    return false;
  }
};

// Run comprehensive database diagnostics
export const runDatabaseDiagnostics = async (): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {
    connection: false,
    authApi: false,
    sqlFunction: false,
    pageViewsTable: false,
    eventsTable: false,
    permissions: false
  };
  
  // Test auth API access
  try {
    const { error } = await supabase.auth.getSession();
    results.authApi = !error;
  } catch (err) {
    results.authApi = false;
  }
  
  // Test basic connection
  results.connection = await testDatabaseConnection();
  
  // Test SQL function
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql: 'SELECT 1 as test;' 
    });
    results.sqlFunction = !error;
  } catch (err) {
    results.sqlFunction = false;
  }
  
  // Check if tables exist
  try {
    const { error: pageViewsError } = await supabase
      .from('page_views')
      .select('count(*)')
      .limit(1);
    
    results.pageViewsTable = !pageViewsError || pageViewsError.code === '42501'; // Table exists but maybe permission denied
    
    const { error: eventsError } = await supabase
      .from('events')
      .select('count(*)')
      .limit(1);
    
    results.eventsTable = !eventsError || eventsError.code === '42501'; // Table exists but maybe permission denied
  } catch (err) {
    results.pageViewsTable = false;
    results.eventsTable = false;
  }
  
  // Check if we can insert data (permissions)
  if (results.pageViewsTable) {
    try {
      const testId = `test-${Date.now()}`;
      const { error } = await supabase
        .from('page_views')
        .insert({
          id: testId,
          path: '/test-diagnostic',
          timestamp: new Date().toISOString()
        })
        .select();
      
      // If no error, or error is not permission related, then permissions are OK
      results.permissions = !error || error.code !== '42501';
      
      // Try to clean up test data
      if (!error) {
        await supabase
          .from('page_views')
          .delete()
          .eq('id', testId);
      }
    } catch (err) {
      results.permissions = false;
    }
  }
  
  console.log('Database diagnostics results:', results);
  return results;
};
