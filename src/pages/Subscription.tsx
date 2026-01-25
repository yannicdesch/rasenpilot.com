import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCcw, ExternalLink, ArrowLeft, Star, Users, RotateCcw, Shield, 
  Clock, CheckCircle, Sparkles, Zap, Award, Lock, CreditCard, Leaf,
  TrendingUp, Calendar, MessageSquare, Bell, Camera
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrialBadge } from '@/components/subscription/TrialBadge';
import { useToast } from '@/hooks/use-toast';

export default function Subscription() {
  const [user, setUser] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, loading, checkSubscription, openCustomerPortal, isSubscribed, subscriptionTier, isTrial, trialEnd } = useSubscription();

  const ref = searchParams.get('ref');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubscribe = async (priceType: 'monthly' | 'yearly') => {
    setLoadingPlan(priceType);
    try {
      const response = await fetch(`https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ'
        },
        body: JSON.stringify({
          priceType,
          email: user?.email
        })
      });

      const result = await response.text();
      if (!response.ok) throw new Error(result);
      
      const data = JSON.parse(result);
      if (!data?.url) throw new Error('Keine Checkout-URL erhalten');
      
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Checkout konnte nicht gestartet werden",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const outcomes = [
    { icon: TrendingUp, text: "Sichtbare Ergebnisse in 4 Wochen" },
    { icon: Leaf, text: "Weniger Unkraut, dichter Rasen" },
    { icon: Award, text: "Nachbarn fragen nach Ihrem Geheimnis" },
  ];

  return (
    <>
      <SEO 
        title="Premium Abo - Der perfekte Rasen wartet | Rasenpilot"
        description="7 Tage kostenlos testen. Unbegrenzte KI-Analysen, personalisierte Pflegepläne und Experten-Support. Ab €9,99/Monat. Jederzeit kündbar."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-transparent to-green-600/10" />
          <div className="container mx-auto px-4 pt-8 pb-12 max-w-6xl relative">
            
            {ref === 'analysis' && (
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Analyse
              </Button>
            )}

            {/* Headline - Outcome focused */}
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                7 Tage kostenlos testen
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-gray-900">
                Der <span className="text-green-600">perfekte Rasen</span>
                <br className="hidden sm:block" /> wartet auf Sie
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Schließen Sie sich <span className="font-semibold text-green-700">23.847+ Gartenbesitzern</span> an, 
                die ihren Rasen mit Rasenpilot Premium verwandelt haben.
              </p>

              {/* Outcome Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-green-100">
                    <outcome.icon className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{outcome.text}</span>
                  </div>
                ))}
              </div>

              {isSubscribed && (
                <div className="mb-6 flex flex-col items-center gap-2">
                  <Badge className="bg-green-600 text-white text-base px-5 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Premium Mitglied - {subscriptionTier}
                  </Badge>
                  <TrialBadge isTrial={isTrial} trialEnd={trialEnd} />
                  {subscription.subscription_end && (
                    <p className="text-sm text-gray-500 mt-1">
                      {isTrial ? 'Testphase endet am' : 'Verlängert sich am'}: {new Date(subscription.subscription_end).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 max-w-5xl -mt-4">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Monthly Card */}
            <Card className="relative bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-display font-bold text-gray-900">Monatlich</CardTitle>
                <CardDescription className="text-gray-600">Flexibel & risikolos starten</CardDescription>
                
                <div className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display font-bold text-gray-900">€9</span>
                    <span className="text-2xl font-display font-bold text-gray-900">,99</span>
                    <span className="text-gray-500 ml-1">/Monat</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    7 Tage kostenlos, dann €9,99/Monat
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {[
                    { icon: Camera, text: "Unbegrenzte Rasen-Analysen" },
                    { icon: Calendar, text: "Ganzjahres-Pflegeplan" },
                    { icon: MessageSquare, text: "Unbegrenzte KI-Beratung" },
                    { icon: Bell, text: "Wetter-Alerts & Erinnerungen" },
                    { icon: TrendingUp, text: "Fortschritts-Tracking" },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full py-6 text-base font-semibold"
                  variant="outline"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={loadingPlan === 'monthly' || (isSubscribed && subscriptionTier === "Monthly")}
                >
                  {loadingPlan === 'monthly' ? (
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {isSubscribed && subscriptionTier === "Monthly" 
                    ? "✓ Aktueller Plan" 
                    : "7 Tage kostenlos starten"}
                </Button>
              </CardFooter>
            </Card>

            {/* Yearly Card - Highlighted */}
            <Card className="relative bg-gradient-to-br from-green-50 to-white border-2 border-green-500 shadow-xl hover:shadow-2xl transition-all duration-300 scale-[1.02]">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-1.5 text-sm font-bold shadow-lg">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-300 text-yellow-300" />
                  BELIEBTESTE WAHL
                </Badge>
              </div>

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-xl font-display font-bold text-gray-900">Jährlich</CardTitle>
                <CardDescription className="text-gray-600">Beste Ersparnis für ernsthafte Gärtner</CardDescription>
                
                <div className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display font-bold text-green-700">€99</span>
                    <span className="text-gray-500 ml-1">/Jahr</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">€119,88</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                      2 Monate GRATIS
                    </Badge>
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-2">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    7 Tage kostenlos, dann nur €8,25/Monat
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {[
                    { icon: CheckCircle, text: "Alles aus dem Monatsplan", highlight: false },
                    { icon: Zap, text: "Vorrangiger Express-Support", highlight: true },
                    { icon: Sparkles, text: "Früher Zugang zu neuen Features", highlight: true },
                    { icon: Award, text: "Persönliche Experten-Beratung", highlight: true },
                    { icon: TrendingUp, text: "Erweiterte Saisonpläne", highlight: true },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.highlight ? 'bg-green-600' : 'bg-green-100'}`}>
                        <CheckCircle className={`h-3.5 w-3.5 ${feature.highlight ? 'text-white' : 'text-green-600'}`} />
                      </div>
                      <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full py-6 text-base font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleSubscribe('yearly')}
                  disabled={loadingPlan === 'yearly' || (isSubscribed && subscriptionTier === "Yearly")}
                >
                  {loadingPlan === 'yearly' ? (
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {isSubscribed && subscriptionTier === "Yearly" 
                    ? "✓ Aktueller Plan" 
                    : "7 Tage kostenlos starten → €20 sparen"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Risk Reversal */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Sichere Zahlung via Stripe · Jederzeit kündbar · 30 Tage Geld-zurück-Garantie
            </p>
          </div>
        </div>

        {/* Trust Section */}
        <div className="container mx-auto px-4 max-w-5xl mt-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-display font-bold text-center text-gray-900 mb-8">
              Warum 23.847+ Gartenbesitzer Rasenpilot vertrauen
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="font-bold text-2xl text-gray-900">4,8/5</div>
                <div className="text-sm text-gray-500">Bewertung</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-bold text-2xl text-gray-900">23.847</div>
                <div className="text-sm text-gray-500">Zufriedene Nutzer</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-bold text-2xl text-gray-900">1 Klick</div>
                <div className="text-sm text-gray-500">Kündigung</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-bold text-2xl text-gray-900">30 Tage</div>
                <div className="text-sm text-gray-500">Geld-zurück</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof - Testimonial */}
        <div className="container mx-auto px-4 max-w-3xl mt-12">
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "Nach nur 3 Wochen mit Rasenpilot sieht mein Rasen aus wie nie zuvor. 
                Die personalisierten Tipps haben wirklich den Unterschied gemacht. 
                Meine Nachbarn fragen mich ständig nach meinem Geheimnis!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Markus K.</div>
                  <div className="text-sm text-gray-500">Premium-Mitglied seit 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manage Subscription (existing subscribers) */}
        {isSubscribed && (
          <div className="container mx-auto px-4 max-w-md mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Abonnement verwalten</CardTitle>
                <CardDescription>
                  Plan ändern, Zahlungsmethode aktualisieren oder kündigen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={checkSubscription}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Status aktualisieren
                </Button>
                
                <Button onClick={openCustomerPortal} className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abonnement verwalten
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="container mx-auto px-4 max-w-3xl mt-16 pb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8 text-gray-900">
            Häufig gestellte Fragen
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="trial">
              <AccordionTrigger className="text-left">Was passiert nach den 7 kostenlosen Tagen?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Nach der Testphase wird Ihr gewählter Plan automatisch aktiviert. Sie werden 
                <strong> 2 Tage vorher per E-Mail erinnert</strong>. Sie können jederzeit mit einem 
                Klick kündigen - es entstehen keine Kosten, wenn Sie vor Ende der Testphase kündigen.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="cancel">
              <AccordionTrigger className="text-left">Kann ich wirklich jederzeit kündigen?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Ja, absolut. Die Kündigung dauert nur 30 Sekunden über unser Kundenportal. 
                <strong> Keine Anrufe, keine E-Mails, keine Kündigungsfristen</strong>. 
                Sie behalten Zugang bis zum Ende der bezahlten Periode.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="payment">
              <AccordionTrigger className="text-left">Wie sicher ist die Zahlung?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Wir nutzen <strong>Stripe</strong>, den weltweit führenden Zahlungsanbieter. 
                Ihre Daten sind mit modernster Verschlüsselung geschützt. 
                Akzeptierte Zahlungsmethoden: Kreditkarte, Apple Pay, Google Pay, SEPA-Lastschrift.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="guarantee">
              <AccordionTrigger className="text-left">Was ist die 30-Tage-Garantie?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Wenn Sie innerhalb der ersten 30 Tage nicht zufrieden sind, erstatten wir 
                <strong> 100% des Kaufpreises - ohne Wenn und Aber</strong>. 
                Eine kurze E-Mail genügt.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="account">
              <AccordionTrigger className="text-left">Brauche ich einen Account?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <strong>Nein, Sie können sofort starten!</strong> Schließen Sie einfach den Checkout ab - 
                Ihr Account wird automatisch mit der E-Mail erstellt, die Sie bei Stripe angeben. 
                Sie erhalten dann eine E-Mail mit Ihren Zugangsdaten.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Payment Methods */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 mb-4">Sichere Zahlung via</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Kreditkarte</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                <span className="text-sm font-medium">Apple Pay</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                <span className="text-sm font-medium">Google Pay</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                <span className="text-sm font-medium">SEPA</span>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-10 text-center text-sm text-gray-500">
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/agb" className="hover:text-green-600 transition-colors">AGB</a>
              <span>•</span>
              <a href="/datenschutz" className="hover:text-green-600 transition-colors">Datenschutz</a>
              <span>•</span>
              <a href="/impressum" className="hover:text-green-600 transition-colors">Impressum</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
