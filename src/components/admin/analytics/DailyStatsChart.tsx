import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DailyStats } from '@/hooks/useAnalytics';

interface DailyStatsChartProps {
  dailyStats: DailyStats[];
}

const DailyStatsChart = ({ dailyStats }: DailyStatsChartProps) => {
  // Format data for chart display
  const chartData = dailyStats.map(stat => ({
    ...stat,
    formattedDate: new Date(stat.date).toLocaleDateString('de-DE', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  const totalToday = dailyStats[dailyStats.length - 1];
  const totalYesterday = dailyStats[dailyStats.length - 2];
  const avgPageViews = dailyStats.reduce((sum, day) => sum + day.pageViews, 0) / dailyStats.length;

  return (
    <div className="space-y-6">
      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Heute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalToday?.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">Seitenaufrufe</p>
            <div className="text-sm text-muted-foreground">
              {totalToday?.events || 0} Events
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gestern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalYesterday?.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">Seitenaufrufe</p>
            <div className="text-sm text-muted-foreground">
              {totalYesterday?.events || 0} Events
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">30-Tage Durchschnitt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgPageViews)}</div>
            <p className="text-xs text-muted-foreground">Ø Seitenaufrufe/Tag</p>
            <div className="text-sm text-muted-foreground">
              {Math.round(dailyStats.reduce((sum, day) => sum + day.events, 0) / dailyStats.length)} Ø Events
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Page Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tägliche Seitenaufrufe (30 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return new Date(payload[0].payload.date).toLocaleDateString('de-DE', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    });
                  }
                  return label;
                }}
              />
              <Bar dataKey="pageViews" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Events Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tägliche Events Trend (30 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return new Date(payload[0].payload.date).toLocaleDateString('de-DE', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    });
                  }
                  return label;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Wochenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[0, 1, 2, 3].map(weekOffset => {
              const weekStart = dailyStats.length - 7 - (weekOffset * 7);
              const weekEnd = dailyStats.length - (weekOffset * 7);
              const weekData = dailyStats.slice(Math.max(0, weekStart), weekEnd);
              
              if (weekData.length === 0) return null;
              
              const weekTotal = weekData.reduce((sum, day) => sum + day.pageViews, 0);
              const weekEvents = weekData.reduce((sum, day) => sum + day.events, 0);
              const startDate = new Date(weekData[0]?.date);
              const endDate = new Date(weekData[weekData.length - 1]?.date);
              
              return (
                <div key={weekOffset} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {startDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} - {' '}
                      {endDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {weekOffset === 0 ? 'Diese Woche' : `Vor ${weekOffset + 1} Woche${weekOffset > 0 ? 'n' : ''}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{weekTotal} Aufrufe</div>
                    <div className="text-sm text-muted-foreground">{weekEvents} Events</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyStatsChart;