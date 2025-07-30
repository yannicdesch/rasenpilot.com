
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Calendar, Sprout, MessageSquare, Upload, Bell } from 'lucide-react';

const FeaturesBehindRegistration = () => {
  const navigate = useNavigate();
  
  const featureCategories = [
    {
      title: "Rasenplanung",
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      features: [
        "Personalisierter Rasenkalender",
        "Wichtige Pflegetermine",
        "Automatische Anpassung an lokale Wetterbedingungen",
        "Fortschrittsverfolgung für alle Pflegeaufgaben"
      ]
    },
    {
      title: "Pflegemanagement",
      icon: <Sprout className="h-8 w-8 text-green-600" />,
      features: [
        "Aufgabenmanagement mit Erinnerungen",
        "Checklisten für saisonale Rasenpflege",
        "Produktempfehlungen basierend auf Ihrem Rasentyp",
        "Pflegehistorie zur Erfolgsverfolgung"
      ]
    },
    {
      title: "KI-Beratung",
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      features: [
        "Chat mit KI-Rasenexperte",
        "Sofortige Antworten zu allen Rasenfragen",
        "Personalisierte Lösungen für Rasenprobleme",
        "Gesprächtsverlauf wird gespeichert"
      ]
    },
    {
      title: "Foto-Upload & Analyse",
      icon: <Upload className="h-8 w-8 text-green-600" />,
      features: [
        "Hochladen von Rasenfotos zur Analyse",
        "KI-basierte Diagnose von Problemen",
        "Fortschrittsdokumentation mit Bildervergleich",
        "Automatische Pflegeempfehlungen"
      ]
    },
    {
      title: "Benachrichtigungen",
      icon: <Bell className="h-8 w-8 text-green-600" />,
      features: [
        "Erinnerungen für wichtige Pflegetermine",
        "Lokale Wetterwarnungen für Ihren Rasen",
        "Saisonale Pflegehinweise",
        "Anpassbare Benachrichtigungseinstellungen"
      ]
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />
      
      <main className="flex-1 py-12 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Funktionen für optimale Rasenpflege</h1>
            <p className="text-lg text-gray-600 mb-6">
              Mit einem kostenlosen Rasenpilot-Konto erhalten Sie Zugriff auf diese Funktionen, die Ihnen helfen, einen perfekten Rasen zu pflegen.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                className="bg-green-600 hover:bg-green-700 px-6 py-2"
                onClick={() => navigate('/lawn-analysis')}
              >
                Kostenlos registrieren <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-green-600 text-green-700"
                onClick={() => navigate('/care-plan')}
              >
                Erst Plan erstellen
              </Button>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featureCategories.map((category, index) => (
              <Card key={index} className="border-green-100 shadow-md hover:shadow-lg transition-shadow hover:border-green-200">
                <CardHeader>
                  <div className="mb-4">{category.icon}</div>
                  <CardTitle className="text-xl font-semibold text-green-800">{category.title}</CardTitle>
                  <CardDescription>Verfügbar mit kostenlosem Konto</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full text-green-700 hover:bg-green-50 hover:text-green-800"
                    onClick={() => navigate('/lawn-analysis')}
                  >
                    Zugriff freischalten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* CTA Bottom */}
          <div className="bg-green-600 text-white rounded-lg p-8 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Bereit für Ihren perfekten Rasen?</h2>
            <p className="mb-6 text-green-100">
              Erstellen Sie noch heute ein kostenloses Konto und erhalten Sie sofortigen Zugang zu all diesen Funktionen!
            </p>
            <Button 
              size="lg"
              className="bg-white text-green-700 hover:bg-green-50 px-8"
              onClick={() => navigate('/lawn-analysis')}
            >
              Kostenlos registrieren
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-green-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-green-200">
            &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesBehindRegistration;
