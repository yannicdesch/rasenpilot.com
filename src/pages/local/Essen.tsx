import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Cloud, AlertTriangle, Thermometer, Calendar, Droplets } from 'lucide-react';

const Essen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Essen | KI-Rasenberatung für das Ruhrgebiet | Rasenpilot"
        description="Professionelle Rasenpflege in Essen: KI-gestützte Rasenanalyse für Industrieregion und Bergbaugebiet. Kostenloser Pflegeplan für Essener Gärten."
        canonical="/local/essen"
        keywords="Rasenpflege Essen, Rasenberatung Essen, Rasen düngen Essen, KI Rasenanalyse Essen, Gartenpflege Ruhrgebiet, Rasenpilot Essen"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Essen - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Essen und das Ruhrgebiet',
            areaServed: 'Essen, Nordrhein-Westfalen, Ruhrgebiet',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-orange-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-orange-600">Essen</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Spezialisierte KI-Rasenberatung für das Ruhrgebiet - optimiert für Industrieboden und urbane Herausforderungen
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700"
            >
              🏭 Kostenlose Essener Rasenanalyse
            </Button>
          </div>

          {/* Weather Info für Essen */}
          <div className="bg-blue-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🌦️ Essener Klima im Überblick</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">800mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">9°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">180</div>
                <div className="text-sm text-gray-600">Regentage/Jahr</div>
              </div>
            </div>
          </div>

          {/* Ruhrgebiet Herausforderungen */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Besondere Herausforderungen im Ruhrgebiet</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-orange-800">🏭 Industrielle Belastung</h3>
                <p className="text-gray-700 mb-3">
                  Das Ruhrgebiet hat eine lange Industriegeschichte. Böden können Altlasten enthalten und 
                  die Luftqualität beeinflusst das Rasenwachstum.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Bodenanalyse besonders wichtig</li>
                  <li>• Häufigere Blattdüngung nötig</li>
                  <li>• Resistente Grassorten verwenden</li>
                  <li>• Regelmäßige Kalkkung erforderlich</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-orange-800">⛏️ Bergbau-Nachwirkungen</h3>
                <p className="text-gray-700 mb-3">
                  Bergbauregionen haben oft ungleichmäßige Bodensetzungen und veränderte Drainage.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Drainage-Systeme prüfen</li>
                  <li>• Bodenverdichtung vermeiden</li>
                  <li>• Flexible Bewässerung anpassen</li>
                  <li>• Regelmäßige Belüftung wichtig</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-orange-800">🌧️ Hohe Niederschläge</h3>
                <p className="text-gray-700 mb-3">
                  Mit 800mm jährlichem Niederschlag neigt das Ruhrgebiet zu Staunässe und Pilzproblemen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Drainage absolut essentiell</li>
                  <li>• Pilzvorbeugung im Frühjahr</li>
                  <li>• Vertikutieren 2x jährlich</li>
                  <li>• Luftige Rasenmischungen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-orange-800">🏘️ Dichte Bebauung</h3>
                <p className="text-gray-700 mb-3">
                  Kleine Gärten, viel Schatten und verdichteter Boden durch urbane Strukturen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Schattenrasenmischungen</li>
                  <li>• Intensive Bodenpflege</li>
                  <li>• Kompakte Pflegepläne</li>
                  <li>• Platzsparende Lösungen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wetterbasierte Tipps */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Cloud className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Wetterbasierte Rasenpflege-Tipps für Essen</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <Droplets className="h-8 w-8 text-blue-600 mb-4" />
                <h4 className="font-semibold text-blue-800 mb-2">Bei Regen (häufig!)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Mähen vermeiden bei Nässe</li>
                  <li>• Drainage kontrollieren</li>
                  <li>• Pilzkrankheiten beobachten</li>
                  <li>• Belüftung nach Regenperioden</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <Thermometer className="h-8 w-8 text-orange-600 mb-4" />
                <h4 className="font-semibold text-orange-800 mb-2">Bei Trockenheit (selten)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Intensive Bewässerung</li>
                  <li>• Mulchen erwägen</li>
                  <li>• Schnitthöhe erhöhen</li>
                  <li>• Morgens wässern (5-7 Uhr)</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <Calendar className="h-8 w-8 text-green-600 mb-4" />
                <h4 className="font-semibold text-green-800 mb-2">Ganzjährig beachten</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Luftqualität berücksichtigen</li>
                  <li>• Monatliche Bodenprüfung</li>
                  <li>• Industriestaub entfernen</li>
                  <li>• Mikroklima beobachten</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Essener Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Essener Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Bredeney & Werden (Süden)</h3>
                <p className="text-gray-700 mb-3">
                  Villenviertel mit großen Gärten, weniger Industriebelastung, bessere Bodenqualität.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Premium-Rasenpflege möglich</li>
                  <li>• Zierrasen-Standards erreichbar</li>
                  <li>• Professionelle Bewässerung</li>
                  <li>• Regelmäßige Düngung</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Altenessen & Katernberg (Norden)</h3>
                <p className="text-gray-700 mb-3">
                  Ehemalige Zechensiedlungen, kleine Gärten, mehr Industrienähe, robuste Lösungen nötig.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Strapazierfähige Rasenmischungen</li>
                  <li>• Intensive Bodenpflege</li>
                  <li>• Platzsparende Konzepte</li>
                  <li>• Community-Gärten nutzen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-orange-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Auch im Ruhrgebiet ist perfekter Rasen möglich!
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI kennt die besonderen Herausforderungen der Industrieregion und erstellt Ihren individuellen Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Ruhrgebiet-Rasen optimieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Essen;