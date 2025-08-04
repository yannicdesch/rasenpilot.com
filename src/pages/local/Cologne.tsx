import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Thermometer, Cloud, Calendar } from 'lucide-react';

const Cologne = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Köln | KI-Rasenberatung für Kölner Gärten | Rasenpilot"
        description="Professionelle Rasenpflege in Köln: KI-gestützte Rasenanalyse für das rheinische Klima. Kostenloser Pflegeplan speziell für Kölner Rasenflächen."
        canonical="https://www.rasenpilot.com/local/cologne"
        keywords="Rasenpflege Köln, Rasenberatung Köln, Rasen düngen Köln, KI Rasenanalyse Köln, Gartenpflege Köln, Rasenpilot Köln"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Köln - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Köln und Umgebung',
            areaServed: 'Köln, Nordrhein-Westfalen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-green-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-green-600">Köln</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung speziell für das rheinische Klima und Kölner Bodenverhältnisse
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              🌱 Kostenlose Kölner Rasenanalyse starten
            </Button>
          </div>

          {/* Köln Spezifisch */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Thermometer className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Rheinisches Klima</h3>
              <p className="text-gray-700">
                Köln profitiert von milden Wintern und warmen Sommern. Unser KI-System berücksichtigt die 
                typischen 650mm Niederschlag und die lokalen Temperaturschwankungen für optimale Rasenpflege.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <Cloud className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Stadtklima beachten</h3>
              <p className="text-gray-700">
                Das Kölner Stadtklima mit Wärmeinseleffekt erfordert angepasste Bewässerung. 
                Besonders in den Vierteln wie Lindenthal und Müngersdorf ist präzise Pflege wichtig.
              </p>
            </div>
          </div>

          {/* Kölner Rasenpflegekalender */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Kölner Rasenpflegekalender 2024</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">März - Mai</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Erste Düngung (Mitte März)</li>
                  <li>• Vertikutieren (April)</li>
                  <li>• Nachsaat wartezeit beachten</li>
                  <li>• Moos bekämpfen</li>
                </ul>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Juni - August</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Regelmäßig wässern (morgens)</li>
                  <li>• Schnitthöhe erhöhen (5cm)</li>
                  <li>• Sommerdüngung (Ende Juni)</li>
                  <li>• Schädlinge kontrollieren</li>
                </ul>
              </div>
              
              <div className="border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">September - November</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Herbstdüngung (September)</li>
                  <li>• Laub entfernen</li>
                  <li>• Letzter Schnitt (November)</li>
                  <li>• Wintervorbereitung</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Kölner Besonderheiten */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rasenpflege in Kölner Stadtteilen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Innenstadt & Altstadt</h3>
                <p className="text-gray-700 mb-3">
                  Kleine Rasenflächen, oft schattig. Spezielle Schattenmischungen und häufigere Bewässerung nötig.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Schattenrasen-Mischungen verwenden</li>
                  <li>• Drainage verbessern</li>
                  <li>• Luftverschmutzung berücksichtigen</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Lindenthal & Müngersdorf</h3>
                <p className="text-gray-700 mb-3">
                  Größere Gärten, gute Bedingungen. Optimaler Standort für Zierrasen und anspruchsvolle Pflege.
                </p>
                <ul className="text-sm text-gray-600">
                  <li>• Zierrasen-Qualität möglich</li>
                  <li>• Regelmäßige Profipflege</li>
                  <li>• Bewässerungsanlage empfohlen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-green-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bereit für den perfekten Kölner Rasen?
            </h2>
            <p className="text-gray-600 mb-6">
              Starten Sie jetzt mit unserer kostenlosen KI-Analyse, optimiert für das Kölner Klima.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Jetzt kostenlos analysieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cologne;