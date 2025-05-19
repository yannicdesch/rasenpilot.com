
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { createExecuteSqlFunction } from './sqlFunctions';

// Create analytics tables if they don't exist - improved version with better error handling
export const createAnalyticsTables = async (): Promise<boolean> => {
  try {
    console.log('Starting to create analytics tables...');
    
    // Import testDatabaseConnection dynamically to avoid circular dependencies
    const { testDatabaseConnection } = await import('./connectionUtils');
    
    // Test overall database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Database connection failed, cannot create tables');
      toast.error('Datenbankverbindung fehlgeschlagen', {
        description: 'Bitte überprüfen Sie Ihre Supabase-Konfiguration.'
      });
      return false;
    }
    
    // First try the edge function approach (most reliable)
    try {
      console.log('Trying to create tables with edge function...');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugaxwcslhoppflrbuwxv.supabase.co';
      
      // Get the current session - fixed to use the new API
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || '';
      
      const response = await fetch(`${url}/functions/v1/create-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          action: 'create_analytics_tables'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log('Tables created successfully via edge function');
          toast.success('Analytiktabellen wurden erfolgreich erstellt');
          return true;
        } else {
          console.error('Edge function returned error:', result);
        }
      } else {
        console.error('Edge function HTTP error:', response.status, await response.text());
      }
    } catch (edgeErr) {
      console.error('Error with edge function approach:', edgeErr);
    }
    
    // If edge function fails, ensure the execute_sql function exists
    const sqlFunctionCreated = await createExecuteSqlFunction();
    console.log('SQL function created or exists:', sqlFunctionCreated);
    
    if (!sqlFunctionCreated) {
      console.error('Failed to create SQL execution function');
      toast.error('SQL-Ausführungsfunktion konnte nicht erstellt werden', {
        description: 'Bitte stellen Sie sicher, dass Sie Admin-Berechtigungen haben.'
      });
      return false;
    }
    
    // Try using direct SQL with clearer debugging
    try {
      console.log('Attempting to create tables with direct SQL...');
      const createTablesSQL = `
        -- Create page_views table
        CREATE TABLE IF NOT EXISTS page_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          path TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          referrer TEXT,
          user_agent TEXT
        );

        -- Create events table
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category TEXT NOT NULL,
          action TEXT NOT NULL, 
          label TEXT,
          value INTEGER,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Set permissions (CRITICAL)
        ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
        
        -- Allow public insert access
        CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
          ON page_views FOR INSERT TO anon, authenticated
          WITH CHECK (true);
          
        CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
          ON events FOR INSERT TO anon, authenticated
          WITH CHECK (true);
          
        -- Allow select access
        CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
          ON page_views FOR SELECT TO anon, authenticated
          USING (true);
          
        CREATE POLICY IF NOT EXISTS "Allow select access to events" 
          ON events FOR SELECT TO anon, authenticated
          USING (true);
      `;
      
      // First try with a direct RPC call
      console.log('Trying with RPC call to execute_sql...');
      const { error } = await supabase.rpc('execute_sql', { sql: createTablesSQL });
      
      if (error) {
        console.error('Error using execute_sql RPC:', error);
        
        // Try direct table creation without using the function
        console.log('Trying direct table creation with from/select...');
        try {
          // We'll do this by creating each table separately
          console.log('Creating page_views table...');
          
          // Use try-catch instead of .catch()
          try {
            const { error: pvError } = await supabase
              .from('page_views')
              .select('*')
              .limit(1);
              
            // Table exists if no error
            if (!pvError) {
              console.log('page_views table already exists');
            } else {
              // Table likely doesn't exist, try to create
              console.log('Creating page_views table directly...');
              const { error: createError } = await supabase
                .rpc('execute_sql', {
                  sql: `
                    CREATE TABLE IF NOT EXISTS page_views (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      path TEXT NOT NULL,
                      timestamp TIMESTAMPTZ DEFAULT NOW(),
                      referrer TEXT,
                      user_agent TEXT
                    );
                    
                    ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
                      ON page_views FOR INSERT TO anon, authenticated
                      WITH CHECK (true);
                      
                    CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
                      ON page_views FOR SELECT TO anon, authenticated
                      USING (true);
                  `
                });
                
              if (createError) {
                console.error('Error creating page_views table:', createError);
              } else {
                console.log('Successfully created page_views table');
              }
            }
          } catch (e) {
            // Table doesn't exist, so try to create it
            console.log('Error querying page_views table, assuming it does not exist:', e);
            console.log('Creating page_views table directly...');
            const { error: createError } = await supabase
              .rpc('execute_sql', {
                sql: `
                  CREATE TABLE IF NOT EXISTS page_views (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    path TEXT NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    referrer TEXT,
                    user_agent TEXT
                  );
                  
                  ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
                  
                  CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
                    ON page_views FOR INSERT TO anon, authenticated
                    WITH CHECK (true);
                    
                  CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
                    ON page_views FOR SELECT TO anon, authenticated
                    USING (true);
                `
              });
              
            if (createError) {
              console.error('Error creating page_views table:', createError);
            } else {
              console.log('Successfully created page_views table');
            }
          }
          
          console.log('Creating events table...');
          try {
            const { error: evError } = await supabase
              .from('events')
              .select('*')
              .limit(1);
              
            // Table exists if no error
            if (!evError) {
              console.log('events table already exists');
            } else {
              // Table likely doesn't exist, try to create
              console.log('Creating events table directly...');
              const { error: createError } = await supabase
                .rpc('execute_sql', {
                  sql: `
                    CREATE TABLE IF NOT EXISTS events (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      category TEXT NOT NULL,
                      action TEXT NOT NULL, 
                      label TEXT,
                      value INTEGER,
                      timestamp TIMESTAMPTZ DEFAULT NOW()
                    );
                    
                    ALTER TABLE events ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
                      ON events FOR INSERT TO anon, authenticated
                      WITH CHECK (true);
                      
                    CREATE POLICY IF NOT EXISTS "Allow select access to events" 
                      ON events FOR SELECT TO anon, authenticated
                      USING (true);
                  `
                });
                
              if (createError) {
                console.error('Error creating events table:', createError);
              } else {
                console.log('Successfully created events table');
              }
            }
          } catch (e) {
            // Table doesn't exist, so try to create it
            console.log('Error querying events table, assuming it does not exist:', e);
            console.log('Creating events table directly...');
            const { error: createError } = await supabase
              .rpc('execute_sql', {
                sql: `
                  CREATE TABLE IF NOT EXISTS events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    category TEXT NOT NULL,
                    action TEXT NOT NULL, 
                    label TEXT,
                    value INTEGER,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                  );
                  
                  ALTER TABLE events ENABLE ROW LEVEL SECURITY;
                  
                  CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
                    ON events FOR INSERT TO anon, authenticated
                    WITH CHECK (true);
                    
                  CREATE POLICY IF NOT EXISTS "Allow select access to events" 
                    ON events FOR SELECT TO anon, authenticated
                    USING (true);
                `
              });
              
            if (createError) {
              console.error('Error creating events table:', createError);
            } else {
              console.log('Successfully created events table');
            }
          }
          
          // Check if tables now exist
          const tablesExist = await checkTablesExist();
          if (tablesExist) {
            console.log('Successfully created tables using sequential approach');
            toast.success('Analytiktabellen wurden erfolgreich erstellt');
            return true;
          } else {
            console.error('Tables still do not exist after creation attempt');
            toast.error('Fehler beim Erstellen der Analytiktabellen', {
              description: 'Die Tabellen konnten nicht erstellt werden.'
            });
            return false;
          }
        } catch (directErr) {
          console.error('Error with direct table creation approach:', directErr);
        }

      } else {
        console.log('Tables created successfully via RPC');
        toast.success('Analytiktabellen wurden erfolgreich erstellt');
        return true;
      }
      
      console.error('All approaches failed to create tables');
      toast.error('Fehler beim Erstellen der Analytiktabellen', {
        description: 'Alle Ansätze zur Tabellenerstellung sind fehlgeschlagen.'
      });
      return false;
      
    } catch (sqlErr) {
      console.error('Error executing SQL:', sqlErr);
      toast.error('Fehler beim Erstellen der Analytiktabellen', {
        description: 'SQL-Ausführungsfehler: ' + (sqlErr instanceof Error ? sqlErr.message : 'Unbekannter Fehler')
      });
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

// Helper function to check if tables exist
const checkTablesExist = async (): Promise<boolean> => {
  try {
    // Check page_views
    try {
      const { data: pvData, error: pvError } = await supabase
        .from('page_views')
        .select('count(*)')
        .limit(1);
        
      if (pvError) {
        console.error('Error checking page_views:', pvError);
        return false;
      }
    } catch (e) {
      console.error('Error checking page_views table exists:', e);
      return false;
    }
    
    // Check events
    try {
      const { data: evData, error: evError } = await supabase
        .from('events')
        .select('count(*)')
        .limit(1);
        
      if (evError) {
        console.error('Error checking events:', evError);
        return false;
      }
    } catch (e) {
      console.error('Error checking events table exists:', e);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error checking table existence:', err);
    return false;
  }
};
