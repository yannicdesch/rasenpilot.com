
import React, { useState, useEffect } from 'react';
import { BarChart, Legend, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RefreshCw, BarChart3, Database, AlertTriangle, Loader2 } from 'lucide-react';
import { checkAnalyticsTables, createAnalyticsTables } from '@/lib/analytics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const SiteAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [metricType, setMetricType] = useState('all');
  const { analyticsData, isLoading, refreshAnalytics } = useAnalytics();
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [tableCreationError, setTableCreationError] = useState<string | null>(null);
  
  // Check if tables exist on component mount
  useEffect(() => {
    const checkTables = async () => {
      console.log("Checking analytics tables...");
      try {
        const exist = await checkAnalyticsTables();
        console.log("Tables exist?", exist);
        setTablesExist(exist);
      } catch (error) {
        console.error("Error checking tables:", error);
        setTablesExist(false);
      }
    };
    
    checkTables();
  }, []);
  
  // Handle creating tables
  const handleCreateTables = async () => {
    console.log('Creating analytics tables...');
    setIsCreatingTables(true);
    setTableCreationError(null);
    
    try {
      // Call the improved createAnalyticsTables function
      const success = await createAnalyticsTables();
      
      console.log('Table creation result:', success);
      
      // Update UI based on result
      if (success) {
        setTablesExist(true);
        toast.success('Tabellen wurden erfolgreich erstellt', {
          description: 'Die Tabellen "page_views" und "events" wurden in der Datenbank angelegt.'
        });
        // Refresh analytics to show real data
        refreshAnalytics();
      } else {
        setTableCreationError('Die Tabellenerstellung ist fehlgeschlagen. Bitte überprüfen Sie die Konsolenausgabe für Details.');
        toast.error('Fehler beim Erstellen der Tabellen', {
          description: 'Die Tabellenerstellung scheint fehlgeschlagen zu sein. Bitte überprüfen Sie die Konsolenausgabe für Details.'
        });
      }
    } catch (error: any) {
      console.error('Error creating tables:', error);
      setTableCreationError(error.message || 'Ein unerwarteter Fehler ist aufgetreten');
      toast.error('Fehler beim Erstellen der Tabellen', {
        description: 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setIsCreatingTables(false);
    }
  };
  
  // Select data based on timeframe
  const chartData = timeFrame === 'daily' ? analyticsData.dailyVisitors : 
                    timeFrame === 'weekly' ? analyticsData.weeklyVisitors : analyticsData.monthlyVisitors;
  
  // Get summary statistics
  const totalVisits = analyticsData.totalVisits;
  const totalSignups = analyticsData.totalSignups;
  const conversionRate = analyticsData.conversionRate.toFixed(1);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Websiteanalysen
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAnalytics}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Täglich (letzte 7 Tage)</SelectItem>
              <SelectItem value="weekly">Wöchentlich (letzte 4 Wochen)</SelectItem>
              <SelectItem value="monthly">Monatlich (letztes halbes Jahr)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {tablesExist === false && (
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
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gesamtbesucher</CardTitle>
            <CardDescription>Im ausgewählten Zeitraum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Neue Anmeldungen</CardTitle>
            <CardDescription>Im ausgewählten Zeitraum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{totalSignups.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Konversionsrate</CardTitle>
            <CardDescription>Besucher zu Anmeldungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Besucherstatistik</CardTitle>
          <div className="flex justify-end">
            <Tabs 
              value={metricType} 
              onValueChange={setMetricType} 
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">Alle Daten</TabsTrigger>
                <TabsTrigger value="visitors">Nur Besucher</TabsTrigger>
                <TabsTrigger value="signups">Nur Anmeldungen</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-green-600">Analysedaten werden geladen...</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {(metricType === 'all' || metricType === 'visitors') && (
                    <Bar dataKey="visitors" name="Besucher" fill="#4ade80" />
                  )}
                  {(metricType === 'all' || metricType === 'signups') && (
                    <Bar dataKey="signups" name="Anmeldungen" fill="#2563eb" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
        {tablesExist === false && (
          <CardFooter className="bg-green-50 border-t border-green-100">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Hinweis:</span> Aktuell werden Beispieldaten angezeigt. 
              Um echte Analysedaten zu sammeln, erstellen Sie die erforderlichen Tabellen mit dem Button oben.
            </p>
          </CardFooter>
        )}
      </Card>
      
      <Card className="bg-green-50 p-6 border border-green-100">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg font-semibold text-green-800">Über diese Daten</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <p className="text-gray-700">
            Diese Statistiken zeigen die Besucherzahlen und Anmeldungen für Ihre Rasenpilot-Website. 
            Die Daten werden in Ihrer Supabase-Datenbank in den Tabellen <code>page_views</code> und <code>events</code> gespeichert.
            {!tablesExist && (
              <span className="block mt-2 text-amber-600">
                Hinweis: Aktuell werden Beispieldaten angezeigt, da die Analytiktabellen in der Datenbank fehlen.
                Klicken Sie auf "Tabellen jetzt erstellen", um die erforderlichen Tabellen anzulegen und mit der
                Erfassung echter Daten zu beginnen.
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAnalytics;
