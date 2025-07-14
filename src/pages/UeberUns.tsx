import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, Target, Leaf } from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';

const UeberUns = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                Über uns
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-6">
              <p className="text-lg">
                <strong>Rasenpilot</strong> ist Deutschlands führende KI-Plattform für intelligente Rasenpflege. Unsere Vision: Ein perfekter Rasen für jeden – individuell, datengestützt und nachhaltig.
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Was wir tun
                </h2>
                <p>
                  Wir entwickeln wissenschaftlich fundierte Pflegepläne mithilfe von KI-Algorithmen. So erhält jeder Gartenbesitzer einen maßgeschneiderten Pflegefahrplan.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Unser Team
                </h2>
                <p>
                  Ein Mix aus Gartenbauexperten, Data Scientists und Technikenthusiasten – mit Herz und Verstand für grüne Flächen.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Unsere Werte</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Nachhaltigkeit in der Rasenpflege</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Wissenschaftlich fundierte Beratung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Digitale Einfachheit für den Nutzer</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UeberUns;