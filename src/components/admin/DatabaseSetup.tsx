import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createRequiredTables } from '@/lib/createTables';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  createAnalyticsTables, 
  checkAnalyticsTables, 
  createExecuteSqlFunction 
} from '@/lib/analytics';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Database } from 'lucide-react';

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
        
        {execSqlExists === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>SQL-Ausführungsfunktion fehlt</AlertTitle>
            <AlertDescription>
              Die benötigte Funktion 'execute_sql' existiert nicht in Ihrer Datenbank.
              Diese Funktion ist erforderlich, um Tabellen zu erstellen.
              <Button 
                onClick={handleCreateExecuteSql} 
                variant="outline" 
                size="sm"
                className="mt-2 w-full"
                disabled={isLoading}
              >
                SQL-Ausführungsfunktion erstellen
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="tables">
            <AccordionTrigger>Erforderliche Tabellen</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Object.entries(tablesStatus).map(([table, exists]) => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{table}</span>
                    <span className={`text-sm ${
                      exists === null ? 'text-gray-400' : 
                      exists ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {exists === null ? 'Ungeprüft' : 
                       exists ? 'Vorhanden' : 'Nicht vorhanden'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Add specific button for analytics tables */}
              {(!tablesStatus.page_views || !tablesStatus.events) && (
                <Button 
                  onClick={handleCreateAnalyticsTables}
                  disabled={isLoading || execSqlExists === false}
                  variant="outline"
                  className="mt-4 w-full bg-green-50 text-green-700 hover:bg-green-100"
                >
                  Nur Analytik-Tabellen erstellen
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={checkTables} 
          disabled={isLoading}
        >
          Tabellen prüfen
        </Button>
        <Button 
          onClick={handleCreateTables} 
          disabled={isLoading || execSqlExists === false}
        >
          Alle Tabellen erstellen
        </Button>
      </CardFooter>
    </Card>
  );
};
