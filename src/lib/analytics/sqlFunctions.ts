
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
      
      // First try using fetch directly instead of accessing protected properties
      const url = process.env.SUPABASE_URL || 'https://ugaxwcslhoppflrbuwxv.supabase.co';
      const key = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ';
      
      try {
        const { data, error } = await fetch(
          `${url}/rest/v1/rpc/execute_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({ sql: createFunctionSQL })
          }
        ).then(res => res.json());
        
        // If no error, the function was created
        if (!error) {
          console.log('execute_sql function created successfully via REST API');
          toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
          return true;
        }
      } catch (directErr) {
        console.error('Direct REST API call failed:', directErr);
      }
      
      // Try using Supabase's built-in client for RPC
      const { error: rpcError } = await supabase.rpc('execute_sql', { 
        sql: createFunctionSQL 
      });
      
      // If no error, the function was created
      if (!rpcError) {
        console.log('execute_sql function created successfully via RPC');
        toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
        return true;
      } else {
        console.error('Error creating function with RPC:', rpcError);
      }
    } catch (directErr) {
      console.error('Direct SQL execution failed:', directErr);
    }
    
    // Fallback to edge function if direct execution fails
    try {
      console.log('Trying to create function via edge function...');
      
      const { error } = await supabase.functions.invoke('execute-sql-creation', {
        body: { 
          action: 'create_function',
          definition: `
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
          `
        }
      });
      
      if (error) {
        console.error('Error creating execute_sql function via edge function:', error);
        toast.error('SQL-Ausführungsfunktion konnte nicht erstellt werden', { 
          description: 'Edge Function fehlgeschlagen: ' + error.message
        });
      } else {
        console.log('execute_sql function created successfully via edge function');
        toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
        return true;
      }
    } catch (edgeFnError: any) {
      console.error('Could not invoke edge function:', edgeFnError);
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
    
    // If that fails, try the edge function
    try {
      const { error } = await supabase.functions.invoke('execute-sql', {
        body: { sql }
      });
      
      if (error) {
        console.error('Error executing SQL with edge function:', error);
        return false;
      }
      
      console.log('SQL executed successfully with edge function');
      return true;
    } catch (err) {
      console.error('Failed to execute SQL with edge function:', err);
      return false;
    }
  } catch (err) {
    console.error('Error in executeSqlQuery:', err);
    return false;
  }
};
