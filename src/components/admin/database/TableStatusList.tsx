
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

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
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tables">
        <AccordionTrigger>Erforderliche Tabellen</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {Object.entries(tablesStatus).map(([table, exists]) => (
              <div key={table} className="flex items-center justify-between">
                <span className="font-mono text-sm">{table}</span>
                <span className={`text-sm ${
                  exists === null ? 'text-gray-400' : 
                  exists ? 'text-green-500' : 'text-red-500'
                }`}>
                  {exists === null ? 'Ungeprüft' : 
                   exists ? 'Vorhanden' : 'Nicht vorhanden'}
                </span>
              </div>
            ))}
          </div>
          
          {/* Add specific button for analytics tables */}
          {(!tablesStatus.page_views || !tablesStatus.events) && (
            <Button 
              onClick={handleCreateAnalyticsTables}
              disabled={isLoading || execSqlExists === false}
              variant="outline"
              className="mt-4 w-full bg-green-50 text-green-700 hover:bg-green-100"
            >
              Nur Analytik-Tabellen erstellen
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TableStatusList;
