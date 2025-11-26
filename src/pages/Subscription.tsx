import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, ExternalLink, ArrowLeft, Star, Users, RotateCcw, Shield } from 'lucide-react';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Subscription() {
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
        "🗓️ Ganzjahres-Pflegeplan mit saisonalen Empfehlungen",
        "💬 Unbegrenzte KI-Beratung für alle Rasenfragen",
        "☁️ Wetter-Alerts & automatische Pflegetipps",
        "📸 Fortschritts-Tracking mit Bildvergleich",
        "🔔 Email-Erinnerungen für wichtige Pflegetermine",
        "🎧 Priority Support & persönliche Beratung"
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
        "✅ Alle Features aus Monthly Premium",
        "💰 2 Monate gratis (€119.88 Wert für €99.00)",
        "⚡ Vorrangiger Support mit Express-Antworten",
        "🎯 Früher Zugang zu neuen KI-Features",
        "📅 Erweiterte saisonale Pflegepläne",
        "👨‍🌾 Persönliche Experten-Beratung bei Problemen"
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

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Wählen Sie Ihren Premium-Plan</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Unbegrenzte Analysen, KI-Beratung und personalisierte Pflegepläne
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

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <SubscriptionCard
              key={index}
              {...plan}
              userEmail={user?.email}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12 py-6 border-y border-border">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">4,8/5 bewertet</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold">23.847 Nutzer</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RotateCcw className="h-5 w-5 text-primary" />
            <span className="font-semibold">Jederzeit kündbar</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">30 Tage Geld-zurück-Garantie</span>
          </div>
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

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Häufig gestellte Fragen</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cancel">
              <AccordionTrigger>Kann ich jederzeit kündigen?</AccordionTrigger>
              <AccordionContent>
                Ja, Sie können Ihr Abonnement jederzeit über das Kundenportal mit nur einem Klick kündigen. 
                Es gibt keine versteckten Gebühren oder Kündigungsfristen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment">
              <AccordionTrigger>Wie läuft die Zahlung ab?</AccordionTrigger>
              <AccordionContent>
                Die Zahlung erfolgt sicher über Stripe, einen der führenden Zahlungsanbieter weltweit. 
                Sie können mit Kreditkarte, Apple Pay, Google Pay und weiteren Zahlungsmethoden bezahlen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="invoice">
              <AccordionTrigger>Bekomme ich eine Rechnung?</AccordionTrigger>
              <AccordionContent>
                Ja, Sie erhalten automatisch eine Rechnung per E-Mail nach jeder Zahlung. 
                Diese können Sie auch jederzeit im Kundenportal herunterladen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="guarantee">
              <AccordionTrigger>Gibt es eine Garantie?</AccordionTrigger>
              <AccordionContent>
                Ja, wir bieten eine 30-Tage-Geld-zurück-Garantie. Wenn Sie nicht zufrieden sind, 
                erstatten wir Ihnen den vollen Betrag ohne Nachfragen.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Legal Links */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/agb" className="hover:text-foreground transition-colors">AGB</a>
            <span>•</span>
            <a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</a>
            <span>•</span>
            <a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a>
          </div>
        </div>
      </div>
    </>
  );
}