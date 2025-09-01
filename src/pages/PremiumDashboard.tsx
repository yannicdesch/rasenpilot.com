import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Calendar, 
  MessageSquare, 
  CloudRain, 
  Camera, 
  Bell, 
  Headphones,
  TrendingUp,
  Download,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const PremiumDashboard = () => {
  const { subscription, isPremium, openCustomerPortal } = useSubscription();

  const premiumFeatures = [
    {
      icon: Calendar,
      title: "Ganzjahres-Pflegeplan",
      description: "Personalisierte Pflegepläne für jede Jahreszeit",
      action: "Pflegeplan erstellen",
      link: "/lawn-analysis",
      color: "text-green-600"
    },
    {
      icon: MessageSquare,
      title: "Unbegrenzte KI-Beratung",
      description: "Stelle so viele Fragen wie du möchtest",
      action: "KI-Chat starten",
      link: "/lawn-analysis",
      color: "text-blue-600"
    },
    {
      icon: CloudRain,
      title: "Wetter-Alerts & Tipps",
      description: "Automatische Benachrichtigungen basierend auf der Wettervorhersage",
      action: "Wetter-Tipps anzeigen",
      link: "/weather-advice",
      color: "text-sky-600"
    },
    {
      icon: Camera,
      title: "Fortschritts-Tracking",
      description: "Verfolge die Entwicklung deines Rasens über Zeit",
      action: "Verlauf anzeigen",
      link: "/analysis-history",
      color: "text-purple-600"
    },
    {
      icon: Bell,
      title: "Email-Erinnerungen",
      description: "Nie wieder wichtige Pflegetermine vergessen",
      action: "Einstellungen anpassen",
      link: "/account-settings",
      color: "text-orange-600"
    },
    {
      icon: Headphones,
      title: "Priority Support",
      description: "Bevorzugter Kundensupport und persönliche Beratung",
      action: "Support kontaktieren",
      link: "/kontakt",
      color: "text-red-600"
    }
  ];

  const quickActions = [
    {
      title: "Neue Rasenanalyse",
      description: "Analysiere deinen Rasen mit KI",
      link: "/lawn-analysis",
      icon: Camera,
      color: "bg-green-600"
    },
    {
      title: "Wetter-Ratgeber",
      description: "Aktuelle Pflegetipps basierend auf dem Wetter",
      link: "/weather-advice",
      icon: CloudRain,
      color: "bg-blue-600"
    },
    {
      title: "Saisonaler Guide",
      description: "Monatliche Pflegeempfehlungen",
      link: "/season-guide",
      icon: Calendar,
      color: "bg-purple-600"
    }
  ];

  if (!isPremium) {
    return (
      <>
        <SEO 
          title="Premium Mitgliedschaft erforderlich - Rasenpilot"
          description="Upgrade zu Premium für Zugang zu exklusiven Rasenpflege-Features."
        />
        
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="text-center">
                <Crown className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-yellow-800">
                  Premium Mitgliedschaft erforderlich
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Upgrade zu Premium für Zugang zu exklusiven Features
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/subscription">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    Jetzt Premium werden
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Premium Dashboard - Rasenpilot"
        description="Ihr persönliches Premium Dashboard mit exklusiven Rasenpflege-Features."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-8 w-8 text-yellow-300" />
                  <h1 className="text-3xl font-bold">Premium Dashboard</h1>
                </div>
                <p className="text-green-100">
                  Willkommen in Ihrem exklusiven Mitgliederbereich
                </p>
              </div>
              <div className="text-right">
                <Badge className="bg-yellow-500 text-yellow-900 mb-2">
                  {subscription.subscription_tier} Mitglied
                </Badge>
                {subscription.subscription_end && (
                  <p className="text-sm text-green-100">
                    Aktiv bis: {new Date(subscription.subscription_end).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Schnellzugriff</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link} className="group">
                  <Card className="h-full border-gray-200 hover:border-green-300 transition-all duration-200 group-hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 ml-auto" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ihre Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumFeatures.map((feature, index) => (
                <Card key={index} className="h-full border-gray-200 hover:border-green-300 transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={feature.link}>
                      <Button variant="outline" className="w-full">
                        {feature.action}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Account Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Abonnement verwalten
                </CardTitle>
                <CardDescription>
                  Ändern Sie Ihr Abonnement oder verwalten Sie Zahlungsinformationen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full mb-3"
                  onClick={openCustomerPortal}
                >
                  Stripe Portal öffnen
                </Button>
                <Link to="/subscription">
                  <Button variant="ghost" className="w-full">
                    Abonnement-Details anzeigen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Account-Einstellungen
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre Benachrichtigungen und Profileinstellungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/account-settings">
                  <Button variant="outline" className="w-full mb-3">
                    Einstellungen öffnen
                  </Button>
                </Link>
                <Link to="/kontakt">
                  <Button variant="ghost" className="w-full">
                    Support kontaktieren
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumDashboard;