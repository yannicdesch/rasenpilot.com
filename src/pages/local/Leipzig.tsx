import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Book, AlertTriangle, Thermometer, Calendar, TreePine } from 'lucide-react';

const Leipzig = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Leipzig | KI-Rasenberatung für Sachsen | Rasenpilot"
        description="Professionelle Rasenpflege in Leipzig: KI-gestützte Rasenanalyse für ostdeutsches Klima. Kostenloser Pflegeplan für Leipziger Gärten."
        canonical="/local/leipzig"
        keywords="Rasenpflege Leipzig, Rasenberatung Leipzig, Rasen düngen Leipzig, KI Rasenanalyse Leipzig, Gartenpflege Sachsen, Rasenpilot Leipzig"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Leipzig - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Leipzig und Sachsen',
            areaServed: 'Leipzig, Sachsen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Book className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-blue-600">Leipzig</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Buchstadt - optimiert für kontinentales Klima und Auenlandschaft
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              📚 Kostenlose Leipziger Rasenanalyse
            </Button>
          </div>

          {/* Leipziger Klima */}
          <div className="bg-blue-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🌤️ Leipziger Klima im Überblick</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">570mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">9.1°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">Trocken</div>
                <div className="text-sm text-gray-600">Kontinental geprägt</div>
              </div>
            </div>
          </div>

          {/* Ostdeutsche Besonderheiten */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Leipziger Rasen-Herausforderungen</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">🏞️ Auenlandschaft</h3>
                <p className="text-gray-700 mb-3">
                  Leipzig liegt in der Leipziger Tieflandsbucht mit fruchtbaren Auenböden, 
                  aber auch wechselnden Grundwasserständen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Drainage bei hohem Grundwasser</li>
                  <li>• Fruchtbare Böden optimal nutzen</li>
                  <li>• Wechselnde Feuchtigkeit beachten</li>
                  <li>• Staunässe in Senken vermeiden</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">☀️ Niederschlagsarmut</h3>
                <p className="text-gray-700 mb-3">
                  Mit unter 600mm Jahresniederschlag gehört Leipzig zu den trockensten Gebieten 
                  Deutschlands - Bewässerung ist essentiell.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Wassersparende Bewässerung</li>
                  <li>• Trockenheitsresistente Gräser</li>
                  <li>• Mulchen gegen Verdunstung</li>
                  <li>• Morgendliche Bewässerung optimal</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">❄️ Kontinentale Winter</h3>
                <p className="text-gray-700 mb-3">
                  Kalte, schneereiche Winter erfordern robuste Gräser und 
                  gründliche Wintervorbereitung.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Winterharte Grassorten wählen</li>
                  <li>• Kalium-reiche Herbstdüngung</li>
                  <li>• Schneeschimmel-Prophylaxe</li>
                  <li>• Frostschutz für jungen Rasen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">🌳 Parklandschaft</h3>
                <p className="text-gray-700 mb-3">
                  Leipzig ist reich an Parks und Grünflächen - hohe Ansprüche an Rasenqualität 
                  durch städtische Vorbilder.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professionelle Standards möglich</li>
                  <li>• Parkqualität als Vorbild</li>
                  <li>• Grüne Stadt-Tradition</li>
                  <li>• Ökologische Rasenpflege</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Saisonale Pflege */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Leipziger Jahresplanung</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">🌱 Frühjahr & Sommer</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>März:</strong> Frühe Düngung bei Bodentemperatur 8°C+</li>
                  <li><strong>April-Mai:</strong> Hauptwachstumszeit nutzen, Bewässerung aufbauen</li>
                  <li><strong>Juni-August:</strong> Intensive Bewässerung, Hitzeschutz beachten</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-3">🍂 Herbst & Winter</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>September:</strong> Herbstdüngung, Nachsaat möglich</li>
                  <li><strong>Oktober-November:</strong> Wintervorbereitung, Laub entfernen</li>
                  <li><strong>Dezember-Februar:</strong> Winterruhe, Schneeschutz</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Leipziger Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Leipziger Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Gohlis & Plagwitz (Gründerzeit)</h3>
                <p className="text-gray-700 mb-3">
                  Villenviertel mit großen Gärten, geschützte Lagen, optimale Bedingungen.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Premium-Rasenpflege möglich</li>
                  <li>• Historische Gartenkultur</li>
                  <li>• Windgeschützte Lagen</li>
                  <li>• Professionelle Ansprüche</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Grünau & Paunsdorf (Neubaugebiete)</h3>
                <p className="text-gray-700 mb-3">
                  Moderne Wohnsiedlungen mit kleineren Gärten, weniger Schatten.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Kompakte Rasenflächen</li>
                  <li>• Vollsonnige Lagen häufig</li>
                  <li>• Moderne Bewässerungstechnik</li>
                  <li>• Pflegeleichte Lösungen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Leipziger Buchstadt-Qualität für Ihren Rasen
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI berücksichtigt die ostdeutschen Besonderheiten und erstellt Ihren wassersparenden Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Leipziger Rasen optimieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leipzig;