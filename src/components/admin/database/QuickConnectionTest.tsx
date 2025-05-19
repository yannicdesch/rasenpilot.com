
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  runAllConnectionTests, 
  testDatabaseConnection, 
  checkAnalyticsTables 
} from '@/lib/analytics';
import { toast } from 'sonner';
import { Loader2, Database } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const QuickConnectionTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    tables: boolean | null;
    complete: boolean;
  }>({
    connection: null,
    tables: null,
    complete: false
  });

  const runTest = async () => {
    setIsTesting(true);
    setTestResults({
      connection: null,
      tables: null,
      complete: false
    });
    
    try {
      // Test basic connection
      const connectionResult = await testDatabaseConnection();
      setTestResults(prev => ({
        ...prev,
        connection: connectionResult
      }));
      
      if (connectionResult) {
        // If connection works, check if tables exist
        const tablesExist = await checkAnalyticsTables();
        setTestResults(prev => ({
          ...prev,
          tables: tablesExist,
          complete: true
        }));
        
        if (tablesExist) {
          toast.success('Verbindung erfolgreich', {
            description: 'Die Datenbank ist verbunden und Analytics-Tabellen existieren.'
          });
        } else {
          toast.warning('Verbindung OK, Tabellen fehlen', {
            description: 'Die Datenbank ist verbunden, aber die Analytics-Tabellen existieren nicht.'
          });
        }
      } else {
        setTestResults(prev => ({
          ...prev,
          complete: true
        }));
        toast.error('Verbindungsfehler', {
          description: 'Die Verbindung zur Datenbank konnte nicht hergestellt werden.'
        });
      }
    } catch (error) {
      console.error('Error during connection test:', error);
      setTestResults({
        connection: false,
        tables: false,
        complete: true
      });
      toast.error('Fehler beim Testen der Verbindung', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Schneller Verbindungstest</h3>
        <p className="text-sm text-muted-foreground">
          Prüfen Sie, ob Ihre Supabase-Datenbank korrekt konfiguriert ist und die Analytics-Tabellen existieren.
        </p>
      </div>
      
      {testResults.complete && (
        <div className="mb-4">
          {testResults.connection ? (
            testResults.tables ? (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertTitle>Verbindung erfolgreich</AlertTitle>
                <AlertDescription>
                  Die Datenbank ist verbunden und die Analytics-Tabellen existieren.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTitle>Verbindung OK, Tabellen fehlen</AlertTitle>
                <AlertDescription>
                  Die Verbindung zur Datenbank funktioniert, aber die Analytics-Tabellen existieren nicht.
                </AlertDescription>
              </Alert>
            )
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Verbindungsfehler</AlertTitle>
              <AlertDescription>
                Die Verbindung zur Datenbank konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Supabase-Konfiguration.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      <Button 
        onClick={runTest} 
        disabled={isTesting}
        className="w-full flex items-center justify-center"
      >
        {isTesting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Verbindung wird getestet...
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-2" />
            Datenbankverbindung testen
          </>
        )}
      </Button>
    </div>
  );
};

export default QuickConnectionTest;
