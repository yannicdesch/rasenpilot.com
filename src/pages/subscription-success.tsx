import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import SEO from '@/components/SEO';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    // Refresh subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <>
      <SEO 
        title="Subscription Successful - Welcome to Premium"
        description="Your subscription has been successfully activated. Welcome to premium membership with unlimited access to all features."
      />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Card className="text-center border-primary/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 relative">
              <div className="absolute inset-0 animate-ping opacity-20">
                <CheckCircle className="h-20 w-20 text-primary mx-auto" />
              </div>
              <CheckCircle className="h-20 w-20 text-primary mx-auto" />
            </div>
            <CardTitle className="text-4xl mb-2">🎉 Willkommen bei Rasenpilot Premium!</CardTitle>
            <CardDescription className="text-lg">
              Ihre Premium-Mitgliedschaft wurde erfolgreich aktiviert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
              <p className="text-lg font-medium mb-4">
                Sie haben jetzt Zugriff auf alle Premium-Features:
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Unbegrenzte Analysen</p>
                    <p className="text-xs text-muted-foreground">Analysieren Sie Ihren Rasen so oft Sie möchten</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Pflegepläne</p>
                    <p className="text-xs text-muted-foreground">Ganzjährige personalisierte Empfehlungen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Wetter-Alerts</p>
                    <p className="text-xs text-muted-foreground">Automatische Pflegetipps basierend auf Wetter</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="marketing" 
                  checked={marketingConsent}
                  onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                />
                <Label htmlFor="marketing" className="text-sm cursor-pointer">
                  Ich möchte Tipps, Angebote und Neuigkeiten per E-Mail erhalten (optional)
                </Label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => navigate('/lawn-analysis')} 
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Zur Analyse starten
              </Button>
              <Button 
                onClick={() => navigate('/premium-dashboard')} 
                variant="outline"
                size="lg"
              >
                Zum Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}