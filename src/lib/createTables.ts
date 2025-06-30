
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Helper function to execute SQL directly
const executeSqlDirectly = async (sql: string): Promise<boolean> => {
  try {
    console.log('SQL execution not available in current setup:', sql);
    return false;
  } catch (err) {
    console.error('Error executing SQL directly:', err);
    return false;
  }
};

export const createRequiredTables = async (): Promise<boolean> => {
  try {
    console.log('Table creation should be done via Supabase migrations or dashboard');
    
    // Check if tables exist
    const tables = ['site_settings', 'profiles', 'blog_posts', 'pages', 'subscribers'];
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table as any)
          .select('count(*)', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.error(`Table ${table} does not exist or is not accessible:`, error);
          allTablesExist = false;
        }
      } catch (err) {
        console.error(`Error checking table ${table}:`, err);
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      toast.success('Alle benötigten Tabellen sind verfügbar');
      return true;
    } else {
      toast.error('Einige Tabellen fehlen', {
        description: 'Bitte erstellen Sie die Tabellen über das Supabase Dashboard'
      });
      return false;
    }
  } catch (error: any) {
    console.error('Error checking tables:', error);
    toast.error('Fehler beim Überprüfen der Tabellen', {
      description: error.message
    });
    return false;
  }
};

// Helper function to modify lib/analytics.ts to improve table existence checking
export const updateAnalyticsMethods = async () => {
  try {
    // This is only for demonstration purposes - in a real app, you would update the files directly
    console.log('Updating analytics methods to use direct table queries instead of information_schema');
    return true;
  } catch (error: any) {
    console.error('Error updating analytics methods:', error);
    return false;
  }
};
