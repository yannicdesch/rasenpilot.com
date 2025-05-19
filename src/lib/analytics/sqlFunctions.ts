
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Create the execute_sql function in Supabase if it doesn't exist
export const createExecuteSqlFunction = async (): Promise<boolean> => {
  try {
    console.log('Attempting to create execute_sql function...');
    
    // Try direct SQL execution first - this requires admin privileges
    try {
      console.log('Attempting direct SQL execution to create function...');
      
      // This is a raw SQL query that attempts to create the function
      // It will only work if the user has admin privileges
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
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
      });
      
      // If no error, the function was created
      if (!error) {
        console.log('execute_sql function created successfully');
        toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
        return true;
      } else {
        console.log('Error creating function with direct SQL:', error);
      }
    } catch (directErr) {
      console.log('Direct SQL execution failed:', directErr);
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
        return false;
      }
      
      console.log('execute_sql function created successfully via edge function');
      toast.success('SQL-Ausführungsfunktion erfolgreich erstellt');
      return true;
    } catch (edgeFnError: any) {
      console.error('Could not invoke edge function:', edgeFnError);
      
      // After both approaches fail, check if the function already exists
      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql: 'SELECT 1 as test;'
        });
        
        if (data && !error) {
          console.log('execute_sql function already exists and works');
          return true;
        } else {
          console.error('execute_sql function test failed:', error);
          toast.error('SQL-Ausführungsfunktion existiert nicht oder funktioniert nicht', { 
            description: 'Bitte stellen Sie sicher, dass Sie administrative Berechtigungen haben oder wenden Sie sich an Ihren Datenbankadministrator.'
          });
          return false;
        }
      } catch (testErr) {
        console.error('Error testing execute_sql function:', testErr);
        toast.error('SQL-Ausführungsfunktion konnte nicht erstellt werden', { 
          description: 'Bitte erstellen Sie die Funktion manuell in der Supabase SQL-Konsole.'
        });
        return false;
      }
    }
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
    // First, try to use the execute_sql function
    try {
      const { error } = await supabase.rpc('execute_sql', { sql });
      
      if (!error) {
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
