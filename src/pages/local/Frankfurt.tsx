import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Thermometer, Building, Calendar } from 'lucide-react';

const Frankfurt = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Frankfurt | KI-Rasenberatung für Frankfurt am Main | Rasenpilot"
        description="Professionelle Rasenpflege in Frankfurt: KI-gestützte Rasenanalyse für das Frankfurter Klima. Kostenloser Pflegeplan für Frankfurter Gärten."
        canonical="https://www.rasenpilot.com/local/frankfurt"
        keywords="Rasenpflege Frankfurt, Rasenberatung Frankfurt, Rasen düngen Frankfurt, KI Rasenanalyse Frankfurt, Gartenpflege Frankfurt am Main, Rasenpilot Frankfurt"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Frankfurt - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Frankfurt am Main und Umgebung',
            areaServed: 'Frankfurt am Main, Hessen',
            provider: 'Rasenpilot'
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Rasenpflege in <span className="text-blue-600">Frankfurt</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              KI-gestützte Rasenberatung für die Finanzmetropole - speziell für urbane Gärten optimiert
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              🏙️ Kostenlose Frankfurter Rasenanalyse
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Thermometer className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Kontinentales Stadtklima</h3>
              <p className="text-gray-700">
                Frankfurt kombiniert kontinentales Klima mit Großstadt-Wärmeinsel. 
                Heiße Sommer erfordern angepasste Bewässerung, milde Winter ermöglichen längere Wachstumszeiten.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <Building className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Urbane Herausforderungen</h3>
              <p className="text-gray-700">
                Begrenzte Gartenflächen, Luftverschmutzung und Bodenverdichtung erfordern 
                spezialisierte Rasenpflege für Frankfurter Verhältnisse.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frankfurter Stadtteile & Rasenpflege</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Westend & Sachsenhausen</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Hochwertige Villenlagen</li>
                  <li>• Große Rasenflächen möglich</li>
                  <li>• Premium-Rasenpflege</li>
                  <li>• Professionelle Bewässerung</li>
                </ul>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Nordend & Bornheim</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Kleinere Gartenflächen</li>
                  <li>• Altbau-Gärten</li>
                  <li>• Schatten durch Bebauung</li>
                  <li>• Robuste Rasenmischungen</li>
                </ul>
              </div>
              
              <div className="border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Innenstadt</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Dachgärten & Terrassen</li>
                  <li>• Künstliche Rasensysteme</li>
                  <li>• Intensive Pflege nötig</li>
                  <li>• Spezielle Substrate</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Frankfurt verdient den perfekten Rasen
            </h2>
            <p className="text-gray-600 mb-6">
              Auch in der Großstadt ist ein makelloser Rasen möglich. Unsere KI kennt die Frankfurter Besonderheiten.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Jetzt Frankfurter Rasen analysieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frankfurt;