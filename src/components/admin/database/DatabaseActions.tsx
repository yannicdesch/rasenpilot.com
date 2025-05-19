
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Database, Beaker } from 'lucide-react';
import { toast } from 'sonner';
import { createTestTable, runAllConnectionTests } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

interface DatabaseActionsProps {
  isLoading: boolean;
  execSqlExists: boolean | null;
  checkTables: () => Promise<void>;
  handleCreateTables: () => Promise<void>;
}

const DatabaseActions = ({ 
  isLoading, 
  execSqlExists, 
  checkTables, 
  handleCreateTables 
}: DatabaseActionsProps) => {
  const [testingConnection, setTestingConnection] = React.useState(false);
  
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // Run comprehensive connection tests
      const results = await runAllConnectionTests();
      
      if (results.basicConnection) {
        toast.success('Verbindungstest erfolgreich', {
          description: `Verbindung: ${results.basicConnection ? 'OK' : 'Fehler'}, SQL-Funktion: ${results.sqlFunction ? 'OK' : 'Fehler'}`
        });
      } else {
        toast.error('Verbindungstest fehlgeschlagen', {
          description: 'Die Datenbank konnte nicht erreicht werden.'
        });
      }
      
      // Update the tables status after testing
      checkTables();
    } catch (error) {
      console.error('Test connection error:', error);
      toast.error('Verbindungstest fehlgeschlagen', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  const createTablesDirectlyWithEdgeFunction = async () => {
    try {
      console.log('Creating tables using edge function...');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugaxwcslhoppflrbuwxv.supabase.co';
      
      const response = await fetch(`${url}/functions/v1/create-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        },
        body: JSON.stringify({
          action: 'create_analytics_tables'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Tabellen erfolgreich erstellt', {
          description: 'Die Analytiktabellen wurden erfolgreich erstellt.'
        });
        return true;
      } else {
        console.error('Error creating tables with edge function:', result);
        toast.error('Fehler beim Erstellen der Tabellen', {
          description: `Fehler: ${result.errors?.pageViews || result.errors?.events || 'Unbekannter Fehler'}`
        });
        return false;
      }
    } catch (error) {
      console.error('Error using edge function:', error);
      return false;
    }
  };
  
  return (
    <CardFooter className="flex flex-wrap gap-2 justify-between">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={checkTables} 
          disabled={isLoading || testingConnection}
        >
          Tabellen prüfen
        </Button>
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={isLoading || testingConnection}
          className="flex items-center gap-2"
        >
          {testingConnection ? (
            <>
              <span className="h-4 w-4 border-2 border-t-transparent border-muted-foreground rounded-full animate-spin"></span>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Beaker className="h-4 w-4" />
              <span>Verbindung testen</span>
            </>
          )}
        </Button>
      </div>
      <Button 
        onClick={handleCreateTables} 
        disabled={isLoading || testingConnection}
      >
        Alle Tabellen erstellen
      </Button>
    </CardFooter>
  );
};

export default DatabaseActions;
