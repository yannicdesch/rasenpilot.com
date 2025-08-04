import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Waves, AlertTriangle, Thermometer, Calendar, Wind } from 'lucide-react';

const Bremen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Bremen | KI-Rasenberatung für Norddeutschland | Rasenpilot"
        description="Professionelle Rasenpflege in Bremen: KI-gestützte Rasenanalyse für Meeresklima. Kostenloser Pflegeplan für Bremer Gärten."
        canonical="https://www.rasenpilot.com/local/bremen"
        keywords="Rasenpflege Bremen, Rasenberatung Bremen, Rasen düngen Bremen, KI Rasenanalyse Bremen, Gartenpflege Bremen, Rasenpilot Bremen"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Bremen - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Bremen und Norddeutschland',
            areaServed: 'Bremen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Waves className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-blue-600">Bremen</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Hansestadt - optimiert für maritimes Klima und Windbelastung
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              ⚓ Kostenlose Bremer Rasenanalyse
            </Button>
          </div>

          {/* Weather Info für Bremen */}
          <div className="bg-blue-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🌊 Bremer Meeresklima im Überblick</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">700mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">9°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Windig</div>
                <div className="text-sm text-gray-600">Küsteneinfluss</div>
              </div>
            </div>
          </div>

          {/* Maritime Herausforderungen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Maritime Klimaherausforderungen</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">🌬️ Starke Winde</h3>
                <p className="text-gray-700 mb-3">
                  Die Nähe zur Nordsee bringt häufige und starke Winde mit sich, die den Rasen 
                  austrocknen und mechanisch belasten können.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Windschutz durch Hecken/Zäune</li>
                  <li>• Niedrig wachsende Gräser wählen</li>
                  <li>• Häufigere Bewässerung</li>
                  <li>• Salzresistente Sorten</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">🧂 Salzige Luft</h3>
                <p className="text-gray-700 mb-3">
                  Meeresluft enthält Salz, das sich auf Rasenflächen niederschlägt und 
                  empfindliche Gräser schädigen kann.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Salztolerante Grassorten verwenden</li>
                  <li>• Regelmäßiges Abspülen bei starkem Salzwind</li>
                  <li>• Robuste Mischungen bevorzugen</li>
                  <li>• Drainage besonders wichtig</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">💧 Hohe Luftfeuchtigkeit</h3>
                <p className="text-gray-700 mb-3">
                  Das maritime Klima bringt hohe Luftfeuchtigkeit mit sich, die Pilzkrankheiten 
                  begünstigen kann.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gute Belüftung sicherstellen</li>
                  <li>• Regelmäßiges Vertikutieren</li>
                  <li>• Pilzpräventive Maßnahmen</li>
                  <li>• Morgendliche Bewässerung</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">🌧️ Wechselhaftes Wetter</h3>
                <p className="text-gray-700 mb-3">
                  Schnelle Wetteränderungen erfordern flexible Rasenpflege und 
                  anpassungsfähige Strategien.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Wetterprognose beachten</li>
                  <li>• Flexible Pflegepläne</li>
                  <li>• Wetterresistente Gräser</li>
                  <li>• Schnelle Reaktion bei Extremwetter</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Saisonale Tipps für Bremen */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Bremer Rasenpflege durchs Jahr</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">🌱 Frühjahr & Sommer</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>März-April:</strong> Vorsichtige Frühjahrspflege, Salzschäden reparieren</li>
                  <li><strong>Mai-Juni:</strong> Hauptwachstumszeit nutzen, regelmäßig düngen</li>
                  <li><strong>Juli-August:</strong> Windschutz beachten, Bewässerung anpassen</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">🍂 Herbst & Winter</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>September-Oktober:</strong> Wintervorbereitung, Sturmsicherung</li>
                  <li><strong>November-Dezember:</strong> Schutz vor Salzwasser und Stürmen</li>
                  <li><strong>Januar-Februar:</strong> Schäden begutachten, Reparaturen planen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bremer Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Bremer Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Schwachhausen & Horn (Inland)</h3>
                <p className="text-gray-700 mb-3">
                  Weniger windexponiert, größere Gartenflächen, weniger Salzbelastung.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Hochwertige Rasenpflege möglich</li>
                  <li>• Weniger maritime Einflüsse</li>
                  <li>• Standardmischungen verwendbar</li>
                  <li>• Längere Vegetationsperioden</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Vegesack & Blumenthal (Küstennah)</h3>
                <p className="text-gray-700 mb-3">
                  Direkte Wesereinflüsse, mehr Wind und Salzbelastung, robuste Lösungen nötig.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Salztolerante Rasenmischungen</li>
                  <li>• Intensivere Pflege erforderlich</li>
                  <li>• Windschutzmaßnahmen wichtig</li>
                  <li>• Regelmäßige Bodenanalyse</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Perfekter Rasen trotz Meeresklima
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI kennt die maritimen Herausforderungen und erstellt Ihren windresistenten Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Bremer Rasen optimieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bremen;