import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, Target, Leaf } from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';

const UeberUns = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-dm-serif text-foreground mb-4">
              Über Rasenpilot
            </h1>
            <p className="text-xl text-muted-foreground font-poppins max-w-3xl mx-auto">
              Deutschlands führende KI-Plattform für intelligente Rasenpflege
            </p>
          </div>

          {/* Mission Card */}
          <Card className="border border-border shadow-xl bg-card/50 backdrop-blur mb-8">
            <CardContent className="p-8 md:p-10">
              <p className="text-lg text-muted-foreground font-poppins leading-relaxed">
                <strong className="text-foreground text-xl">Rasenpilot</strong> ist Deutschlands führende KI-Plattform für intelligente Rasenpflege. Unsere Vision: Ein perfekter Rasen für jeden – individuell, datengestützt und nachhaltig.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            {/* Was wir tun Card */}
            <Card className="border border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground font-poppins">
                    Was wir tun
                  </h2>
                </div>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Wir entwickeln wissenschaftlich fundierte Pflegepläne mithilfe von KI-Algorithmen. So erhält jeder Gartenbesitzer einen maßgeschneiderten Pflegefahrplan für optimale Rasengesundheit.
                </p>
              </CardContent>
            </Card>

            {/* Unser Team Card */}
            <Card className="border border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground font-poppins">
                    Unser Team
                  </h2>
                </div>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Ein Mix aus Gartenbauexperten, Data Scientists und Technikenthusiasten – mit Herz und Verstand für grüne Flächen und innovative Lösungen.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Unsere Werte Card */}
          <Card className="border border-border shadow-xl bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5">
            <CardContent className="p-8 md:p-10">
              <h2 className="text-3xl font-bold mb-8 text-foreground font-dm-serif">Unsere Werte</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <CheckCircle className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground font-poppins mb-2">Nachhaltigkeit</h3>
                  <p className="text-muted-foreground text-sm font-poppins">
                    Umweltfreundliche Rasenpflege für eine grünere Zukunft
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <CheckCircle className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground font-poppins mb-2">Wissenschaft</h3>
                  <p className="text-muted-foreground text-sm font-poppins">
                    Fundierte Beratung basierend auf aktueller Forschung
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <CheckCircle className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground font-poppins mb-2">Einfachheit</h3>
                  <p className="text-muted-foreground text-sm font-poppins">
                    Digitale Lösungen, die jeder verstehen und nutzen kann
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UeberUns;