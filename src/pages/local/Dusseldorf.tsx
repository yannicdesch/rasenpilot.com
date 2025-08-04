import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Droplets, Thermometer, Calendar } from 'lucide-react';

const Dusseldorf = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Düsseldorf | KI-Rasenberatung für die Rheinmetropole | Rasenpilot"
        description="Professionelle Rasenpflege in Düsseldorf: KI-gestützte Rasenanalyse für das rheinische Klima. Kostenloser Pflegeplan für Düsseldorfer Gärten."
        canonical="https://www.rasenpilot.com/local/dusseldorf"
        keywords="Rasenpflege Düsseldorf, Rasenberatung Düsseldorf, Rasen düngen Düsseldorf, KI Rasenanalyse Düsseldorf, Gartenpflege Düsseldorf, Rasenpilot Düsseldorf"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Düsseldorf - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Düsseldorf und Umgebung',
            areaServed: 'Düsseldorf, Nordrhein-Westfalen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Droplets className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-blue-600">Düsseldorf</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Rheinmetropole - optimiert für feuchtes Kontinentalklima
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              ⚡ Kostenlose Düsseldorfer Rasenanalyse
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Droplets className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Rheinisches Klima</h3>
              <p className="text-gray-700">
                Düsseldorf profitiert von milden Temperaturen und ausreichend Niederschlag (750mm/Jahr). 
                Optimale Bedingungen für üppiges Rasenwachstum - richtige Pflege vorausgesetzt.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <Thermometer className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Moderat-Maritime Einflüsse</h3>
              <p className="text-gray-700">
                Die Nähe zum Rhein und atlantische Einflüsse sorgen für ausgeglichene Temperaturen. 
                Längere Wachstumsperioden ermöglichen intensive Rasenpflege.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Düsseldorfer Stadtteile & Rasenpflege</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Oberkassel & Niederkassel (Rheinlage)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Hohe Luftfeuchtigkeit</li>
                  <li>• Pilzkrankheiten vorbeugen</li>
                  <li>• Gute Belüftung wichtig</li>
                  <li>• Premium Rasenqualität möglich</li>
                </ul>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Kaiserswerth & Lohausen (Norden)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Etwas kühler und feuchter</li>
                  <li>• Längere Vegetationszeit</li>
                  <li>• Weniger Hitzestress</li>
                  <li>• Optimale Wachstumsbedingungen</li>
                </ul>
              </div>
              
              <div className="border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Benrath & Urdenbach (Süden)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Größere Gartenflächen</li>
                  <li>• Weniger urban geprägt</li>
                  <li>• Villenlagen mit Zierrasen</li>
                  <li>• Professionelle Pflege üblich</li>
                </ul>
              </div>
              
              <div className="border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Stadtmitte & Pempelfort</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Kleingärten und Innenhöfe</li>
                  <li>• Schatten durch Bebauung</li>
                  <li>• Verdichteter Boden</li>
                  <li>• Intensive Pflege erforderlich</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Düsseldorfer Rasenpflege-Besonderheiten</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">🌊 Rheinstadt-Vorteil nutzen</h3>
              <p className="text-gray-700 mb-3">
                <strong>Feuchtigkeit:</strong> Das feuchte Klima begünstigt das Rasenwachstum, kann aber auch 
                Pilzerkrankungen fördern. Regelmäßiges Vertikutieren und gute Belüftung sind essentiell.
              </p>
              <p className="text-gray-700">
                <strong>Milde Winter:</strong> Nutzen Sie die milden Düsseldorfer Winter für Pflegemaßnahmen. 
                Oft ist Rasenpflege bis November/Dezember möglich.
              </p>
            </div>
          </div>

          <div className="text-center bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Düsseldorfer Eleganz im Garten
            </h2>
            <p className="text-gray-600 mb-6">
              Ihre Stadt ist elegant - Ihr Rasen sollte es auch sein. Starten Sie jetzt mit der KI-Analyse.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Eleganten Düsseldorfer Rasen starten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dusseldorf;