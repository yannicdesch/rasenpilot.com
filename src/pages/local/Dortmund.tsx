import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, AlertTriangle, Thermometer, Calendar, Factory } from 'lucide-react';

const Dortmund = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Dortmund | KI-Rasenberatung für das Ruhrgebiet | Rasenpilot"
        description="Professionelle Rasenpflege in Dortmund: KI-gestützte Rasenanalyse für Industrieklima. Kostenloser Pflegeplan für Dortmunder Gärten."
        canonical="https://www.rasenpilot.com/local/dortmund"
        keywords="Rasenpflege Dortmund, Rasenberatung Dortmund, Rasen düngen Dortmund, KI Rasenanalyse Dortmund, Gartenpflege Ruhrgebiet, Rasenpilot Dortmund"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Dortmund - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Dortmund und das Ruhrgebiet',
            areaServed: 'Dortmund, Nordrhein-Westfalen, Ruhrgebiet',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-yellow-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-yellow-600">Dortmund</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Fußballstadt - optimiert für Ruhrgebiet-Klima und Strukturwandel
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              ⚡ Kostenlose Dortmunder Rasenanalyse
            </Button>
          </div>

          {/* Dortmunder Klima */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🌦️ Dortmunder Ruhrgebietsklima</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">750mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">9.8°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">Wandel</div>
                <div className="text-sm text-gray-600">Strukturwandel</div>
              </div>
            </div>
          </div>

          {/* Ruhrgebiets-Herausforderungen */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Strukturwandel & Rasenpflege</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">🏭 Industrieerbe</h3>
                <p className="text-gray-700 mb-3">
                  Dortmund wandelt sich von der Kohle- und Stahlstadt zur Technologiemetropole. 
                  Böden können noch Altlasten enthalten.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bodenanalyse besonders wichtig</li>
                  <li>• Schwermetall-Tests empfohlen</li>
                  <li>• Bodenverbesserung oft nötig</li>
                  <li>• Drainage prüfen lassen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">⚽ Fußballkultur</h3>
                <p className="text-gray-700 mb-3">
                  Als Heimat des BVB hat Dortmund hohe Ansprüche an Rasenqualität - 
                  der Westfalenpark setzt Maßstäbe.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professionelle Standards angestrebt</li>
                  <li>• Strapazierfähige Rasenmischungen</li>
                  <li>• Sportplatz-Qualität als Vorbild</li>
                  <li>• Intensive Nutzung berücksichtigen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">🌳 Grüne Transformation</h3>
                <p className="text-gray-700 mb-3">
                  Dortmund wird immer grüner - neue Parks und Grünflächen entstehen 
                  auf ehemaligen Industriebrachen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ökologische Rasenpflege bevorzugt</li>
                  <li>• Nachhaltige Methoden gefragt</li>
                  <li>• Biodiversität berücksichtigen</li>
                  <li>• Klimaresilienz wichtig</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">🏢 Universitätsstadt</h3>
                <p className="text-gray-700 mb-3">
                  Als Technologie- und Universitätsstandort entstehen moderne Wohngebiete 
                  mit zeitgemäßen Gartenansprüchen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Moderne Bewässerungssysteme</li>
                  <li>• Smart Garden Technologien</li>
                  <li>• Pflegeleichte Lösungen</li>
                  <li>• Zeitgemäße Rasenpflege</li>
                </ul>
              </div>
            </div>
          </div>

          {/* BVB-inspirierte Rasenpflege */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚽ BVB-Qualität für Ihren Garten</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">🏟️ Profi-Standards</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Strapazierfähige Gräser wie im Stadion</li>
                  <li>• Regelmäßige Belüftung</li>
                  <li>• Professionelle Düngung</li>
                  <li>• Optimale Schnitthöhe</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">🌱 Robuste Mischungen</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Deutsches Weidelgras dominant</li>
                  <li>• Wiesenrispengras für Dichte</li>
                  <li>• Rotschwingel für Trockenheit</li>
                  <li>• Sportrasen-Mischungen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">⚡ Intensive Pflege</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Wöchentliches Mähen</li>
                  <li>• Regelmäßige Bewässerung</li>
                  <li>• Monatliche Düngung</li>
                  <li>• Saisonale Nachsaat</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dortmunder Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Dortmunder Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Hombruch & Syburg (Süden)</h3>
                <p className="text-gray-700 mb-3">
                  Grüne Wohngebiete am Stadtrand, weniger Industriebelastung, große Gärten.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Optimale Rasenbedingungen</li>
                  <li>• Premium-Qualität möglich</li>
                  <li>• Naturnähe nutzen</li>
                  <li>• Villencharakter</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Hörde & Brackel (Zentral)</h3>
                <p className="text-gray-700 mb-3">
                  Ehemalige Industriegebiete im Wandel, moderne Bebauung, urbane Herausforderungen.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Bodenqualität prüfen</li>
                  <li>• Moderne Rasenlösungen</li>
                  <li>• Strukturwandel nutzen</li>
                  <li>• Innovative Pflege</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-yellow-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              BVB-Qualität für Ihren Rasen
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI berücksichtigt den Dortmunder Strukturwandel und erstellt Ihren profi-tauglichen Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Echte Liebe für Ihren Rasen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dortmund;