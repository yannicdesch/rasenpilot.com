
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsInfoCardProps {
  tablesExist: boolean | null;
}

const AnalyticsInfoCard = ({ tablesExist }: AnalyticsInfoCardProps) => {
  return (
    <Card className="bg-green-50 p-6 border border-green-100">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-lg font-semibold text-green-800">Über diese Daten</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <p className="text-gray-700">
          Diese Statistiken zeigen die Besucherzahlen und Anmeldungen für Ihre Rasenpilot-Website. 
          Die Daten werden in Ihrer Supabase-Datenbank in den Tabellen <code>page_views</code> und <code>events</code> gespeichert.
          {tablesExist === false && (
            <span className="block mt-2 text-amber-600">
              Hinweis: Aktuell werden Beispieldaten angezeigt, da die Analytiktabellen in der Datenbank fehlen.
              Klicken Sie auf "Tabellen jetzt erstellen", um die erforderlichen Tabellen anzulegen und mit der
              Erfassung echter Daten zu beginnen.
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnalyticsInfoCard;
