import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, UserCheck, AlertTriangle } from 'lucide-react';

interface ConversionMetrics {
  totalPageViews: number;
  totalSignups: number;
  analysisJobsWithoutSignup: number;
  conversionRate: number;
  dropOffRate: number;
}

const ConversionDashboard = () => {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversionMetrics();
  }, []);

  const fetchConversionMetrics = async () => {
    try {
      // Get page views from last 7 days
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get signups from last 7 days  
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get analysis jobs without user_id (anonymous usage)
      const { data: anonymousJobs } = await supabase
        .from('analysis_jobs')
        .select('*')
        .is('user_id', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const totalPageViews = pageViews?.length || 0;
      const totalSignups = profiles?.length || 0;
      const analysisJobsWithoutSignup = anonymousJobs?.length || 0;
      
      const conversionRate = totalPageViews > 0 ? (totalSignups / totalPageViews) * 100 : 0;
      const dropOffRate = analysisJobsWithoutSignup > 0 ? (analysisJobsWithoutSignup / (analysisJobsWithoutSignup + totalSignups)) * 100 : 0;

      setMetrics({
        totalPageViews,
        totalSignups,
        analysisJobsWithoutSignup,
        conversionRate,
        dropOffRate
      });
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading conversion data...</div>;
  }

  if (!metrics) {
    return <div className="p-4">Error loading conversion data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Seitenaufrufe (7T)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPageViews}</div>
            <p className="text-xs text-muted-foreground">Letzte 7 Tage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Registrierungen (7T)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.totalSignups}</div>
            <p className="text-xs text-muted-foreground">Neue Nutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {metrics.conversionRate > 2 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              Konversionsrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversionRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Besucher zu Registrierungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Drop-Off Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.dropOffRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Analysen ohne Registrierung</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Insights</CardTitle>
          <CardDescription>
            Analyse der Nutzerkonversion und Optimierungsmöglichkeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {metrics.conversionRate < 1 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Kritisch niedrige Konversionsrate</h4>
                  <p className="text-sm text-red-700">
                    {metrics.conversionRate.toFixed(2)}% ist sehr niedrig. Typische Werte liegen bei 2-5%.
                  </p>
                </div>
              </div>
            )}

            {metrics.analysisJobsWithoutSignup > 10 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Gute Engagement-Rate</h4>
                  <p className="text-sm text-blue-700">
                    {metrics.analysisJobsWithoutSignup} kostenlose Analysen wurden durchgeführt. 
                    Das zeigt starkes Interesse - jetzt diese Nutzer zur Registrierung konvertieren.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Optimierungsempfehlungen für "Free Trial → Signup":</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• **Bessere Value Proposition nach der Analyse**</li>
                <li>• **Personalisierte Pflegepläne nur für registrierte Nutzer**</li>
                <li>• **E-Mail-Erinnerungen für Folgeanalysen anbieten**</li>
                <li>• **Zeige Verbesserung/Fortschritt nur nach Registrierung**</li>
                <li>• **Limited-Time Bonus für sofortige Registrierung**</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionDashboard;