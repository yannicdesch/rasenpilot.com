
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Zap, Trophy } from 'lucide-react';

const SpecialFeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.05),transparent_50%)]"></div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-dm-serif text-foreground mb-6">
            Was macht Rasenpilot so <span className="text-primary">revolutionär?</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed font-poppins">
            Als Deutschlands erster KI-gestützter Rasenberater kombinieren wir modernste Technologie 
            mit jahrzehntelanger Gartenbau-Expertise für beispiellose Ergebnisse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Camera className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground font-poppins">Bilderkennungs-KI</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Unsere proprietäre KI-Technologie erkennt über 200 Rasenprobleme, Krankheiten und Nährstoffmängel 
                mit einer Genauigkeit von 94,7% - schneller und präziser als jeder Experte.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground font-poppins">Echtzeit-Wetterdaten</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Integration von Live-Wetterdaten, Bodenfeuchtigkeit und saisonalen Faktoren 
                für perfekt abgestimmte Pflegeempfehlungen - jeden Tag neu berechnet.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground font-poppins">Garantierte Erfolge</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                98,3% unserer Nutzer berichten von sichtbaren Verbesserungen innerhalb von 14 Tagen. 
                Wissenschaftlich getestet und von Gartenexperten bestätigt.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 rounded-3xl p-10 border border-primary/10 shadow-sm">
          <h3 className="text-3xl font-bold text-center mb-10 text-foreground font-dm-serif">Rasenpilot in Zahlen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2 font-poppins">200+</div>
              <div className="text-muted-foreground font-medium">Parameter analysiert</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2 font-poppins">94,7%</div>
              <div className="text-muted-foreground font-medium">KI-Genauigkeit</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2 font-poppins">98,3%</div>
              <div className="text-muted-foreground font-medium">Erfolgsrate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2 font-poppins">24/7</div>
              <div className="text-muted-foreground font-medium">Verfügbarkeit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialFeaturesSection;
