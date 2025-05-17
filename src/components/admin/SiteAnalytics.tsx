
import React, { useState } from 'react';
import { BarChart, Legend, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RefreshCw, BarChart3 } from 'lucide-react';

const SiteAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [metricType, setMetricType] = useState('all');
  const { analyticsData, isLoading, refreshAnalytics } = useAnalytics();
  
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
      </Card>
      
      <Card className="bg-green-50 p-6 border border-green-100">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg font-semibold text-green-800">Über diese Daten</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <p className="text-gray-700">
            Diese Statistiken zeigen die Besucherzahlen und Anmeldungen für Ihre Rasenpilot-Website. 
            Die Daten werden in Ihrer Supabase-Datenbank in den Tabellen <code>page_views</code> und <code>events</code> gespeichert.
            {!analyticsData.dailyVisitors.some(d => d.visitors > 0) && (
              <span className="block mt-2 text-amber-600">
                Hinweis: Aktuell werden Beispieldaten angezeigt, da noch keine ausreichenden Analysedaten vorhanden sind.
                Beginnen Sie mit der Erfassung echter Daten, indem Sie die entsprechenden Tabellen in Supabase erstellen.
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAnalytics;
