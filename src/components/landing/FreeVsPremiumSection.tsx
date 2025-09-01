import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreeVsPremiumSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      name: "Rasen-Analyse mit KI",
      free: true,
      premium: true,
      freeNote: "Grundbewertung",
      premiumNote: "Detaillierte Teilbewertungen"
    },
    {
      name: "Sofort-Empfehlungen",
      free: true,
      premium: true,
      freeNote: "3 wichtigste Tipps",
      premiumNote: "7-Tage Aktionsplan"
    },
    {
      name: "PDF-Download",
      free: false,
      premium: true,
      freeNote: "",
      premiumNote: "Vollständiger Pflegeplan"
    },
    {
      name: "Weitere Analysen",
      free: false,
      premium: true,
      freeNote: "Begrenzt",
      premiumNote: "Unbegrenzt"
    },
    {
      name: "Wetter-Integration",
      free: false,
      premium: true,
      freeNote: "",
      premiumNote: "Optimales Timing"
    },
    {
      name: "Problemdiagnose",
      free: false,
      premium: true,
      freeNote: "",
      premiumNote: "Detaillierte Ursachen"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Kostenlos starten, bei Bedarf upgraden
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Beginnen Sie sofort mit der kostenlosen Rasen-Analyse. Für detaillierte Pflegepläne upgraden Sie jederzeit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <Badge variant="outline" className="w-fit mx-auto mb-2">
                Kostenlos
              </Badge>
              <CardTitle className="text-2xl">Basis-Analyse</CardTitle>
              <div className="text-3xl font-bold text-green-600">€0</div>
              <p className="text-gray-600">Perfekt zum Ausprobieren</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.free ? (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className={feature.free ? "text-gray-900" : "text-gray-400"}>
                      {feature.name}
                    </span>
                    {feature.free && feature.freeNote && (
                      <div className="text-sm text-gray-500">
                        {feature.freeNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => navigate('/lawn-analysis')}
                className="w-full mt-6"
                variant="outline"
              >
                Kostenlos starten
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 text-white px-4 py-1">
                <Crown className="h-4 w-4 mr-1" />
                Beliebt
              </Badge>
            </div>
            <CardHeader className="text-center">
              <Badge variant="outline" className="w-fit mx-auto mb-2 border-yellow-300 text-yellow-700">
                Premium
              </Badge>
              <CardTitle className="text-2xl text-yellow-800">Vollständige Analyse</CardTitle>
              <div className="text-3xl font-bold text-yellow-600">€9,99</div>
              <p className="text-yellow-700">pro Monat</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-900">{feature.name}</span>
                    {feature.premiumNote && (
                      <div className="text-sm text-yellow-600">
                        {feature.premiumNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Premium wählen
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            ✓ Jederzeit kündbar ✓ 30 Tage Geld-zurück-Garantie
          </p>
        </div>
      </div>
    </section>
  );
};

export default FreeVsPremiumSection;