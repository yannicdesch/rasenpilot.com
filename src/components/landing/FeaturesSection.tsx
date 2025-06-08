
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Camera, MessageSquare, Leaf, Users } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white" id="funktionen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Warum Rasenpilot die <span className="text-green-600">#1 Wahl</span> ist
          </h2>
          <p className="text-lg text-gray-700">
            Deutschlands fortschrittlichste Rasenpflege-Technologie vereint in einer intuitiven App
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-green-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 flex items-center">
              <Camera className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">KI-Bildanalyse der Zukunft</h3>
                <p className="text-green-700 font-medium">94,7% Genauigkeit bei Problemerkennung</p>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-lg">
                Revolutionäre Computer-Vision-Technologie identifiziert Probleme, die das menschliche Auge übersieht.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                  <span>Erkennung von über 200 Rasenproblemen und Krankheiten</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                  <span>Präzise Nährstoffmangel-Diagnose durch Farbanalyse</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                  <span>Sofortige Behandlungsempfehlungen in Echtzeit</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">KI-Rasenexperte 24/7</h3>
                <p className="text-blue-700 font-medium">Über 10.000 Expertenfragen beantwortet</p>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-lg">
                Ihr persönlicher Rasenexperte mit dem Wissen von Jahrzehnten Gartenbau-Erfahrung.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                  <span>Sofortige Antworten auf alle Rasenpflege-Fragen</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                  <span>Personalisierte Beratung basierend auf Ihrem Rasen</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                  <span>Kontinuierliches Lernen aus Expertenwissen</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 flex items-center">
              <Leaf className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Wissenschaftlich fundiert</h3>
                <p className="text-purple-700 font-medium">Entwickelt mit Universitäts-Partnern</p>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-lg">
                Jede Empfehlung basiert auf wissenschaftlichen Studien und bewährten Gartenbau-Prinzipien.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                  <span>Klimadaten-Integration für deutsche Verhältnisse</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                  <span>Saisonale Anpassung der Pflegeempfehlungen</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                  <span>Kontinuierliche Verbesserung durch Nutzerfeedback</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 flex items-center">
              <Users className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Community & Support</h3>
                <p className="text-orange-700 font-medium">50.000+ aktive Rasen-Enthusiasten</p>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4 text-lg">
                Profitieren Sie von Deutschlands größter Rasenpflege-Community und Premium-Support.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                  <span>Erfahrungsaustausch mit anderen Nutzern</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                  <span>Regelmäßige Expertenwrebinare und Tipps</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                  <span>Premium-Support bei Problemen</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
