
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Zap, Trophy } from 'lucide-react';

const SpecialFeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Was macht Rasenpilot so <span className="text-green-600">revolutionär?</span>
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Als Deutschlands erster KI-gestützter Rasenberater kombinieren wir modernste Technologie 
            mit jahrzehntelanger Gartenbau-Expertise für beispiellose Ergebnisse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Bilderkennungs-KI</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Unsere proprietäre KI-Technologie erkennt über 200 Rasenprobleme, Krankheiten und Nährstoffmängel 
                mit einer Genauigkeit von 94,7% - schneller und präziser als jeder Experte.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Echtzeit-Wetterdaten</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Integration von Live-Wetterdaten, Bodenfeuchtigkeit und saisonalen Faktoren 
                für perfekt abgestimmte Pflegeempfehlungen - jeden Tag neu berechnet.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Garantierte Erfolge</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                98,3% unserer Nutzer berichten von sichtbaren Verbesserungen innerhalb von 14 Tagen. 
                Wissenschaftlich getestet und von Gartenexperten bestätigt.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">Rasenpilot in Zahlen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-700 font-medium">Parameter analysiert</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">94,7%</div>
              <div className="text-gray-700 font-medium">KI-Genauigkeit</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">98,3%</div>
              <div className="text-gray-700 font-medium">Erfolgsrate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-700 font-medium">Verfügbarkeit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialFeaturesSection;
