import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, ExternalLink, ArrowLeft } from 'lucide-react';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

export default function Subscription() {
  const [guestEmail, setGuestEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscription, loading, checkSubscription, openCustomerPortal, isSubscribed, subscriptionTier } = useSubscription();

  const ref = searchParams.get('ref');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const subscriptionPlans = [
    {
      title: "Monatlich Premium",
      description: "Perfekt für den Einstieg",
      price: "€9.99",
      interval: "month",
      priceType: "monthly" as const,
      features: [
        "Detaillierte Rasen-Analyse mit Teilbewertungen",
        "Personalisierte 7-Tage Aktionspläne",
        "PDF-Download für alle Pflegepläne",
        "Unbegrenzte weitere Analysen",
        "Wetter-basierte Empfehlungen",
        "Premium Support"
      ],
      isCurrentPlan: isSubscribed && subscriptionTier === "Monthly",
      isPopular: false
    },
    {
      title: "Jährlich Premium",
      description: "Bester Wert - Sparen Sie €20!",
      price: "€99.00",
      interval: "year",
      priceType: "yearly" as const,
      features: [
        "Alles aus Monthly Premium",
        "2 Monate gratis",
        "Vorrangiger Support",
        "Früher Zugang zu neuen Features",
        "Saison-spezifische Pflegepläne",
        "Experten-Beratung bei Problemen"
      ],
      isCurrentPlan: isSubscribed && subscriptionTier === "Yearly",
      isPopular: true
    }
  ];

  return (
    <>
      <SEO 
        title="Premium Subscription - Rasenpilot"
        description="Entdecken Sie die Premium-Features von Rasenpilot. Detaillierte Analysen, personalisierte Pflegepläne und unbegrenzte Rasen-Analysen ab €9,99/Monat."
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {ref === 'analysis' && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Analyse
            </Button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Premium Features freischalten</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Erhalten Sie Zugang zu detaillierten Analysen und personalisierten Pflegeplänen
          </p>
          
          {isSubscribed && (
            <div className="mb-6">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-4 py-2">
                ✓ Premium Mitglied - {subscriptionTier} Plan
              </Badge>
              {subscription.subscription_end && (
                <p className="text-sm text-muted-foreground mt-2">
                  Verlängert sich am: {new Date(subscription.subscription_end).toLocaleDateString('de-DE')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Guest Email Input */}
        {!user && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle>E-Mail für Checkout</CardTitle>
              <CardDescription>
                Geben Sie Ihre E-Mail-Adresse ein, um fortzufahren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="guest-email">E-Mail-Adresse</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="ihre@email.de"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subscriptionPlans.map((plan, index) => (
            <SubscriptionCard
              key={index}
              {...plan}
              userEmail={user?.email || guestEmail}
            />
          ))}
        </div>

        {/* Manage Subscription */}
        {isSubscribed && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Abonnement verwalten</CardTitle>
              <CardDescription>
                Verwalten Sie Ihr Abonnement, ändern Sie Ihre Zahlungsmethode oder kündigen Sie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={checkSubscription}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Status aktualisieren
              </Button>
              
              <Button
                onClick={openCustomerPortal}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abonnement verwalten
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Warum Premium wählen?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="font-semibold mb-2">Detaillierte Analysen</h3>
              <p className="text-sm text-muted-foreground">
                Erhalten Sie Teilbewertungen für Dichte, Feuchtigkeit, Boden und mehr
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold mb-2">Personalisierte Pläne</h3>
              <p className="text-sm text-muted-foreground">
                7-Tage Aktionspläne, abgestimmt auf Ihren Rasen und das aktuelle Wetter
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">♾️</span>
              </div>
              <h3 className="font-semibold mb-2">Unbegrenzte Nutzung</h3>
              <p className="text-sm text-muted-foreground">
                Analysieren Sie Ihren Rasen so oft Sie möchten, das ganze Jahr über
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}