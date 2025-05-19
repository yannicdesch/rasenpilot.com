
import React from 'react';
import { BarChart, Legend, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VisitorChartProps {
  chartData: { name: string; visitors: number; signups: number }[];
  metricType: string;
  setMetricType: (value: string) => void;
  isLoading: boolean;
  tablesExist: boolean | null;
}

const VisitorChart = ({ 
  chartData, 
  metricType, 
  setMetricType, 
  isLoading,
  tablesExist 
}: VisitorChartProps) => {
  return (
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
  );
};

export default VisitorChart;
