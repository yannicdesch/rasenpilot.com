
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface SqlFunctionStatusProps {
  execSqlExists: boolean | null;
  isLoading: boolean;
  handleCreateExecuteSql: () => Promise<void>;
}

const SqlFunctionStatus = ({ 
  execSqlExists, 
  isLoading, 
  handleCreateExecuteSql 
}: SqlFunctionStatusProps) => {
  if (execSqlExists !== false) return null;

  return (
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
  );
};

export default SqlFunctionStatus;
