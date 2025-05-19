
import React from 'react';
import { AlertTriangle, Database, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface TableCreationAlertProps {
  isCreatingTables: boolean;
  tableCreationError: string | null;
  handleCreateTables: () => Promise<void>;
}

const TableCreationAlert = ({ 
  isCreatingTables, 
  tableCreationError, 
  handleCreateTables 
}: TableCreationAlertProps) => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Analytiktabellen existieren nicht</AlertTitle>
      <AlertDescription className="text-amber-700">
        Die erforderlichen Tabellen "page_views" und "events" wurden in Ihrer Supabase-Datenbank nicht gefunden.
        Ohne diese Tabellen können keine Analysedaten gespeichert werden.
        
        {tableCreationError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-sm">
            <strong>Fehler:</strong> {tableCreationError}
          </div>
        )}
        
        <div className="mt-3">
          <Button 
            onClick={handleCreateTables}
            disabled={isCreatingTables}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
          >
            {isCreatingTables ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {isCreatingTables ? 'Tabellen werden erstellt...' : 'Tabellen jetzt erstellen'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default TableCreationAlert;
