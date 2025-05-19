
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface DatabaseActionsProps {
  isLoading: boolean;
  execSqlExists: boolean | null;
  checkTables: () => Promise<void>;
  handleCreateTables: () => Promise<void>;
}

const DatabaseActions = ({ 
  isLoading, 
  execSqlExists, 
  checkTables, 
  handleCreateTables 
}: DatabaseActionsProps) => {
  return (
    <CardFooter className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={checkTables} 
        disabled={isLoading}
      >
        Tabellen prüfen
      </Button>
      <Button 
        onClick={handleCreateTables} 
        disabled={isLoading || execSqlExists === false}
      >
        Alle Tabellen erstellen
      </Button>
    </CardFooter>
  );
};

export default DatabaseActions;
