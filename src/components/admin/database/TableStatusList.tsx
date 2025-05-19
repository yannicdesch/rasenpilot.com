
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Check, X, Loader2 } from 'lucide-react';

interface TableStatusListProps {
  tablesStatus: Record<string, boolean | null>;
  isLoading: boolean;
  execSqlExists: boolean | null;
  handleCreateAnalyticsTables: () => Promise<void>;
}

const TableStatusList = ({ 
  tablesStatus, 
  isLoading, 
  execSqlExists,
  handleCreateAnalyticsTables 
}: TableStatusListProps) => {
  const [creatingAnalyticsTables, setCreatingAnalyticsTables] = React.useState(false);
  
  const handleCreateAnalyticsTablesWithFeedback = async () => {
    setCreatingAnalyticsTables(true);
    try {
      await handleCreateAnalyticsTables();
    } finally {
      setCreatingAnalyticsTables(false);
    }
  };
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tables">
        <AccordionTrigger>Erforderliche Tabellen</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {Object.entries(tablesStatus).map(([table, exists]) => (
              <div key={table} className="flex items-center justify-between">
                <span className="font-mono text-sm">{table}</span>
                <div className="flex items-center">
                  {isLoading && exists === null ? (
                    <span className="flex items-center text-sm text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" /> Prüfe...
                    </span>
                  ) : exists === null ? (
                    <span className="text-sm text-gray-400">Ungeprüft</span>
                  ) : exists ? (
                    <span className="flex items-center text-sm text-green-500">
                      <Check className="h-3 w-3 mr-1" /> Vorhanden
                    </span>
                  ) : (
                    <span className="flex items-center text-sm text-red-500">
                      <X className="h-3 w-3 mr-1" /> Nicht vorhanden
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add specific button for analytics tables */}
          {(!tablesStatus.page_views || !tablesStatus.events) && (
            <Button 
              onClick={handleCreateAnalyticsTablesWithFeedback}
              disabled={isLoading || execSqlExists === false || creatingAnalyticsTables}
              variant="outline"
              className="mt-4 w-full bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center"
            >
              {creatingAnalyticsTables ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Erstelle Analytik-Tabellen...
                </>
              ) : (
                'Nur Analytik-Tabellen erstellen'
              )}
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TableStatusList;
