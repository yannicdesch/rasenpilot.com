
import React from 'react';
import { AlertTriangle, Database, Loader2, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TableCreationAlertProps {
  isCreatingTables: boolean;
  tableCreationError: string | null;
  handleCreateTables: () => Promise<void>;
  supabaseInfo: {
    url: string | null;
    hasApiKey: boolean;
    connectionStatus?: 'testing' | 'connected' | 'error';
  };
}

const TableCreationAlert = ({ 
  isCreatingTables, 
  tableCreationError, 
  handleCreateTables,
  supabaseInfo
}: TableCreationAlertProps) => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Analytiktabellen existieren nicht</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p>Die erforderlichen Tabellen "page_views" und "events" wurden in Ihrer Supabase-Datenbank nicht gefunden.
        Ohne diese Tabellen können keine Analysedaten gespeichert werden.</p>
        
        <div className="mt-2 space-y-2 p-3 bg-amber-100/50 rounded-md text-sm">
          <h4 className="font-semibold">Supabase Verbindungsdetails:</h4>
          <div className="flex items-center gap-2">
            <span>URL konfiguriert:</span> 
            <Badge variant={supabaseInfo.url ? "outline" : "destructive"}>
              {supabaseInfo.url ? "Ja" : "Nein"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>API Key konfiguriert:</span> 
            <Badge variant={supabaseInfo.hasApiKey ? "outline" : "destructive"}>
              {supabaseInfo.hasApiKey ? "Ja" : "Nein"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>Verbindungsstatus:</span> 
            {supabaseInfo.connectionStatus === 'testing' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Wird geprüft...
              </Badge>
            )}
            {supabaseInfo.connectionStatus === 'connected' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                <Check className="h-3 w-3" /> Verbunden
              </Badge>
            )}
            {supabaseInfo.connectionStatus === 'error' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <X className="h-3 w-3" /> Verbindungsfehler
              </Badge>
            )}
          </div>
        </div>
        
        {tableCreationError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-sm">
            <strong>Fehler:</strong> {tableCreationError}
          </div>
        )}
        
        <div className="mt-4">
          <Button 
            onClick={handleCreateTables}
            disabled={isCreatingTables || supabaseInfo.connectionStatus === 'error'}
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
