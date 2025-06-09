
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Calendar, MessageSquare, CloudRain, Camera, Bell, Headphones } from 'lucide-react';

const PremiumFeatures = () => {
  const features = [
    {
      icon: <Calendar className="h-5 w-5 text-green-600" />,
      title: "Ganzjahres-Pflegeplan",
      description: "Vollständiger Jahreskalender mit saisonalen Aufgaben",
      free: "2-Wochen-Plan",
      premium: "Ganzes Jahr"
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-green-600" />,
      title: "KI-Chat Assistent",
      description: "Unbegrenzte Fragen an unseren Rasenexperten",
      free: "5 Fragen/Tag",
      premium: "Unbegrenzt"
    },
    {
      icon: <CloudRain className="h-5 w-5 text-green-600" />,
      title: "Erweiterte Wetterinfo",
      description: "Wetter-Alerts und Bewässerungsempfehlungen",
      free: "Basis Wetter",
      premium: "Alerts & Tipps"
    },
    {
      icon: <Camera className="h-5 w-5 text-green-600" />,
      title: "Fortschritts-Tracking",
      description: "Verfolgen Sie die Entwicklung Ihres Rasens",
      free: "Nicht verfügbar",
      premium: "Foto-Vergleiche"
    },
    {
      icon: <Bell className="h-5 w-5 text-green-600" />,
      title: "Email-Erinnerungen",
      description: "Automatische Benachrichtigungen für Aufgaben",
      free: "Nicht verfügbar",
      premium: "Enthalten"
    },
    {
      icon: <Headphones className="h-5 w-5 text-green-600" />,
      title: "Priority Support",
      description: "Bevorzugter Kundensupport",
      free: "Standard",
      premium: "Priorität"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Premium Features</h2>
        <p className="text-gray-600">Holen Sie das Beste aus Ihrem Rasen heraus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {feature.icon}
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Free:</span>
                  <Badge variant="outline">{feature.free}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Premium:</span>
                  <Badge className="bg-green-600">
                    <Star className="h-3 w-3 mr-1" />
                    {feature.premium}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PremiumFeatures;
