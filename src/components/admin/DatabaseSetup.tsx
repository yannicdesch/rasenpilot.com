
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createRequiredTables } from '@/lib/createTables';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Database } from 'lucide-react';
import { 
  createAnalyticsTables, 
  checkAnalyticsTables, 
  createExecuteSqlFunction 
} from '@/lib/analytics';

// Import the smaller components
import SqlFunctionStatus from './database/SqlFunctionStatus';
import TableStatusList from './database/TableStatusList';
import DatabaseActions from './database/DatabaseActions';

export const DatabaseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tablesStatus, setTablesStatus] = useState<Record<string, boolean | null>>({
    site_settings: null,
    profiles: null,
    page_views: null,
    events: null,
    blog_posts: null,
    pages: null,
    subscribers: null
  });
  const [execSqlExists, setExecSqlExists] = useState<boolean | null>(null);
  
  // Check if execute_sql function exists
  const checkExecuteSql = async () => {
    try {
      const { error } = await supabase.rpc('execute_sql', { 
        sql: 'SELECT 1 as test;' 
      });
      
      setExecSqlExists(!error);
      return !error;
    } catch (err) {
      console.error('Error checking execute_sql function:', err);
      setExecSqlExists(false);
      return false;
    }
  };
  
  // Create the execute_sql function if it doesn't exist
  const handleCreateExecuteSql = async () => {
    setIsLoading(true);
    try {
      const result = await createExecuteSqlFunction();
      if (result) {
        toast.success('SQL-Ausführungsfunktion erstellt', {
          description: 'Die execute_sql Funktion wurde erfolgreich erstellt'
        });
        await checkExecuteSql();
      } else {
        toast.error('Fehler beim Erstellen der SQL-Ausführungsfunktion');
      }
    } catch (err) {
      console.error('Error creating execute_sql function:', err);
      toast.error('Fehler beim Erstellen der SQL-Ausführungsfunktion');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkTables = async () => {
    setIsLoading(true);
    const tableStatus: Record<string, boolean> = {};
    
    try {
      // First check if execute_sql exists
      const sqlFunctionExists = await checkExecuteSql();
      
      // Check analytics tables separately with our specialized function
      const analyticsTablesExist = await checkAnalyticsTables();
      tableStatus.page_views = analyticsTablesExist;
      tableStatus.events = analyticsTablesExist;
      
      // For other tables, check directly since they're simpler
      const tablesToCheck = ['site_settings', 'profiles', 'blog_posts', 'pages', 'subscribers'];
      
      for (const table of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count(*)')
            .limit(1);
            
          tableStatus[table] = !error;
        } catch (err) {
          console.error(`Error checking ${table} table:`, err);
          tableStatus[table] = false;
        }
      }
      
      setTablesStatus(tableStatus);
    } catch (error) {
      console.error('Error checking tables:', error);
      toast.error('Fehler beim Überprüfen der Tabellen');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTables = async () => {
    setIsLoading(true);
    try {
      // First ensure the execute_sql function exists
      if (execSqlExists !== true) {
        const created = await createExecuteSqlFunction();
        if (!created) {
          toast.error('Konnte SQL-Ausführungsfunktion nicht erstellen', { 
            description: 'Dies ist erforderlich, um Tabellen zu erstellen'
          });
          setIsLoading(false);
          return;
        }
        setExecSqlExists(true);
      }
      
      // Create all tables
      await createRequiredTables();
      await createAnalyticsTables();
      
      // Check all tables again to update status
      await checkTables();
    } catch (error) {
      console.error('Error creating tables:', error);
      toast.error('Fehler beim Erstellen der Tabellen');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create only analytics tables
  const handleCreateAnalyticsTables = async () => {
    setIsLoading(true);
    try {
      // First ensure the execute_sql function exists
      if (execSqlExists !== true) {
        const created = await createExecuteSqlFunction();
        if (!created) {
          toast.error('Konnte SQL-Ausführungsfunktion nicht erstellen', { 
            description: 'Dies ist erforderlich, um Tabellen zu erstellen'
          });
          setIsLoading(false);
          return;
        }
        setExecSqlExists(true);
      }
      
      const success = await createAnalyticsTables();
      if (success) {
        await checkTables(); // Update the table status display
      }
    } catch (error) {
      console.error('Error creating analytics tables:', error);
      toast.error('Fehler beim Erstellen der Analytiktabellen');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkExecuteSql();
  }, []);
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Datenbank-Einrichtung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Hier können Sie prüfen, ob alle erforderlichen Tabellen in Ihrer Supabase-Datenbank existieren
          und bei Bedarf diese erstellen.
        </p>
        
        <SqlFunctionStatus 
          execSqlExists={execSqlExists} 
          isLoading={isLoading}
          handleCreateExecuteSql={handleCreateExecuteSql}
        />
        
        <TableStatusList 
          tablesStatus={tablesStatus}
          isLoading={isLoading}
          execSqlExists={execSqlExists}
          handleCreateAnalyticsTables={handleCreateAnalyticsTables}
        />
      </CardContent>
      
      <DatabaseActions 
        isLoading={isLoading}
        execSqlExists={execSqlExists}
        checkTables={checkTables}
        handleCreateTables={handleCreateTables}
      />
    </Card>
  );
};
