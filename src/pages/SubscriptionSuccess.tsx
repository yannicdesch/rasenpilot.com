import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const { checkSubscription, isPremium } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful payment
    const verifySubscription = async () => {
      setIsVerifying(true);
      // Wait a moment for Stripe to process the subscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkSubscription();
      setIsVerifying(false);
    };

    if (sessionId) {
      verifySubscription();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, checkSubscription]);

  return (
    <>
      <SEO 
        title="Zahlung erfolgreich - Rasenpilot"
        description="Ihre Premium-Mitgliedschaft wurde erfolgreich aktiviert. Entdecken Sie alle Premium-Features von Rasenpilot."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="shadow-2xl border-primary/20 bg-white/95 backdrop-blur">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                {isVerifying ? (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-primary" />
                )}
              </div>
              <CardTitle className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {isVerifying ? 'Verarbeitung...' : 'Zahlung erfolgreich!'}
              </CardTitle>
              <CardDescription className="text-lg font-body">
                {isVerifying 
                  ? 'Wir aktivieren gerade Ihre Premium-Mitgliedschaft'
                  : 'Willkommen bei Rasenpilot Premium!'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!isVerifying && (
                <>
                  <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-display font-bold text-lg text-primary">Premium aktiviert</h3>
                        <p className="text-sm font-body text-muted-foreground">
                          Sie haben jetzt Zugang zu allen Premium-Features
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-display font-semibold text-lg">Ihre neuen Premium-Vorteile:</h4>
                    <ul className="space-y-3 text-sm font-body">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Ganzjahres-Pflegeplan</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Unbegrenzte KI-Fragen</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Wetter-Alerts & Tipps</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Email-Erinnerungen</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Fortschritts-Tracking</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Priority Support</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link to="/premium-dashboard">
                      <Button className="w-full bg-gradient-to-r from-primary via-primary/90 to-accent hover:shadow-xl transition-all duration-300 py-6 text-base font-semibold">
                        Premium Dashboard öffnen
                      </Button>
                    </Link>
                    
                    <Link to="/lawn-analysis">
                      <Button variant="outline" className="w-full py-6 text-base font-semibold border-primary/20 hover:bg-primary/5">
                        Premium-Features nutzen
                      </Button>
                    </Link>
                    
                    <Link to="/subscription">
                      <Button variant="outline" className="w-full py-6 text-base font-semibold border-primary/20 hover:bg-primary/5">
                        Abonnement verwalten
                      </Button>
                    </Link>
                    
                    <Link to="/">
                      <Button variant="ghost" className="w-full py-6 text-base font-semibold hover:bg-primary/5">
                        Zur Startseite
                      </Button>
                    </Link>
                  </div>

                  {sessionId && (
                    <div className="text-xs text-gray-500 text-center">
                      Session ID: {sessionId.substring(0, 20)}...
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubscriptionSuccess;