
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MessageSquare, Camera, Calendar, FileStack, Bell, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: 'monthly' | 'yearly' | 'lifetime') => void;
  variant?: 'full' | 'compact';
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, variant = 'full' }) => {
  const navigate = useNavigate();
  
  const handleSelectPlan = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      navigate('/auth', { state: { selectedPlan: plan } });
    }
  };

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Free</CardTitle>
            <CardDescription>Zum Ausprobieren</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-3xl font-bold mb-4">€0 <span className="text-sm font-normal text-gray-500">für immer</span></p>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>14-Tage Basispflegeplan</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>1x Rasenanalyse pro Monat</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Einfacher KI-Chat (ohne Fotos)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => handleSelectPlan('monthly')}>
              Jetzt ausprobieren
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-green-200 shadow-md relative">
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge className="bg-green-500">Beliebteste Wahl</Badge>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pro</CardTitle>
            <CardDescription>Monatlich kündbar</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-3xl font-bold mb-4">€4.99 <span className="text-sm font-normal text-gray-500">/Monat</span></p>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Unbegrenzte Rasenanalysen</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Vollständiger KI-Chat mit Fotos</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Saisonaler Jahrespflegeplan</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleSelectPlan('monthly')}>
              Jetzt auswählen
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-amber-200 relative">
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge className="bg-amber-500">Bestes Angebot</Badge>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pro Jährlich</CardTitle>
            <CardDescription>41% sparen</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-3xl font-bold mb-4">€29 <span className="text-sm font-normal text-gray-500">/Jahr</span></p>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Alle Pro-Funktionen</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>5 Monate kostenlos</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Prioritäts-Support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => handleSelectPlan('yearly')}>
              Jährlich wählen
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-gray-200 h-full">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Zum Ausprobieren</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold">€0</p>
              <p className="text-sm text-gray-500">für immer</p>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <span>14-Tage Basispflegeplan</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <span>1x Rasenanalyse pro Monat</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <span>Einfacher KI-Chat (ohne Fotos)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <span>Wetter-Benachrichtigungen (begrenzt)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <span>Vorschau des Smart Kalenders</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => handleSelectPlan('monthly')}>
              Jetzt ausprobieren
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-green-200 shadow-md relative h-full">
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge className="bg-green-500">Beliebteste Wahl</Badge>
          </div>
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>Monatlich kündbar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold">€4.99</p>
              <p className="text-sm text-gray-500">pro Monat</p>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <Camera className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Unbegrenzte Analyzer-Uploads</span>
                  <p className="text-xs text-gray-500">Lade jederzeit Fotos deines Rasens hoch und erhalte Diagnosen</p>
                </div>
              </li>
              <li className="flex items-start">
                <MessageSquare className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Vollständiger KI-Chatbot</span>
                  <p className="text-xs text-gray-500">Mit Foto-Upload & personalisierten Antworten</p>
                </div>
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Wöchentlicher & saisonaler Planer</span>
                  <p className="text-xs text-gray-500">Dynamischer Pflegeplan für das ganze Jahr</p>
                </div>
              </li>
              <li className="flex items-start">
                <Bell className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Smart-Alerts</span>
                  <p className="text-xs text-gray-500">Wetterbezogene Erinnerungen & Hinweise</p>
                </div>
              </li>
              <li className="flex items-start">
                <FileStack className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">PDF-Export</span>
                  <p className="text-xs text-gray-500">Exportiere deinen Pflegeplan als PDF</p>
                </div>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleSelectPlan('monthly')}>
              Monatlichen Plan wählen
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-amber-200 h-full relative">
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge className="bg-amber-500">Bestes Angebot</Badge>
          </div>
          <CardHeader>
            <CardTitle>Pro Jährlich</CardTitle>
            <CardDescription>41% sparen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold">€29</p>
              <p className="text-sm text-gray-500">pro Jahr (statt €59.88)</p>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Alle Pro-Funktionen</span>
                  <p className="text-xs text-gray-500">Unbegrenzter Zugang zu allen Features</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">5 Monate kostenlos</span>
                  <p className="text-xs text-gray-500">Im Vergleich zum Monatsplan</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Prioritäts-Support</span>
                  <p className="text-xs text-gray-500">Schnellere Antworten bei Fragen</p>
                </div>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => handleSelectPlan('yearly')}>
              Jährlich wählen & sparen
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600 fill-amber-200" />
            <CardTitle>Lifetime Deal - Nur für kurze Zeit</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Einmalzahlung: €79</h3>
            <p className="text-gray-700 mb-4">
              Erhalte lebenslangen Zugang zu allen Pro-Funktionen mit einer einmaligen Zahlung. Spare langfristig und unterstütze uns bei der Weiterentwicklung von Rasenpilot.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Lebenslanger Zugang zu allen Pro-Funktionen</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Exklusives "Early Adopter"-Abzeichen</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Früher Zugang zu neuen Funktionen</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <Button 
              className="w-full lg:w-auto px-8 py-6 text-lg bg-amber-600 hover:bg-amber-700" 
              onClick={() => handleSelectPlan('lifetime')}
            >
              Lifetime Deal sichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPlans;
