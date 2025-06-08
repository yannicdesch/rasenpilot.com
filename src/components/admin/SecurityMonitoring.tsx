
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, RefreshCw, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface SecurityEvent {
  id: string;
  category: string;
  action: string;
  label: string;
  value: string | null;
  timestamp: string;
}

const SecurityMonitoring: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const { data: securityEvents, isLoading, refetch } = useQuery({
    queryKey: ['security-events', timeRange],
    queryFn: async () => {
      const timeRanges = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720
      };

      const hoursBack = timeRanges[timeRange];
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('category', 'security')
        .gte('timestamp', since)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching security events:', error);
        throw error;
      }

      return data as SecurityEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getEventSeverity = (action: string): 'low' | 'medium' | 'high' => {
    const highSeverity = ['admin_login_failed', 'unauthorized_admin_access_attempt', 'admin_validation_error'];
    const mediumSeverity = ['admin_login_attempt', 'admin_access_denied'];
    
    if (highSeverity.includes(action)) return 'high';
    if (mediumSeverity.includes(action)) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getActionDisplayName = (action: string): string => {
    const actionNames: Record<string, string> = {
      'admin_login_attempt': 'Admin-Anmeldungsversuch',
      'admin_login_success': 'Admin-Anmeldung erfolgreich',
      'admin_login_failed': 'Admin-Anmeldung fehlgeschlagen',
      'admin_access_granted': 'Admin-Zugriff gewährt',
      'admin_access_denied': 'Admin-Zugriff verweigert',
      'admin_validation_error': 'Admin-Validierungsfehler',
      'unauthorized_admin_access_attempt': 'Unbefugter Admin-Zugriffsversuch',
      'secure_image_upload': 'Sichere Bild-Upload',
    };
    
    return actionNames[action] || action;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventCounts = () => {
    if (!securityEvents) return { total: 0, high: 0, medium: 0, low: 0 };
    
    return securityEvents.reduce((acc, event) => {
      const severity = getEventSeverity(event.action);
      acc.total++;
      acc[severity]++;
      return acc;
    }, { total: 0, high: 0, medium: 0, low: 0 });
  };

  const eventCounts = getEventCounts();

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Sicherheitsüberwachung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{eventCounts.total}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{eventCounts.high}</div>
              <div className="text-sm text-red-600">Hoch</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{eventCounts.medium}</div>
              <div className="text-sm text-yellow-600">Mittel</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{eventCounts.low}</div>
              <div className="text-sm text-green-600">Niedrig</div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Zeitraum:</span>
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '1h' ? '1 Stunde' : 
                 range === '24h' ? '24 Stunden' : 
                 range === '7d' ? '7 Tage' : '30 Tage'}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Sicherheitsereignisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Laden...</span>
            </div>
          ) : securityEvents && securityEvents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {securityEvents.map((event) => {
                const severity = getEventSeverity(event.action);
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {severity === 'high' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {getActionDisplayName(event.action)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Benutzer: {event.label}
                          </p>
                          {event.value && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer">Details anzeigen</summary>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(JSON.parse(event.value), null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getSeverityColor(severity)}>
                            {severity === 'high' ? 'Hoch' : severity === 'medium' ? 'Mittel' : 'Niedrig'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Keine Sicherheitsereignisse im gewählten Zeitraum gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {eventCounts.high > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Sicherheitswarnung:</strong> Es wurden {eventCounts.high} Sicherheitsereignisse mit hohem Risiko erkannt. 
            Bitte überprüfen Sie die Details und erwägen Sie zusätzliche Sicherheitsmaßnahmen.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecurityMonitoring;
