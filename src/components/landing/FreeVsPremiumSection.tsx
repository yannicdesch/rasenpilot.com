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
    <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.08),transparent_50%)]"></div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-dm-serif text-foreground mb-6">
            Kostenlos starten, bei Bedarf upgraden
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-poppins">
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
          <Card className="relative border-2 border-primary bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 shadow-xl">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                <Crown className="h-4 w-4 mr-1" />
                Beliebt
              </Badge>
            </div>
            <CardHeader className="text-center">
              <Badge variant="outline" className="w-fit mx-auto mb-2 border-primary text-primary font-semibold">
                Premium
              </Badge>
              <CardTitle className="text-2xl text-foreground font-poppins">Vollständige Analyse</CardTitle>
              <div className="text-4xl font-bold text-primary font-poppins">€9,99</div>
              <p className="text-muted-foreground">pro Monat</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{feature.name}</span>
                    {feature.premiumNote && (
                      <div className="text-sm text-primary">
                        {feature.premiumNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
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