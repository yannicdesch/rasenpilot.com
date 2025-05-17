
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createRequiredTables } from '@/lib/createTables';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const DatabaseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tablesStatus, setTablesStatus] = useState<Record<string, boolean | null>>({
    site_settings: null,
    profiles: null,
    page_views: null,
    events: null,
    blog_posts: null,
    pages: null,
    subscribers: null
  });
  
  const checkTables = async () => {
    setIsLoading(true);
    const tableStatus: Record<string, boolean> = {};
    
    try {
      for (const tableName of Object.keys(tablesStatus)) {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql: `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = '${tableName}'
          );`
        });
        
        tableStatus[tableName] = !error && data?.[0]?.exists;
      }
      
      setTablesStatus(tableStatus);
    } catch (error) {
      console.error('Error checking tables:', error);
      toast.error('Fehler beim Überprüfen der Tabellen');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTables = async () => {
    setIsLoading(true);
    try {
      await createRequiredTables();
      await checkTables();
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Datenbank-Einrichtung</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Hier können Sie prüfen, ob alle erforderlichen Tabellen in Ihrer Supabase-Datenbank existieren
          und bei Bedarf diese erstellen.
        </p>
        
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
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
          disabled={isLoading}
        >
          Alle Tabellen erstellen
        </Button>
      </CardFooter>
    </Card>
  );
};
