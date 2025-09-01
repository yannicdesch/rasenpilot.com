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
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="shadow-lg border-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                {isVerifying ? (
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
              <CardTitle className="text-2xl text-green-800">
                {isVerifying ? 'Verarbeitung...' : 'Zahlung erfolgreich!'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isVerifying 
                  ? 'Wir aktivieren gerade Ihre Premium-Mitgliedschaft'
                  : 'Willkommen bei Rasenpilot Premium!'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!isVerifying && (
                <>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Crown className="h-6 w-6 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">Premium aktiviert</h3>
                        <p className="text-sm text-yellow-700">
                          Sie haben jetzt Zugang zu allen Premium-Features
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Ihre neuen Premium-Vorteile:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Ganzjahres-Pflegeplan
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unbegrenzte KI-Fragen
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Wetter-Alerts & Tipps
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Email-Erinnerungen
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Fortschritts-Tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Priority Support
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Link to="/lawn-analysis">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Jetzt Premium-Features nutzen
                      </Button>
                    </Link>
                    
                    <Link to="/subscription">
                      <Button variant="outline" className="w-full">
                        Abonnement verwalten
                      </Button>
                    </Link>
                    
                    <Link to="/">
                      <Button variant="ghost" className="w-full">
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