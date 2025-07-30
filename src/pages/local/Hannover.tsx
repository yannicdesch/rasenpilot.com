import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, TreePine, AlertTriangle, Thermometer, Calendar, Wind } from 'lucide-react';

const Hannover = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Hannover | KI-Rasenberatung für Niedersachsen | Rasenpilot"
        description="Professionelle Rasenpflege in Hannover: KI-gestützte Rasenanalyse für gemäßigtes Klima. Kostenloser Pflegeplan für Hannoveraner Gärten."
        canonical="/local/hannover"
        keywords="Rasenpflege Hannover, Rasenberatung Hannover, Rasen düngen Hannover, KI Rasenanalyse Hannover, Gartenpflege Niedersachsen, Rasenpilot Hannover"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Hannover - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Hannover und Niedersachsen',
            areaServed: 'Hannover, Niedersachsen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <TreePine className="h-8 w-8 text-green-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-green-600">Hannover</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die niedersächsische Landeshauptstadt - optimiert für gemäßigtes Klima
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              🌲 Kostenlose Hannoveraner Rasenanalyse
            </Button>
          </div>

          {/* Weather Info für Hannover */}
          <div className="bg-green-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🌤️ Hannoversches Klima im Überblick</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">650mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">9.5°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Optimal</div>
                <div className="text-sm text-gray-600">Rasenbedingungen</div>
              </div>
            </div>
          </div>

          {/* Hannover Klimabesonderheiten */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Klimatische Vorteile in Hannover</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">🌤️ Ausgeglichenes Klima</h3>
                <p className="text-gray-700 mb-3">
                  Hannover profitiert von gemäßigtem ozeanischem Klima mit ausgewogenen Temperaturen 
                  und 650mm Niederschlag - ideal für Rasenwachstum.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Optimale Wachstumsbedingungen</li>
                  <li>• Längere Vegetationsperiode</li>
                  <li>• Milde Winter</li>
                  <li>• Gleichmäßige Feuchtigkeit</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">🌱 Fruchtbare Böden</h3>
                <p className="text-gray-700 mb-3">
                  Die Lössboden der Region bieten excellent Nährstoffspeicherung und Drainage 
                  für gesundes Rasenwachstum.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Hohe Bodenfruchtbarkeit</li>
                  <li>• Gute Wasserspeicherung</li>
                  <li>• Optimaler pH-Wert</li>
                  <li>• Weniger Dünger nötig</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">💨 Moderate Winde</h3>
                <p className="text-gray-700 mb-3">
                  Geschützte Lage vor starken Küstenwinden, aber ausreichend Luftzirkulation 
                  für gesunden Rasen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gute Belüftung</li>
                  <li>• Weniger Windtrocknung</li>
                  <li>• Pilzprävention natürlich</li>
                  <li>• Stabile Bewässerung</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">🏙️ Grüne Stadt</h3>
                <p className="text-gray-700 mb-3">
                  Als eine der grünsten Städte Deutschlands bietet Hannover optimale 
                  Bedingungen für Rasenpflege mit vielen Parks als Vorbild.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professionelle Standards</li>
                  <li>• Erfahrene Gärtner vor Ort</li>
                  <li>• Gute Infrastruktur</li>
                  <li>• Gartenkultur etabliert</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Jahreszeiten-Pflege für Hannover */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Optimaler Hannoveraner Pflegekalender</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">🌸 Frühjahr (März-Mai)</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>März:</strong> Erste Düngung, Vertikutieren</li>
                  <li><strong>April:</strong> Nachsaat, regelmäßiges Mähen beginnen</li>
                  <li><strong>Mai:</strong> Vollbewässerung aufbauen, Unkraut bekämpfen</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">☀️ Sommer (Juni-August)</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Juni:</strong> Sommerdüngung, intensive Pflege</li>
                  <li><strong>Juli:</strong> Bewässerung anpassen, Schädlinge kontrollieren</li>
                  <li><strong>August:</strong> Hitzeschutz, Wassermanagement optimieren</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-3">🍂 Herbst (Sept-Nov)</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>September:</strong> Herbstdüngung, Reparaturarbeiten</li>
                  <li><strong>Oktober:</strong> Laub entfernen, Wintervorbereitung</li>
                  <li><strong>November:</strong> Letzter Schnitt, Winterpause einleiten</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">❄️ Winter (Dez-Feb)</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Dezember:</strong> Rasen in Ruhe lassen</li>
                  <li><strong>Januar:</strong> Planung für kommendes Jahr</li>
                  <li><strong>Februar:</strong> Gerätewartung, erste Vorbereitungen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hannoveraner Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Hannoveraner Stadtteilen</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Mitte & Calenberger Neustadt</h3>
                <p className="text-gray-700 mb-3">
                  Urbane Bereiche mit kleineren Gärten, mehr Schatten durch Bebauung.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Schattenrasenmischungen</li>
                  <li>• Kompakte Pflegekonzepte</li>
                  <li>• Regelmäßige Belüftung</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">List & Oststadt</h3>
                <p className="text-gray-700 mb-3">
                  Villenviertel mit größeren Gartenflächen, optimale Bedingungen für Zierrasen.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Premium-Rasenpflege</li>
                  <li>• Professionelle Standards</li>
                  <li>• Automatische Bewässerung</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Herrenhausen & Leinhausen</h3>
                <p className="text-gray-700 mb-3">
                  Nähe zu den berühmten Gärten, hohe Ansprüche an Rasenqualität.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Kunstvolle Rasenpflege</li>
                  <li>• Historische Standards</li>
                  <li>• Perfektionierte Techniken</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-green-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hannovers grüne Tradition fortsetzen
            </h2>
            <p className="text-gray-600 mb-6">
              In der Stadt der Gärten verdient Ihr Rasen die beste Pflege. Starten Sie jetzt mit unserer KI-Analyse.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Hannoveraner Traumrasen starten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hannover;