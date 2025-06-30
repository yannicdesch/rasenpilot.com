
import { supabase } from '@/lib/supabase';

// Test overall database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query that should always work
    const { error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
};

// Run comprehensive database diagnostics
export const runDatabaseDiagnostics = async () => {
  const diagnostics = {
    connection: false,
    tables: {} as Record<string, boolean>,
    timestamp: new Date().toISOString(),
    errors: [] as string[]
  };

  try {
    // Test basic connection
    diagnostics.connection = await testDatabaseConnection();
    
    // Test table access
    const tablesToTest = [
      'profiles',
      'site_settings',
      'blog_posts',
      'pages',
      'subscribers',
      'page_views',
      'events'
    ];
    
    for (const table of tablesToTest) {
      try {
        const { error } = await supabase
          .from(table as any)
          .select('count(*)', { count: 'exact' })
          .limit(1);
        
        diagnostics.tables[table] = !error;
        if (error) {
          diagnostics.errors.push(`Table ${table}: ${error.message}`);
        }
      } catch (err) {
        diagnostics.tables[table] = false;
        diagnostics.errors.push(`Table ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
    
    return diagnostics;
  } catch (err) {
    diagnostics.errors.push(`General error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return diagnostics;
  }
};

// Check if specific table exists and is accessible
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName as any)
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error(`Error checking table ${tableName}:`, err);
    return false;
  }
};

// Get basic system info
export const getSystemInfo = async () => {
  try {
    const info = {
      timestamp: new Date().toISOString(),
      connection: await testDatabaseConnection(),
      tables: await runDatabaseDiagnostics()
    };
    
    return info;
  } catch (err) {
    console.error('Error getting system info:', err);
    return {
      timestamp: new Date().toISOString(),
      connection: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};
