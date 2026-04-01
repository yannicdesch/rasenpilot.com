import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCcw, ExternalLink, ArrowLeft, Star, RotateCcw, Shield, 
  Clock, CheckCircle, Sparkles, Zap, Award, Lock, CreditCard, Leaf,
  TrendingUp, Calendar, MessageSquare, Camera, X, Crown, Headphones
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import MainNavigation from '@/components/MainNavigation';
import { TrialBadge } from '@/components/subscription/TrialBadge';
import { useToast } from '@/hooks/use-toast';
import { trackMetaViewContent, trackMetaInitiateCheckout, trackMetaStartTrial, trackMetaLead } from '@/lib/analytics/metaPixel';

const SeasonalBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('rasenpilot_seasonal_banner_dismissed') === 'true';
  });

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
      <p className="text-sm font-medium text-green-800">
        🌱 Frühjahrsaktion: Jetzt auf Premium upgraden und die beste Rasensaison starten!
      </p>
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem('rasenpilot_seasonal_banner_dismissed', 'true');
        }}
        className="ml-4 text-green-600 hover:text-green-800 flex-shrink-0"
        aria-label="Banner schließen"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function Subscription() {
  const [user, setUser] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, loading, checkSubscription, openCustomerPortal, isSubscribed, subscriptionTier, isTrial, trialEnd, planTier } = useSubscription();

  const ref = searchParams.get('ref');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    trackMetaViewContent('Subscription Page', 'subscription', 9.99, 'EUR');
  }, []);

  const handleSubscribe = async (priceType: string) => {
    setLoadingPlan(priceType);
    
    const valueMap: Record<string, number> = {
      premium_monthly: 9.99, premium_yearly: 79.99,
      pro_monthly: 19.99, pro_yearly: 159.99,
    };
    trackMetaInitiateCheckout(valueMap[priceType] || 9.99, 'EUR', priceType);
    trackMetaStartTrial(0, 'EUR', `Trial ${priceType}`);
    trackMetaLead(priceType);
    
    try {
      const response = await fetch(`https://ugaxwcslhoppflrbuwxv.supabase.co/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ'
        },
        body: JSON.stringify({ priceType, email: user?.email })
      });

      const result = await response.text();
      const data = JSON.parse(result);
      
      if (!response.ok) {
        if (data.error === 'already_subscribed') {
          toast({
            title: "Bereits abonniert",
            description: data.message || "Diese E-Mail hat bereits ein aktives Abo.",
            variant: "default",
          });
          navigate('/auth?redirect=/subscription/manage');
          return;
        }
        throw new Error(data.message || data.error || 'Checkout fehlgeschlagen');
      }
      
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

  const freeFeatures = [
    { icon: Camera, text: "1 Rasenanalyse" },
    { icon: TrendingUp, text: "Basis-Score" },
    { icon: Leaf, text: "Krankheitserkennung" },
  ];

  const premiumFeatures = [
    { icon: Camera, text: "Unbegrenzte Analysen" },
    { icon: Calendar, text: "Pflegekalender" },
    { icon: Sparkles, text: "Wetter-Tipps" },
    { icon: TrendingUp, text: "Rasen-Verlauf" },
    { icon: Award, text: "PLZ-Ranking" },
    { icon: MessageSquare, text: "KI-Chat" },
  ];

  const proFeatures = [
    { icon: CheckCircle, text: "Alles aus Premium" },
    { icon: Leaf, text: "3 Rasenflächen" },
    { icon: Crown, text: "Experten-Check" },
    { icon: Headphones, text: "Priorität-Support (2h)" },
    { icon: Zap, text: "Early Access" },
  ];

  const isCurrentPlan = (tier: string) => {
    if (!isSubscribed) return tier === 'free';
    const t = subscriptionTier?.toLowerCase() || '';
    if (tier === 'premium') return t.startsWith('premium') || t === 'monthly' || t === 'yearly';
    if (tier === 'pro') return t.startsWith('pro');
    return false;
  };

  return (
    <>
      <SEO 
        title="Rasenpilot Preise — Premium ab 9,99€/Monat | Pro ab 19,99€/Monat"
        description="Wähle deinen Plan: Kostenlos, Premium oder Pro. 7 Tage kostenlos testen. Unbegrenzte KI-Rasenanalysen, Pflegekalender und mehr."
        canonical="/subscription"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30">
        <MainNavigation />

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-transparent to-green-600/10" />
          <div className="container mx-auto px-4 pt-8 pb-6 max-w-6xl relative">
            {ref === 'analysis' && (
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" /> Zurück zur Analyse
              </Button>
            )}

            <div className="text-center mb-6">
              <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> 7 Tage kostenlos testen
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-gray-900">
                Wähle deinen <span className="text-green-600">Plan</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Starte kostenlos und upgrade, wenn du bereit bist für den perfekten Rasen.
              </p>

              {isSubscribed && (
                <div className="mb-4 flex flex-col items-center gap-2">
                  <Badge className={`text-white text-base px-5 py-2 ${planTier === 'pro' ? 'bg-amber-500' : 'bg-green-600'}`}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {planTier === 'pro' ? '⭐ Pro Mitglied' : 'Premium Mitglied'}
                  </Badge>
                  <TrialBadge isTrial={isTrial} trialEnd={trialEnd} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Billing Toggle & Seasonal Banner */}
        <div className="container mx-auto px-4 max-w-6xl -mt-2">
          <SeasonalBanner />

          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monatlich
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingInterval === 'yearly'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Jährlich
                {billingInterval === 'yearly' && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">Spare 2 Monate 🎉</Badge>
                )}
              </button>
            </div>
          </div>

          {/* 3-Tier Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* FREE */}
            <Card className="relative bg-white border-2 border-gray-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-display font-bold text-gray-900">Kostenlos</CardTitle>
                <CardDescription className="text-gray-600">Zum Ausprobieren</CardDescription>
                <div className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display font-bold text-gray-900">€0</span>
                    <span className="text-gray-500 ml-1">/für immer</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {freeFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-700">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full py-6 text-base"
                  variant="outline"
                  onClick={() => navigate('/lawn-analysis')}
                  disabled={isCurrentPlan('free')}
                >
                  {isCurrentPlan('free') ? '✓ Aktueller Plan' : 'Kostenlos starten'}
                </Button>
              </CardFooter>
            </Card>

            {/* PREMIUM — highlighted */}
            <Card className="relative bg-gradient-to-br from-green-50 to-white border-2 border-green-500 shadow-xl scale-[1.02]">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-1.5 text-sm font-bold shadow-lg">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-300 text-yellow-300" /> BELIEBTESTE WAHL
                </Badge>
              </div>

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-xl font-display font-bold text-gray-900">Premium</CardTitle>
                <CardDescription className="text-gray-600">Für engagierte Gartenbesitzer</CardDescription>
                <div className="pt-4">
                  {billingInterval === 'monthly' ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-display font-bold text-green-700">€9</span>
                        <span className="text-2xl font-display font-bold text-green-700">,99</span>
                        <span className="text-gray-500 ml-1">/Monat</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />7 Tage kostenlos testen
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-display font-bold text-green-700">€79</span>
                        <span className="text-2xl font-display font-bold text-green-700">,99</span>
                        <span className="text-gray-500 ml-1">/Jahr</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 line-through">€119,88</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">2 Monate GRATIS</Badge>
                      </div>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />7 Tage kostenlos, dann €6,67/Monat
                      </p>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {premiumFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full py-6 text-base font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                  onClick={() => handleSubscribe(billingInterval === 'monthly' ? 'premium_monthly' : 'premium_yearly')}
                  disabled={!!loadingPlan || isCurrentPlan('premium')}
                >
                  {loadingPlan?.startsWith('premium') && <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />}
                  {isCurrentPlan('premium') ? '✓ Aktueller Plan' : '7 Tage kostenlos testen'}
                </Button>
              </CardFooter>
            </Card>

            {/* PRO */}
            <Card className="relative bg-gradient-to-br from-amber-50 to-white border-2 border-amber-400 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-1.5 text-sm font-bold shadow-lg">
                  ⭐ FÜR PERFEKTIONISTEN
                </Badge>
              </div>

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-xl font-display font-bold text-gray-900">Pro</CardTitle>
                <CardDescription className="text-gray-600">Maximale Rasenpflege</CardDescription>
                <div className="pt-4">
                  {billingInterval === 'monthly' ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-display font-bold text-amber-600">€19</span>
                        <span className="text-2xl font-display font-bold text-amber-600">,99</span>
                        <span className="text-gray-500 ml-1">/Monat</span>
                      </div>
                      <p className="text-sm text-amber-600 font-medium mt-1">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />7 Tage kostenlos testen
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-display font-bold text-amber-600">€159</span>
                        <span className="text-2xl font-display font-bold text-amber-600">,99</span>
                        <span className="text-gray-500 ml-1">/Jahr</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 line-through">€239,88</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">2 Monate GRATIS</Badge>
                      </div>
                      <p className="text-sm text-amber-600 font-medium mt-1">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />7 Tage kostenlos, dann €13,33/Monat
                      </p>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {proFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <CheckCircle className={`h-3.5 w-3.5 ${i === 0 ? 'text-green-600' : 'text-amber-600'}`} />
                      </div>
                      <span className={`text-sm ${i === 0 ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full py-6 text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg text-white"
                  onClick={() => handleSubscribe(billingInterval === 'monthly' ? 'pro_monthly' : 'pro_yearly')}
                  disabled={!!loadingPlan || isCurrentPlan('pro')}
                >
                  {loadingPlan?.startsWith('pro') && <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />}
                  {isCurrentPlan('pro') ? '✓ Aktueller Plan' : '7 Tage kostenlos testen'}
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

        {/* Manage Subscription */}
        {isSubscribed && (
          <div className="container mx-auto px-4 max-w-md mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Abonnement verwalten</CardTitle>
                <CardDescription>Plan ändern, Zahlungsmethode aktualisieren oder kündigen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={checkSubscription} variant="outline" className="w-full" disabled={loading}>
                  <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Status aktualisieren
                </Button>
                <Button onClick={openCustomerPortal} className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" /> Abonnement verwalten
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ */}
        <div className="container mx-auto px-4 max-w-3xl mt-16 pb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8 text-gray-900">
            Häufig gestellte Fragen
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="trial">
              <AccordionTrigger className="text-left">Was passiert nach den 7 kostenlosen Tagen?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Nach der Testphase wird dein gewählter Plan automatisch aktiviert. Du wirst 
                <strong> 2 Tage vorher per E-Mail erinnert</strong>. Du kannst jederzeit mit einem 
                Klick kündigen — es entstehen keine Kosten, wenn du vor Ende der Testphase kündigst.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="cancel">
              <AccordionTrigger className="text-left">Kann ich wirklich jederzeit kündigen?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Ja, absolut. Die Kündigung dauert nur 30 Sekunden über unser Kundenportal. 
                <strong> Keine Anrufe, keine E-Mails, keine Kündigungsfristen</strong>. 
                Du behältst Zugang bis zum Ende der bezahlten Periode.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="difference">
              <AccordionTrigger className="text-left">Was ist der Unterschied zwischen Premium und Pro?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <strong>Premium</strong> bietet unbegrenzte Analysen, Pflegekalender und KI-Chat — perfekt für die meisten Gartenbesitzer.
                <strong> Pro</strong> enthält zusätzlich 3 Rasenflächen, persönlichen Experten-Check und Prioritäts-Support innerhalb von 2 Stunden.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="payment">
              <AccordionTrigger className="text-left">Wie sicher ist die Zahlung?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Wir nutzen <strong>Stripe</strong>, den weltweit führenden Zahlungsanbieter. 
                Akzeptierte Zahlungsmethoden: Kreditkarte, Apple Pay, Google Pay, SEPA-Lastschrift.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upgrade">
              <AccordionTrigger className="text-left">Kann ich von Premium auf Pro upgraden?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Ja! Du kannst jederzeit über das Stripe-Portal upgraden. Der Preisunterschied wird anteilig berechnet.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Payment Methods */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 mb-4">Sichere Zahlung via</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {['Kreditkarte', 'Apple Pay', 'Google Pay', 'SEPA'].map((method) => (
                <div key={method} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                  {method === 'Kreditkarte' && <CreditCard className="h-5 w-5 text-gray-600" />}
                  <span className="text-sm font-medium">{method}</span>
                </div>
              ))}
            </div>
          </div>

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
