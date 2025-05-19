
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, Database, RefreshCw } from 'lucide-react';
import { runAllConnectionTests, testDatabaseConnection, checkAnalyticsTables, runDatabaseDiagnostics } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ConnectionChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<{
    basicConnection: boolean | null;
    sqlFunction: boolean | null;
    tablesExist: boolean | null;
    diagnostics: Record<string, boolean> | null;
  }>({
    basicConnection: null,
    sqlFunction: null,
    tablesExist: null,
    diagnostics: null
  });

  const runComprehensiveChecks = async () => {
    setIsChecking(true);
    try {
      // Basic connection tests
      const connectionTests = await runAllConnectionTests();
      
      // Run more detailed diagnostics
      const diagnostics = await runDatabaseDiagnostics();
      
      setResults({
        basicConnection: connectionTests.basicConnection,
        sqlFunction: connectionTests.sqlFunction,
        tablesExist: connectionTests.tablesExist || await checkAnalyticsTables(),
        diagnostics
      });
      
      if (connectionTests.basicConnection) {
        toast.success('Verbindungstest erfolgreich', {
          description: 'Die Grundverbindung zur Datenbank funktioniert.'
        });
      } else {
        toast.error('Verbindungstest fehlgeschlagen', {
          description: 'Die Datenbank konnte nicht erreicht werden.'
        });
      }
    } catch (error) {
      console.error('Error running connection checks:', error);
      toast.error('Fehler bei der Verbindungsprüfung', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Verbindungsdiagnose
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Führen Sie eine umfassende Diagnose der Datenbankverbindung und Tabellen durch.
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Grundverbindung:</span>
            <StatusBadge status={results.basicConnection} isLoading={isChecking} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">SQL-Ausführungsfunktion:</span>
            <StatusBadge status={results.sqlFunction} isLoading={isChecking} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Analytiktabellen existieren:</span>
            <StatusBadge status={results.tablesExist} isLoading={isChecking} />
          </div>
        </div>
        
        {results.diagnostics && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Detaillierte Diagnose:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(results.diagnostics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span>{key}:</span>
                  {value ? 
                    <span className="text-green-600 flex items-center"><Check className="h-3 w-3 mr-1" /> OK</span> : 
                    <span className="text-red-600 flex items-center"><X className="h-3 w-3 mr-1" /> Fehler</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={runComprehensiveChecks}
          disabled={isChecking}
          className="w-full mt-2 flex items-center justify-center"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verbindung wird geprüft...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verbindung umfassend prüfen
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status, isLoading }: { status: boolean | null, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Wird geprüft...
      </Badge>
    );
  }
  
  if (status === null) {
    return (
      <Badge variant="outline" className="bg-gray-50">
        Ungeprüft
      </Badge>
    );
  }
  
  if (status) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
        <Check className="h-3 w-3" /> OK
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
      <X className="h-3 w-3" /> Fehler
    </Badge>
  );
};

export default ConnectionChecker;
