
import { supabase } from '@/lib/supabase';

// First check if we can execute SQL directly as a fallback
export const testDirectTableAccess = async (): Promise<boolean> => {
  try {
    console.log('Testing direct table access...');
    
    // Try a simple query to test if we can access the database
    const { data, error } = await supabase
      .from('page_views')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.log('Direct table access test failed with error code:', error.code);
      console.log('Error message:', error.message);
      
      // If table doesn't exist, that's expected
      if (error.code === '42P01') {
        console.log('Table not found - this is expected if not created yet');
        return false;
      }
      
      // For permission errors, this could indicate a misconfigured RLS policy
      if (error.code === '42501' || error.message.includes('permission')) {
        console.log('Permission error - check your RLS policies');
      }
      
      return false;
    }
    
    console.log('Direct table access successful');
    return true;
  } catch (err) {
    console.error('Exception testing direct table access:', err);
    return false;
  }
};

// Check if analytics tables exist with more detailed logging
export const checkAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Checking if analytics tables exist...');
    
    // First try direct table access
    const directAccessWorks = await testDirectTableAccess();
    
    // Import testDatabaseConnection dynamically to avoid circular dependencies
    const { testDatabaseConnection } = await import('./connectionUtils');
    
    // Check general database connectivity
    const dbConnected = await testDatabaseConnection();
    console.log('Database connection test result:', dbConnected ? 'Connected' : 'Not connected');
    
    // Log connection status
    console.log('Supabase connection details:');
    console.log('- Supabase client initialized:', typeof supabase !== 'undefined');
    console.log('- Connection available:', dbConnected);
    
    if (directAccessWorks) {
      console.log('Tables exist and are accessible directly!');
      return true;
    } else {
      if (dbConnected) {
        console.log('Database is connected, but tables may not exist or are not accessible directly');
      } else {
        console.log('Database connection issues detected');
      }
      return false;
    }
  } catch (err) {
    console.error('Error in checkAnalyticsTables:', err);
    return false;
  }
};
