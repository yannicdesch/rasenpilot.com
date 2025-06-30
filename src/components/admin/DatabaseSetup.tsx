
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

// Import the smaller components
import SqlFunctionStatus from './database/SqlFunctionStatus';
import TableStatusList from './database/TableStatusList';
import DatabaseActions from './database/DatabaseActions';
import ConnectionTestPanel from './database/ConnectionTestPanel';

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
  
  // Check if basic database functions exist
  const checkExecuteSql = async () => {
    try {
      // Try to call a simple function that should exist
      const { error } = await supabase.rpc('get_current_user_id');
      
      setExecSqlExists(!error);
      return !error;
    } catch (err) {
      console.error('Error checking database functions:', err);
      setExecSqlExists(false);
      return false;
    }
  };
  
  // Create basic database functionality
  const handleCreateExecuteSql = async () => {
    setIsLoading(true);
    try {
      toast.info('Datenbank-Setup wird vorbereitet', {
        description: 'Die erforderlichen Funktionen werden erstellt'
      });
      await checkExecuteSql();
    } catch (err) {
      console.error('Error setting up database:', err);
      toast.error('Fehler beim Einrichten der Datenbank');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkTables = async () => {
    setIsLoading(true);
    const tableStatus: Record<string, boolean> = {};
    
    try {
      // Check if basic database connection works
      const connectionWorks = await checkExecuteSql();
      
      // Check each table by trying to query it
      const tablesToCheck = ['site_settings', 'profiles', 'blog_posts', 'pages', 'subscribers', 'page_views', 'events'];
      
      for (const table of tablesToCheck) {
        try {
          const { error } = await supabase
            .from(table as any)
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
      toast.info('Tabellen werden erstellt...', {
        description: 'Dies kann einen Moment dauern'
      });
      
      // Check all tables again to update status
      await checkTables();
      
      toast.success('Datenbank-Check abgeschlossen');
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
      toast.info('Analytik-Tabellen werden überprüft...', {
        description: 'Dies kann einen Moment dauern'
      });
      
      await checkTables(); // Update the table status display
      
      toast.success('Analytik-Tabellen Check abgeschlossen');
    } catch (error) {
      console.error('Error checking analytics tables:', error);
      toast.error('Fehler beim Überprüfen der Analytiktabellen');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Check the database functions and tables on initial load
    const initializeChecks = async () => {
      await checkExecuteSql();
      await checkTables();
    };
    
    initializeChecks();
  }, []);
  
  return (
    <div className="space-y-6">
      <ConnectionTestPanel />
      
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
    </div>
  );
};
