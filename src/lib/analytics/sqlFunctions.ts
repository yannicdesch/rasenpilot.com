
import { supabase } from '@/lib/supabase';

// Create the execute_sql function in Supabase if it doesn't exist
export const createExecuteSqlFunction = async (): Promise<boolean> => {
  try {
    console.log('Attempting to create execute_sql function...');
    
    // Check if we can call the edge function directly
    try {
      const { error } = await supabase.functions.invoke('execute-sql-creation', {
        body: {
          definition: `
            BEGIN;
            -- Create the execute_sql function if it doesn't exist
            CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
            RETURNS SETOF json
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql;
              RETURN;
            END;
            $$;
            
            -- Grant execute permission to authenticated and anon roles
            GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
            GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;
            COMMIT;
          `
        }
      });
      
      if (error) {
        console.error('Error creating execute_sql function via edge function:', error);
        return false;
      }
      
      console.log('execute_sql function created successfully via edge function');
      return true;
    } catch (edgeFnError) {
      console.error('Could not invoke edge function:', edgeFnError);
      
      // Try with a direct SQL query to see if we already have access
      try {
        const { data } = await supabase.rpc('execute_sql', {
          sql: 'SELECT 1;'
        });
        
        if (data) {
          console.log('execute_sql function already exists and works');
          return true;
        }
      } catch (directErr) {
        console.error('Direct SQL execution also failed:', directErr);
      }
      
      return false;
    }
  } catch (err) {
    console.error('Error creating execute_sql function:', err);
    return false;
  }
};
