import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Check, X, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { runAllConnectionTests, testDatabaseConnection, checkAnalyticsTables, runDatabaseDiagnostics } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

const ConnectionChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
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
    setConnectionError(null);
    
    try {
      console.log('Starting comprehensive connection checks...');
      
      // Test direct connection to Supabase
      console.log('Testing basic Supabase connection...');
      try {
        // Simple test to check if Supabase client is initialized correctly
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Auth session check result:', sessionError ? 'Error' : 'Success');
        if (sessionError) {
          console.error('Auth session error:', sessionError);
          setConnectionError(`Auth API error: ${sessionError.message}`);
        }
        
        // Try a simple query that should work even without special permissions
        const { data: versionData, error: versionError } = await supabase.rpc('version', {});
        console.log('Version RPC check:', versionError ? 'Error' : 'Success');
        
        if (versionError && versionError.message.includes('not found')) {
          console.log('Version RPC not found, this is expected. Trying a simple query instead.');
        }
        
      } catch (directError: any) {
        console.error('Direct Supabase connection error:', directError);
        setConnectionError(`Direct connection error: ${directError.message || 'Unknown error'}`);
      }
      
      // Run the standard connection tests
      const connectionTests = await runAllConnectionTests();
      console.log('Connection test results:', connectionTests);
      
      // Run detailed diagnostics
      let diagnostics = null;
      try {
        diagnostics = await runDatabaseDiagnostics();
        console.log('Diagnostics test results:', diagnostics);
      } catch (diagError: any) {
        console.error('Diagnostics error:', diagError);
      }
      
      // Check if tables exist
      let tablesExist = connectionTests.tablesExist;
      if (tablesExist === null) {
        try {
          tablesExist = await checkAnalyticsTables();
        } catch (tableError) {
          console.error('Error checking tables:', tableError);
        }
      }
      
      // Update the results
      setResults({
        basicConnection: connectionTests.basicConnection,
        sqlFunction: connectionTests.sqlFunction,
        tablesExist,
        diagnostics
      });
      
      if (connectionTests.basicConnection) {
        toast.success('Verbindungstest erfolgreich', {
          description: 'Die Grundverbindung zur Datenbank funktioniert.'
        });
      } else {
        const errorMsg = connectionError || 'Die Datenbank konnte nicht erreicht werden.';
        toast.error('Verbindungstest fehlgeschlagen', {
          description: errorMsg
        });
      }
      
    } catch (error: any) {
      console.error('Error running connection checks:', error);
      setConnectionError(`Connection check error: ${error.message || 'Unknown error'}`);
      
      toast.error('Fehler bei der Verbindungsprüfung', {
        description: error.message || 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Get Supabase URL from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                     import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                     'https://ugaxwcslhoppflrbuwxv.supabase.co';

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Verbindungsdiagnose
        </CardTitle>
        <CardDescription>
          Überprüfen Sie die Verbindung zur Supabase-Datenbank und den Status der benötigten Tabellen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verbindungsfehler</AlertTitle>
            <AlertDescription className="text-sm font-mono break-all">
              {connectionError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground mb-4">
          Detaillierte Informationen zu Ihrer Datenbankverbindung:
          <div className="mt-2 text-xs font-mono">
            URL: {supabaseUrl}
          </div>
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
