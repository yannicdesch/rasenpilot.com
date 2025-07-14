
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Database, Beaker, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [creatingTables, setCreatingTables] = React.useState(false);
  
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // Test basic connection
      const { error } = await supabase.from('profiles').select('*', { count: 'exact' }).limit(1);
      
      if (!error) {
        toast.success('Verbindungstest erfolgreich', {
          description: 'Die Datenbank ist erreichbar'
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
    setCreatingTables(true);
    try {
      console.log('Creating tables using edge function...');
      const url = 'https://ugaxwcslhoppflrbuwxv.supabase.co';
      
      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || '';
      
      const response = await fetch(`${url}/functions/v1/create-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ'
        },
        body: JSON.stringify({
          action: 'create_analytics_tables'
        })
      });
      
      if (!response.ok) {
        console.error('Edge function HTTP error:', response.status, await response.text());
        toast.error('Fehler beim Erstellen der Tabellen', {
          description: `HTTP Status: ${response.status}`
        });
        return false;
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Tabellen erfolgreich erstellt', {
          description: 'Die Analytiktabellen wurden erfolgreich erstellt.'
        });
        // Check tables status after creating them
        checkTables();
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
      toast.error('Fehler beim Erstellen der Tabellen', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
      return false;
    } finally {
      setCreatingTables(false);
    }
  };
  
  return (
    <CardFooter className="flex flex-wrap gap-2 justify-between">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={checkTables} 
          disabled={isLoading || testingConnection || creatingTables}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Prüfe...
            </>
          ) : (
            'Tabellen prüfen'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={isLoading || testingConnection || creatingTables}
          className="flex items-center gap-2"
        >
          {testingConnection ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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
        onClick={createTablesDirectlyWithEdgeFunction}
        disabled={isLoading || testingConnection || creatingTables}
        className="flex items-center gap-2"
      >
        {creatingTables ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Erstelle Tabellen...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-1" />
            <span>Tabellen mit Edge Function erstellen</span>
          </>
        )}
      </Button>
    </CardFooter>
  );
};

export default DatabaseActions;
