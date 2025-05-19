
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticCardsProps {
  totalVisits: number;
  totalSignups: number;
  conversionRate: string;
}

const StatisticCards = ({ totalVisits, totalSignups, conversionRate }: StatisticCardsProps) => {
  return (
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
  );
};

export default StatisticCards;
