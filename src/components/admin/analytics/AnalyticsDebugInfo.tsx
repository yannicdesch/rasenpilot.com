
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalyticsDebugInfoProps {
  tablesExist: boolean | null;
  isLoading: boolean;
  error: string | null;
  analyticsData: any;
  supabaseConnectionStatus: string;
}

const AnalyticsDebugInfo = ({ 
  tablesExist, 
  isLoading, 
  error, 
  analyticsData,
  supabaseConnectionStatus 
}: AnalyticsDebugInfoProps) => {
  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Debug-Informationen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Lade-Status:</span>
            <Badge variant={isLoading ? "outline" : "secondary"}>
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Lädt...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Fertig
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Tabellen existieren:</span>
            <Badge variant={tablesExist === true ? "default" : tablesExist === false ? "destructive" : "outline"}>
              {tablesExist === true ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ja
                </>
              ) : tablesExist === false ? (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Nein
                </>
              ) : (
                "Unbekannt"
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Supabase-Verbindung:</span>
            <Badge variant={supabaseConnectionStatus === 'connected' ? "default" : "destructive"}>
              {supabaseConnectionStatus === 'connected' ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verbunden
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Fehler
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Daten vorhanden:</span>
            <Badge variant={analyticsData?.totalVisits > 0 ? "default" : "outline"}>
              {analyticsData?.totalVisits || 0} Besuche
            </Badge>
          </div>
        </div>
        
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Fehler:</strong> {error}
          </div>
        )}
        
        <div className="text-xs text-gray-600">
          <p>Falls die Statistiken nicht angezeigt werden:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Überprüfen Sie die Supabase-Verbindung</li>
            <li>Erstellen Sie die Analytics-Tabellen falls nötig</li>
            <li>Aktualisieren Sie die Seite</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDebugInfo;
