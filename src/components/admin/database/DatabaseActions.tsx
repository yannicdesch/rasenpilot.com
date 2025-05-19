
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Database, Beaker } from 'lucide-react';
import { toast } from 'sonner';
import { createTestTable } from '@/lib/analytics';

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
      const result = await createTestTable();
      if (result) {
        toast.success('Verbindungstest erfolgreich', {
          description: 'Eine Testtabelle wurde erstellt und Daten wurden eingefügt.'
        });
      } else {
        toast.error('Verbindungstest fehlgeschlagen', {
          description: 'Die Testtabelle konnte nicht erstellt oder keine Daten eingefügt werden.'
        });
      }
    } catch (error) {
      console.error('Test connection error:', error);
      toast.error('Verbindungstest fehlgeschlagen', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setTestingConnection(false);
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
          disabled={isLoading || testingConnection || execSqlExists === false}
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
        disabled={isLoading || testingConnection || execSqlExists === false}
      >
        Alle Tabellen erstellen
      </Button>
    </CardFooter>
  );
};

export default DatabaseActions;
