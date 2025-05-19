
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { createExecuteSqlFunction } from './sqlFunctions';

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

// Check if analytics tables exist with more detailed logging
export const checkAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Checking if analytics tables exist...');
    
    // First try direct table access
    const directAccessWorks = await testDirectTableAccess();
    
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

// Create analytics tables if they don't exist - improved version with better error handling
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // Test overall database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Database connection failed, cannot create tables');
      toast.error('Datenbankverbindung fehlgeschlagen', {
        description: 'Bitte überprüfen Sie Ihre Supabase-Konfiguration.'
      });
      return false;
    }
    
    // First ensure the execute_sql function exists
    const sqlFunctionCreated = await createExecuteSqlFunction();
    console.log('SQL function created or exists:', sqlFunctionCreated);
    
    if (!sqlFunctionCreated) {
      console.error('Failed to create SQL execution function');
      toast.error('SQL-Ausführungsfunktion konnte nicht erstellt werden', {
        description: 'Bitte stellen Sie sicher, dass Sie Admin-Berechtigungen haben.'
      });
      return false;
    }
    
    // Try using rpc to call the execute_sql function
    try {
      console.log('Attempting to create tables with execute_sql RPC...');
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          -- Create page_views table
          CREATE TABLE IF NOT EXISTS public.page_views (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            path TEXT NOT NULL,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            referrer TEXT,
            user_agent TEXT
          );

          -- Create events table
          CREATE TABLE IF NOT EXISTS public.events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            category TEXT NOT NULL,
            action TEXT NOT NULL, 
            label TEXT,
            value INTEGER,
            timestamp TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Set permissions (CRITICAL)
          ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
          
          -- Allow public insert access
          CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
            ON public.page_views FOR INSERT TO anon, authenticated
            WITH CHECK (true);
            
          CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
            ON public.events FOR INSERT TO anon, authenticated
            WITH CHECK (true);
            
          -- Allow select access
          CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
            ON public.page_views FOR SELECT TO anon, authenticated
            USING (true);
            
          CREATE POLICY IF NOT EXISTS "Allow select access to events" 
            ON public.events FOR SELECT TO anon, authenticated
            USING (true);
        `
      });
      
      if (error) {
        console.error('Error creating analytics tables with execute_sql:', error);
        console.log('Trying edge function as fallback...');
        
        // Try using the edge function as fallback
        try {
          const { error: directError } = await supabase.functions.invoke('execute-sql', {
            body: {
              sql: `
                -- Create page_views table
                CREATE TABLE IF NOT EXISTS public.page_views (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  path TEXT NOT NULL,
                  timestamp TIMESTAMPTZ DEFAULT NOW(),
                  referrer TEXT,
                  user_agent TEXT
                );

                -- Create events table
                CREATE TABLE IF NOT EXISTS public.events (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  category TEXT NOT NULL,
                  action TEXT NOT NULL, 
                  label TEXT,
                  value INTEGER,
                  timestamp TIMESTAMPTZ DEFAULT NOW()
                );
                
                -- Set permissions
                ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
                ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
                
                -- Allow public insert access
                CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
                  ON public.page_views FOR INSERT TO anon, authenticated
                  WITH CHECK (true);
                  
                CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
                  ON public.events FOR INSERT TO anon, authenticated
                  WITH CHECK (true);
                  
                -- Allow select access
                CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
                  ON public.page_views FOR SELECT TO anon, authenticated
                  USING (true);
                  
                CREATE POLICY IF NOT EXISTS "Allow select access to events" 
                  ON public.events FOR SELECT TO anon, authenticated
                  USING (true);
              `
            }
          });
          
          if (directError) {
            console.error('Error with execute-sql edge function too:', directError);
            toast.error('Fehler beim Erstellen der Analytiktabellen', {
              description: `${directError.message || 'Unbekannter Fehler'}`
            });
            return false;
          }
          
          console.log('Tables created successfully via edge function');
          toast.success('Analytiktabellen wurden erfolgreich erstellt');
          return true;
        } catch (fallbackErr) {
          console.error('Fallback execution failed:', fallbackErr);
          toast.error('Fehler beim Erstellen der Analytiktabellen', {
            description: 'Die Edge-Funktion konnte nicht aufgerufen werden.'
          });
          return false;
        }
      } else {
        console.log('Tables created successfully via rpc');
        toast.success('Analytiktabellen wurden erfolgreich erstellt');
        return true;
      }
    } catch (err) {
      console.error('Error in initial table creation attempt:', err);
      toast.error('Fehler beim Erstellen der Analytiktabellen');
      return false;
    }
  } catch (err: any) {
    console.error('Error creating analytics tables:', err);
    toast.error('Fehler beim Erstellen der Analytiktabellen', {
      description: err.message || 'Ein unerwarteter Fehler ist aufgetreten.'
    });
    return false;
  }
};

// Additional helper function for full diagnostics
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
}
