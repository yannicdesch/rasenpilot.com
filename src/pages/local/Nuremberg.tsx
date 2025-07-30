import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Grape, AlertTriangle, Thermometer, Calendar, Sun } from 'lucide-react';

const Nuremberg = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Nürnberg | KI-Rasenberatung für Franken | Rasenpilot"
        description="Professionelle Rasenpflege in Nürnberg: KI-gestützte Rasenanalyse für fränkisches Klima. Kostenloser Pflegeplan für Nürnberger Gärten."
        canonical="/local/nuremberg"
        keywords="Rasenpflege Nürnberg, Rasenberatung Nürnberg, Rasen düngen Nürnberg, KI Rasenanalyse Nürnberg, Gartenpflege Franken, Rasenpilot Nürnberg"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Nürnberg - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Nürnberg und Franken',
            areaServed: 'Nürnberg, Bayern, Franken',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Grape className="h-8 w-8 text-purple-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-purple-600">Nürnberg</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Frankenmetropole - optimiert für kontinentales Klima und Sandsteinboden
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              🏰 Kostenlose Nürnberger Rasenanalyse
            </Button>
          </div>

          {/* Weather Info für Nürnberg */}
          <div className="bg-purple-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">☀️ Fränkisches Klima im Überblick</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">650mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">8.9°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">1600h</div>
                <div className="text-sm text-gray-600">Sonnenstunden/Jahr</div>
              </div>
            </div>
          </div>

          {/* Fränkische Besonderheiten */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Fränkische Rasen-Besonderheiten</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">🪨 Sandsteinboden</h3>
                <p className="text-gray-700 mb-3">
                  Der charakteristische fränkische Sandsteinboden ist durchlässig und erwärmt sich schnell, 
                  kann aber Nährstoffe schlecht speichern.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Regelmäßige, kleine Düngergaben</li>
                  <li>• Organische Bodenverbesserung</li>
                  <li>• Häufigere Bewässerung nötig</li>
                  <li>• Mulchen zur Wasserspeicherung</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">☀️ Trockene Sommer</h3>
                <p className="text-gray-700 mb-3">
                  Nürnberg liegt im Regenschatten der Mittelgebirge und hat relativ trockene Sommer 
                  mit intensiver Sonneneinstrahlung.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Trockenresistente Gräser wählen</li>
                  <li>• Schnitthöhe erhöhen (5-6cm)</li>
                  <li>• Tiefe, seltene Bewässerung</li>
                  <li>• Morgendliche Bewässerung</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">❄️ Kalte Winter</h3>
                <p className="text-gray-700 mb-3">
                  Kontinentales Klima mit kalten Wintern erfordert gute Wintervorbereitung 
                  und robuste Grassorten.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Kalium-reiche Herbstdüngung</li>
                  <li>• Winterharte Gräser bevorzugen</li>
                  <li>• Schneeschimmel vorbeugen</li>
                  <li>• Frostschutz für jungen Rasen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">🍇 Weinbau-Tradition</h3>
                <p className="text-gray-700 mb-3">
                  Die Nähe zu Weinbaugebieten zeigt optimale Sonnenlage, aber auch 
                  die Bedeutung von Hangneigung und Mikroklima.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Hangneigung bei Planung beachten</li>
                  <li>• Südlagen optimal nutzen</li>
                  <li>• Mikroklima berücksichtigen</li>
                  <li>• Erosionsschutz an Hängen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Nürnberger Pflegekalender */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Fränkischer Rasenpflege-Kalender</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🌱 Frühjahr</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Düngung ab März</li>
                  <li>• Bodenlockerung</li>
                  <li>• Nachsaat April-Mai</li>
                  <li>• Bewässerung aufbauen</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">☀️ Sommer</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Intensive Bewässerung</li>
                  <li>• Schnitthöhe erhöhen</li>
                  <li>• Hitzeschutz beachten</li>
                  <li>• Dünger anpassen</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">🍂 Herbst</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Kalium-Düngung</li>
                  <li>• Wintervorbereitung</li>
                  <li>• Letzte Nachsaat</li>
                  <li>• Laub entfernen</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">❄️ Winter</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Frostschutz</li>
                  <li>• Schneeschimmel kontrollieren</li>
                  <li>• Gerätewartung</li>
                  <li>• Frühjahrsplanung</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Nürnberger Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Nürnberger Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Erlenstegen & Mögeldorf (Stadtrand)</h3>
                <p className="text-gray-700 mb-3">
                  Ruhige Vorstadtgebiete mit größeren Gärten, weniger urbane Hitze.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Optimale Bedingungen für Zierrasen</li>
                  <li>• Weniger Hitzestress</li>
                  <li>• Naturnahe Rasenpflege möglich</li>
                  <li>• Professionelle Standards</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Altstadt & St. Johannis (Zentrum)</h3>
                <p className="text-gray-700 mb-3">
                  Innerstädtische Bereiche mit Wärmeinseleffekt und kleineren Rasenflächen.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Hitzeresistente Mischungen</li>
                  <li>• Intensive Bewässerung nötig</li>
                  <li>• Kompakte Pflegekonzepte</li>
                  <li>• Schattenrasen in Innenhöfen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-purple-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Fränkische Rasenqualität erreichen
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI berücksichtigt die fränkischen Besonderheiten und erstellt Ihren optimalen Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Nürnberger Rasen perfektionieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nuremberg;