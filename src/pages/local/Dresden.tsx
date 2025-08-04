import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, AlertTriangle, Thermometer, Calendar, Snowflake } from 'lucide-react';

const Dresden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Dresden | KI-Rasenberatung für Sachsen | Rasenpilot"
        description="Professionelle Rasenpflege in Dresden: KI-gestützte Rasenanalyse für kontinentales Klima. Kostenloser Pflegeplan für Dresdner Gärten."
        canonical="https://www.rasenpilot.com/local/dresden"
        keywords="Rasenpflege Dresden, Rasenberatung Dresden, Rasen düngen Dresden, KI Rasenanalyse Dresden, Gartenpflege Sachsen, Rasenpilot Dresden"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Dresden - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Dresden und Sachsen',
            areaServed: 'Dresden, Sachsen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Mountain className="h-8 w-8 text-green-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-green-600">Dresden</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Elbmetropole - optimiert für kontinentales Klima und Elbauenboden
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              🏛️ Kostenlose Dresdner Rasenanalyse
            </Button>
          </div>

          {/* Weather Info für Dresden */}
          <div className="bg-blue-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">☀️ Dresdner Klima im Überblick</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">600mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">10°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">1650h</div>
                <div className="text-sm text-gray-600">Sonnenstunden/Jahr</div>
              </div>
            </div>
          </div>

          {/* Dresdner Klimaherausforderungen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Klimatische Besonderheiten in Dresden</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">🌡️ Kontinentales Klima</h3>
                <p className="text-gray-700 mb-3">
                  Dresden hat warme, trockene Sommer und kalte Winter. Mit nur 600mm Niederschlag pro Jahr 
                  gehört es zu den trockensten Regionen Deutschlands.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bewässerung ist essentiell</li>
                  <li>• Trockenresistente Gräser wählen</li>
                  <li>• Mulchen gegen Verdunstung</li>
                  <li>• Frühe Morgenbewässerung</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">❄️ Strenge Winter</h3>
                <p className="text-gray-700 mb-3">
                  Kälteperioden bis -15°C erfordern robuste Gräser und gute Wintervorbereitung.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Kalium-reiche Herbstdüngung</li>
                  <li>• Frostschutz für jungen Rasen</li>
                  <li>• Schneeschimmel vorbeugen</li>
                  <li>• Winterharte Grassorten</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">🌊 Elbauenboden</h3>
                <p className="text-gray-700 mb-3">
                  Fruchtbare Auenböden wechseln sich mit sandigen Bereichen ab. Unterschiedliche 
                  Wasserspeicherung erfordert angepasste Pflege.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bodentyp bestimmen</li>
                  <li>• Standortgerechte Düngung</li>
                  <li>• Drainage bei Lehmboden</li>
                  <li>• Wasserspeicher bei Sand</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">☀️ Hohe Sonneneinstrahlung</h3>
                <p className="text-gray-700 mb-3">
                  Viele Sonnenstunden führen zu schneller Austrocknung und Hitzestress.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Schnitthöhe 5-6cm im Sommer</li>
                  <li>• Morgendliche Bewässerung</li>
                  <li>• Schattenspender erwägen</li>
                  <li>• Hitzestress-Indikatoren beachten</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wetterbasierte Tipps für Dresden */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Thermometer className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Saisonale Rasenpflege in Dresden</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🌱 Frühjahr (März-Mai)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Frühe Düngung (März)</li>
                  <li>• Bewässerung aufbauen</li>
                  <li>• Nachsaat im April</li>
                  <li>• Frost noch möglich</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">☀️ Sommer (Juni-August)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Intensive Bewässerung</li>
                  <li>• Tägliche Kontrolle</li>
                  <li>• Schnitthöhe erhöhen</li>
                  <li>• Hitzeschutz beachten</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">🍂 Herbst (Sept-Nov)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Kalium-Düngung</li>
                  <li>• Wintervorbereitung</li>
                  <li>• Laub entfernen</li>
                  <li>• Letzte Nachsaat</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">❄️ Winter (Dez-Feb)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Betreten vermeiden</li>
                  <li>• Schneeschimmel kontrollieren</li>
                  <li>• Planung für Frühjahr</li>
                  <li>• Gerätewartung</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dresdner Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Dresdner Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Blasewitz & Loschwitz (Elbhänge)</h3>
                <p className="text-gray-700 mb-3">
                  Villengebiete mit Hanglage, teilweise geschützt vor Wind, bessere Wasserspeicherung.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Hangstabilisierung wichtig</li>
                  <li>• Mikroklima nutzen</li>
                  <li>• Erosionsschutz beachten</li>
                  <li>• Premium-Rasenpflege möglich</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Neustadt & Pieschen (Elbtal)</h3>
                <p className="text-gray-700 mb-3">
                  Flache Bereiche, windig, trockener, urbane Bebauung mit kleineren Gartenflächen.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Windschutz installieren</li>
                  <li>• Kompakte Rasenflächen</li>
                  <li>• Intensive Bewässerung</li>
                  <li>• Robuste Grassorten</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Perfekter Rasen trotz Dresdner Trockenheit
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI kennt die kontinentalen Herausforderungen und optimiert Ihren Pflegeplan für das Dresdner Klima.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Dresdner Rasen perfektionieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dresden;