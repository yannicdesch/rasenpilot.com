
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Create the execute_sql function in Supabase if it doesn't exist
export const createExecuteSqlFunction = async (): Promise<boolean> => {
  try {
    console.log('Attempting to create execute_sql function...');
    
    // First check if the function already exists
    try {
      console.log('Checking if execute_sql function already exists...');
      const { data, error } = await supabase.rpc('execute_sql', {
        sql: 'SELECT 1 as test;'
      });
      
      if (data && !error) {
        console.log('execute_sql function already exists and works');
        return true;
      }
    } catch (testErr) {
      console.log('execute_sql function test failed, proceeding with creation');
    }
    
    // Try direct SQL execution first - this requires admin privileges
    try {
      console.log('Attempting direct SQL execution to create function...');
      
      // This is a raw SQL query that attempts to create the function
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
        RETURNS SETOF json
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN;
        END;
        $$;
        
        -- Grant execute permission to authenticated and anon roles
        GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;
      `;
      
      // First try using RPC directly
      try {
        const { error } = await supabase.rpc('execute_sql', { 
          sql: createFunctionSQL 
        });
        
        if (!error) {
          console.log('execute_sql function created successfully via RPC');
          toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
          return true;
        } else {
          console.error('Error creating function with RPC:', error);
        }
      } catch (rpcErr) {
        console.error('RPC execution failed:', rpcErr);
      }
      
      // If direct RPC fails, try using a direct SQL API call
      // Get the URL and key from the environment
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugaxwcslhoppflrbuwxv.supabase.co';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ';
      
      try {
        console.log('Trying direct SQL API call...');
        const response = await fetch(
          `${url}/rest/v1/rpc/execute_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Access-Control-Allow-Origin': '*',  // Add CORS headers
              'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
            body: JSON.stringify({ sql: createFunctionSQL })
          }
        );
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('execute_sql function created successfully via REST API');
          toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
          return true;
        } else {
          console.error('Direct REST API call failed:', result);
        }
      } catch (directErr) {
        console.error('Direct REST API call failed:', directErr);
      }
    } catch (directErr) {
      console.error('Direct SQL execution failed:', directErr);
    }
    
    // After all attempts, check if the function now exists
    try {
      console.log('Final check if execute_sql function exists...');
      const { data, error } = await supabase.rpc('execute_sql', {
        sql: 'SELECT 1 as test;'
      });
      
      if (data && !error) {
        console.log('execute_sql function now exists and works');
        return true;
      } else {
        console.error('execute_sql function still doesn\'t work:', error);
        return false;
      }
    } catch (finalCheckErr) {
      console.error('Final check failed:', finalCheckErr);
      return false;
    }
    
    return false;
  } catch (err: any) {
    console.error('Error in createExecuteSqlFunction:', err);
    toast.error('Fehler beim Erstellen der SQL-Ausführungsfunktion', {
      description: err.message || 'Ein unerwarteter Fehler ist aufgetreten.'
    });
    return false;
  }
};

// Execute a SQL query with better error handling
export const executeSqlQuery = async (sql: string): Promise<boolean> => {
  try {
    console.log('Attempting to execute SQL query:', sql.substring(0, 100) + '...');
    
    // First, try to use the execute_sql function
    try {
      const { error } = await supabase.rpc('execute_sql', { sql });
      
      if (!error) {
        console.log('SQL executed successfully with execute_sql function');
        return true;
      }
      
      console.error('Error executing SQL with execute_sql function:', error);
    } catch (err) {
      console.error('Failed to execute SQL with execute_sql function:', err);
    }
    
    // If RPC fails, try direct API call
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugaxwcslhoppflrbuwxv.supabase.co';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ';
      
      const response = await fetch(
        `${url}/rest/v1/rpc/execute_sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({ sql })
        }
      );
      
      if (response.ok) {
        console.log('SQL executed successfully with direct API call');
        return true;
      } else {
        console.error('Error executing SQL with direct API call:', await response.text());
      }
    } catch (err) {
      console.error('Failed to execute SQL with direct API call:', err);
    }
    
    return false;
  } catch (err) {
    console.error('Error in executeSqlQuery:', err);
    return false;
  }
};
