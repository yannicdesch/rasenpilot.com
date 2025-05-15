
import React, { useState } from 'react';
import { BarChart, Legend, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data - in a real application, this would come from your analytics API
const dailyData = [
  { name: 'Mo', besucher: 240, anmeldungen: 20 },
  { name: 'Di', besucher: 300, anmeldungen: 25 },
  { name: 'Mi', besucher: 280, anmeldungen: 18 },
  { name: 'Do', besucher: 320, anmeldungen: 30 },
  { name: 'Fr', besucher: 400, anmeldungen: 45 },
  { name: 'Sa', besucher: 380, anmeldungen: 38 },
  { name: 'So', besucher: 290, anmeldungen: 22 },
];

const weeklyData = [
  { name: 'KW18', besucher: 1800, anmeldungen: 180 },
  { name: 'KW19', besucher: 2000, anmeldungen: 210 },
  { name: 'KW20', besucher: 2400, anmeldungen: 250 },
  { name: 'KW21', besucher: 1900, anmeldungen: 190 },
];

const monthlyData = [
  { name: 'Jan', besucher: 6500, anmeldungen: 650 },
  { name: 'Feb', besucher: 5800, anmeldungen: 580 },
  { name: 'Mär', besucher: 7800, anmeldungen: 780 },
  { name: 'Apr', besucher: 8900, anmeldungen: 890 },
  { name: 'Mai', besucher: 9500, anmeldungen: 950 },
];

const SiteAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [metricType, setMetricType] = useState('all');
  
  // Select data based on timeframe
  const chartData = timeFrame === 'daily' ? dailyData : 
                    timeFrame === 'weekly' ? weeklyData : monthlyData;
  
  // Calculate summary statistics
  const totalVisits = chartData.reduce((sum, item) => sum + item.besucher, 0);
  const totalSignups = chartData.reduce((sum, item) => sum + item.anmeldungen, 0);
  const conversionRate = ((totalSignups / totalVisits) * 100).toFixed(1);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800">Websiteanalysen</h2>
        <div className="flex gap-2">
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
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {(metricType === 'all' || metricType === 'visitors') && (
                  <Bar dataKey="besucher" name="Besucher" fill="#4ade80" />
                )}
                {(metricType === 'all' || metricType === 'signups') && (
                  <Bar dataKey="anmeldungen" name="Anmeldungen" fill="#2563eb" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-3">Über diese Daten</h3>
        <p className="text-gray-700">
          Diese Statistiken zeigen die Besucherzahlen und Anmeldungen für Ihre Rasenpilot-Website. 
          In einer vollständigen Implementierung können diese Daten aus Google Analytics, Matomo oder 
          einem eigenen Tracking-System stammen. Die hier gezeigten Daten sind Beispieldaten.
        </p>
      </div>
    </div>
  );
};

export default SiteAnalytics;
