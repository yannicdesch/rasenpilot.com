
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Test general database connectivity (not just specific tables)
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing general database connectivity...');
    
    // Method 1: Try to get project configuration (this doesn't require any special permissions)
    try {
      const { data, error } = await supabase.rpc('get_project_settings', {});
      
      if (!error) {
        console.log('Database connection test successful with RPC');
        return true;
      }
      
      console.log('RPC connection test failed, trying fallback method...');
    } catch (err) {
      console.log('RPC test failed with exception, trying fallback...');
    }
    
    // Method 2: Try with execute_sql RPC if it exists
    try {
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql: 'SELECT 1 as connection_test;' 
      });
      
      if (!error) {
        console.log('Database connection test successful with execute_sql');
        return true;
      }
      
      console.log('execute_sql test failed, trying next fallback...');
    } catch (err) {
      console.log('execute_sql test failed with exception, trying next fallback...');
    }
    
    // Method 3: Try to access public.users directly
    try {
      const { error } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1);
        
      // Even if we get a permission error, the connection works
      if (error && (error.code === '42501' || error.message.includes('permission'))) {
        console.log('Database connected but permission denied - connection is working');
        return true;
      }
    } catch (err) {
      console.log('users table test failed, trying final fallback...');
    }
    
    // Method 4: Final fallback - just try any basic operation
    try {
      const { error } = await supabase.auth.getSession();
      
      // If we can reach the auth API, the connection is working
      if (!error) {
        console.log('Database connection test successful via auth API');
        return true;
      }
      
      console.log('Auth API test failed');
      return false;
    } catch (err) {
      console.error('All connection tests failed');
      return false;
    }
  } catch (err) {
    console.error('Error in database connection test:', err);
    return false;
  }
};

// Run comprehensive database diagnostics
export const runDatabaseDiagnostics = async (): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {
    connection: false,
    sqlFunction: false,
    pageViewsTable: false,
    eventsTable: false,
    permissions: false
  };
  
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
  if (results.pageViewsTable && results.eventsTable) {
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
