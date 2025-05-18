
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { createExecuteSqlFunction } from './sqlFunctions';

// First check if we can execute SQL directly as a fallback
export const testDirectTableAccess = async (): Promise<boolean> => {
  try {
    // Try a simple query to test if we can access the database
    const { data, error } = await supabase
      .from('page_views')
      .select('id')
      .limit(1);
      
    if (error) {
      console.log('Direct table access test failed:', error.message);
      return false;
    }
    
    console.log('Direct table access successful');
    return true;
  } catch (err) {
    console.error('Error testing direct table access:', err);
    return false;
  }
};

// Check if analytics tables exist
export const checkAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Checking if analytics tables exist...');
    
    // First try direct table access
    const directAccessWorks = await testDirectTableAccess();
    if (directAccessWorks) {
      console.log('Tables exist and are accessible directly!');
      return true;
    }
    
    // If direct access fails, tables may not exist, so let's try to create them
    return false;
  } catch (err) {
    console.error('Error in checkAnalyticsTables:', err);
    return false;
  }
};

// Create analytics tables if they don't exist - improved version
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // First ensure the execute_sql function exists
    await createExecuteSqlFunction();
    
    // Try using rpc to call the execute_sql function
    try {
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
