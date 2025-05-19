
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
        
        // If we get here, try the edge function approach as last resort
        console.log('Trying edge function as last resort...');
        try {
          const { error: functionError } = await supabase.functions.invoke('execute-sql', {
            body: { sql: createTablesSQL }
          });
          
          if (functionError) {
            console.error('Error with edge function approach:', functionError);
            toast.error('Fehler beim Erstellen der Analytiktabellen', {
              description: 'Die Edge-Funktion konnte die Tabellen nicht erstellen.'
            });
            return false;
          }
          
          console.log('Tables created successfully via edge function');
          toast.success('Analytiktabellen wurden erfolgreich erstellt');
          return true;
        } catch (functionErr) {
          console.error('Edge function error:', functionErr);
          toast.error('Fehler beim Erstellen der Analytiktabellen', {
            description: 'Alle Ansätze zur Tabellenerstellung sind fehlgeschlagen.'
          });
          return false;
        }
      }
      
      console.log('Tables created successfully via RPC');
      toast.success('Analytiktabellen wurden erfolgreich erstellt');
      return true;
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
