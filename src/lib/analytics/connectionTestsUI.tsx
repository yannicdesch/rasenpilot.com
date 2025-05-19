
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { runAllConnectionTests } from './connectionTests';

export const ConnectionTestCard = () => {
  const [testResults, setTestResults] = useState<{
    basicConnection: boolean | null;
    sqlFunction: boolean | null;
    tablesExist: boolean | null;
    testing: boolean;
  }>({
    basicConnection: null,
    sqlFunction: null,
    tablesExist: null,
    testing: false,
  });
  
  const runTests = async () => {
    setTestResults(prev => ({ ...prev, testing: true }));
    try {
      const results = await runAllConnectionTests();
      setTestResults({
        basicConnection: results.basicConnection,
        sqlFunction: results.sqlFunction,
        tablesExist: results.tablesExist || false,
        testing: false,
      });
    } catch (err) {
      console.error('Error running connection tests:', err);
      setTestResults({
        basicConnection: false,
        sqlFunction: false,
        tablesExist: false,
        testing: false,
      });
    }
  };
  
  useEffect(() => {
    // Run tests automatically on mount
    runTests();
  }, []);
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Verbindungsstatus</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Supabase Verbindung:</span>
            <StatusBadge status={testResults.basicConnection} isLoading={testResults.testing} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">SQL-Ausführungsfunktion:</span>
            <StatusBadge status={testResults.sqlFunction} isLoading={testResults.testing} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Analytik-Tabellen:</span>
            <StatusBadge status={testResults.tablesExist} isLoading={testResults.testing} />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={testResults.testing}
            onClick={runTests}
            className="w-full mt-2"
          >
            {testResults.testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Verbindung wird getestet...
              </>
            ) : (
              'Verbindung erneut testen'
            )}
          </Button>
        </div>
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
