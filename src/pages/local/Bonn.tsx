import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Crown, AlertTriangle, Thermometer, Calendar, Castle } from 'lucide-react';

const Bonn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Bonn | KI-Rasenberatung für die ehemalige Hauptstadt | Rasenpilot"
        description="Professionelle Rasenpflege in Bonn: KI-gestützte Rasenanalyse für rheinisches Klima. Kostenloser Pflegeplan für Bonner Gärten."
        canonical="https://www.rasenpilot.com/local/bonn"
        keywords="Rasenpflege Bonn, Rasenberatung Bonn, Rasen düngen Bonn, KI Rasenanalyse Bonn, Gartenpflege Rheinland, Rasenpilot Bonn"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Bonn - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Bonn und das Rheinland',
            areaServed: 'Bonn, Nordrhein-Westfalen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-purple-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-purple-600">Bonn</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Beethoven-Stadt - optimiert für rheinisches Klima und Regierungsqualität
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              👑 Kostenlose Bonner Rasenanalyse
            </Button>
          </div>

          {/* Bonner Klima */}
          <div className="bg-purple-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🌤️ Bonner Rheinlandklima</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">720mm</div>
                <div className="text-sm text-gray-600">Jahresniederschlag</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">10.2°C</div>
                <div className="text-sm text-gray-600">Jahresdurchschnitt</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Mild</div>
                <div className="text-sm text-gray-600">Rheineinfluss</div>
              </div>
            </div>
          </div>

          {/* Hauptstadt-Charakter */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Bonner Rasen-Charakteristika</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">👑 Regierungsqualität</h3>
                <p className="text-gray-700 mb-3">
                  Als ehemalige Hauptstadt hat Bonn hohe Standards für Grünflächen entwickelt. 
                  Regierungsgebäude und Botschaften setzen Maßstäbe.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Repräsentative Rasenqualität</li>
                  <li>• Professionelle Pflegestandards</li>
                  <li>• Ganzjährig perfekte Optik</li>
                  <li>• Hochwertige Rasenmischungen</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">🌊 Rheinnahe Lage</h3>
                <p className="text-gray-700 mb-3">
                  Die Nähe zum Rhein bringt milde Temperaturen und hohe Luftfeuchtigkeit. 
                  Optimale Bedingungen für üppiges Rasenwachstum.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ausgeglichenes Mikroklima</li>
                  <li>• Hohe Luftfeuchtigkeit nutzen</li>
                  <li>• Pilzkrankheiten vorbeugen</li>
                  <li>• Gute Belüftung wichtig</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">🎼 Kulturelle Ansprüche</h3>
                <p className="text-gray-700 mb-3">
                  Als Geburtsstadt Beethovens und UN-Stadt hat Bonn eine kultivierte 
                  Gartenkultur mit ästhetischen Ansprüchen.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ästhetische Rasenpflege</li>
                  <li>• Klassische Gartengestaltung</li>
                  <li>• Kulturelle Rasentradition</li>
                  <li>• Kunstvolle Pflege</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">🏛️ Diplomatenviertel</h3>
                <p className="text-gray-700 mb-3">
                  Internationale Organisationen und Botschaften pflegen Gärten nach 
                  höchsten internationalen Standards.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Internationale Standards</li>
                  <li>• Ganzjährige Perfektion</li>
                  <li>• Prestige-Rasenpflege</li>
                  <li>• Diplomatische Qualität</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bonner Pflegestandards */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Castle className="h-6 w-6 text-gold-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Bonner Rasen-Standards</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">🏆 Premium-Qualität</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Wöchentliche Profipflege</li>
                  <li>• Hochwertige Düngemittel</li>
                  <li>• Präzise Bewässerung</li>
                  <li>• Regelmäßige Kontrollen</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">🌿 Nachhaltigkeit</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Ökologische Methoden</li>
                  <li>• Umweltfreundliche Pflege</li>
                  <li>• Ressourcenschonung</li>
                  <li>• Klimafreundlich</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">⚡ Effizienz</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Moderne Technik nutzen</li>
                  <li>• Zeitoptimierte Pflege</li>
                  <li>• Automatisierte Systeme</li>
                  <li>• Smart Gardening</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bonner Stadtteile */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Bonner Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Bad Godesberg & Plittersdorf</h3>
                <p className="text-gray-700 mb-3">
                  Diplomatenviertel mit höchsten Ansprüchen, repräsentative Gärten.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Internationale Standards</li>
                  <li>• Luxus-Rasenpflege</li>
                  <li>• Prestige-Qualität</li>
                  <li>• Ganzjährige Perfektion</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Poppelsdorf & Kessenich</h3>
                <p className="text-gray-700 mb-3">
                  Universitätsviertel mit jungen Familien, moderne Gartenansprüche.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Familienfreundliche Lösungen</li>
                  <li>• Pflegeleichte Rasenflächen</li>
                  <li>• Moderne Methoden</li>
                  <li>• Kosteneffiziente Pflege</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-purple-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Regierungsqualität für Ihren Rasen
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI berücksichtigt die Bonner Ansprüche und erstellt Ihren diplomatentauglichen Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Bonner Rasen-Exzellenz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bonn;