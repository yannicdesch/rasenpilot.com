
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { runAllConnectionTests } from './connectionTests';
import { toast } from 'sonner';

interface TestResults {
  basicConnection: boolean;
  sqlFunction: boolean;
  analyticsTablesExist: boolean;
  insertPermissions: boolean;
  [key: string]: boolean;
}

export const ConnectionTestCard = () => {
  const [results, setResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await runAllConnectionTests();
      setResults(testResults as TestResults);
      
      // Show success or warning based on results
      if (testResults.basicConnection) {
        if (testResults.sqlFunction && testResults.analyticsTablesExist) {
          toast.success('Verbindungstest erfolgreich', {
            description: 'Alle Tests wurden erfolgreich abgeschlossen.'
          });
        } else {
          toast.warning('Verbindung teilweise erfolgreich', {
            description: 'Einige Tests waren nicht erfolgreich, siehe Details.'
          });
        }
      } else {
        toast.error('Verbindungstest fehlgeschlagen', {
          description: 'Die Verbindung zur Datenbank konnte nicht hergestellt werden.'
        });
      }
    } catch (err) {
      console.error('Error running tests:', err);
      toast.error('Fehler beim Ausführen der Tests', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Datenbank-Verbindungstests</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Führen Sie umfassende Tests durch, um die Verbindung zur Datenbank und die Berechtigungen zu prüfen.
        </p>
        
        {results && (
          <div className="space-y-3 mt-4">
            <h3 className="font-medium text-sm">Testergebnisse:</h3>
            <TestResultItem 
              label="Grundverbindung" 
              success={results.basicConnection} 
              description={results.basicConnection ? "Verbindung zur Datenbank hergestellt" : "Keine Verbindung zur Datenbank"} 
            />
            <TestResultItem 
              label="SQL-Ausführungsfunktion" 
              success={results.sqlFunction} 
              description={results.sqlFunction ? "SQL-Funktion verfügbar" : "SQL-Funktion nicht verfügbar"} 
            />
            <TestResultItem 
              label="Analytics-Tabellen" 
              success={results.analyticsTablesExist} 
              description={results.analyticsTablesExist ? "Tabellen existieren" : "Tabellen existieren nicht"} 
            />
            <TestResultItem 
              label="Einfüge-Berechtigungen" 
              success={results.insertPermissions} 
              description={results.insertPermissions ? "Daten können eingefügt werden" : "Keine Berechtigung zum Einfügen"} 
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runTests}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Tests werden ausgeführt...
            </>
          ) : (
            'Verbindungstests ausführen'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface TestResultItemProps {
  label: string;
  success: boolean;
  description: string;
}

const TestResultItem = ({ label, success, description }: TestResultItemProps) => {
  return (
    <div className={`flex items-center p-2 rounded-md ${success ? 'bg-green-50' : 'bg-red-50'}`}>
      {success ? (
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 mr-2" />
      )}
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
