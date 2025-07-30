import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, Thermometer, Calendar } from 'lucide-react';

const Stuttgart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Rasenpflege Stuttgart | KI-Rasenberatung für das Stuttgarter Kessel | Rasenpilot"
        description="Professionelle Rasenpflege in Stuttgart: KI-gestützte Rasenanalyse für Hanglage und Kessellage. Kostenloser Pflegeplan für Stuttgarter Gärten."
        canonical="/local/stuttgart"
        keywords="Rasenpflege Stuttgart, Rasenberatung Stuttgart, Rasen düngen Stuttgart, KI Rasenanalyse Stuttgart, Gartenpflege Stuttgart Kessel, Rasenpilot Stuttgart"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpflege Stuttgart - KI-Rasenberatung',
            description: 'Professionelle KI-gestützte Rasenpflege für Stuttgart und Umgebung',
            areaServed: 'Stuttgart, Baden-Württemberg',
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
                Rasenpflege in <span className="text-green-600">Stuttgart</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Spezialisierte KI-Rasenberatung für Hanglage und Kessellage - perfekt für Stuttgarter Verhältnisse
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              🏔️ Kostenlose Stuttgarter Rasenanalyse
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-green-50 p-6 rounded-lg">
              <Mountain className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Stuttgarter Kessellage</h3>
              <p className="text-gray-700">
                Die einzigartige Kessellage sorgt für warme Sommer und milde Winter. 
                Unser KI-System berücksichtigt Hangneigung, Mikroklima und lokale Windverhältnisse.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <Thermometer className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Hanglagen-Expertise</h3>
              <p className="text-gray-700">
                Viele Stuttgarter Gärten liegen am Hang. Spezielle Düngung, Bewässerung und 
                Rasenmischungen für Erosionsschutz sind essentiell.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Stuttgarter Bezirke & Rasenpflege</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Degerloch & Sillenbuch (Höhenlage)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Kühleres Mikroklima</li>
                  <li>• Längere Vegetationsperiode</li>
                  <li>• Weniger Bewässerung nötig</li>
                  <li>• Optimale Wachstumsbedingungen</li>
                </ul>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Bad Cannstatt & Untertürkheim (Tallage)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Wärmere Temperaturen</li>
                  <li>• Mehr Bewässerung erforderlich</li>
                  <li>• Frühere Vegetationszeit</li>
                  <li>• Hitzestress im Sommer</li>
                </ul>
              </div>
              
              <div className="border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Vaihingen & Möhringen (Hanglage)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Erosionsschutz wichtig</li>
                  <li>• Spezielle Rasenmischungen</li>
                  <li>• Terrassierung möglich</li>
                  <li>• Drainage beachten</li>
                </ul>
              </div>
              
              <div className="border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Stuttgart-West & -Süd (Zentral)</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Urbane Bedingungen</li>
                  <li>• Begrenzte Gartenflächen</li>
                  <li>• Verdichteter Boden</li>
                  <li>• Regelmäßige Belüftung</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Besonderheiten der Stuttgarter Rasenpflege</h2>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Profi-Tipp für Stuttgart</h3>
              <p className="text-gray-700 mb-3">
                <strong>Hanglagen:</strong> Verwenden Sie tiefwurzelnde Gräser wie Rotschwingel für besseren Halt. 
                Bewässern Sie häufiger, aber mit weniger Wasser pro Durchgang, um Abschwemmung zu vermeiden.
              </p>
              <p className="text-gray-700">
                <strong>Kessellage:</strong> Die warmen Sommer erfordern erhöhte Schnitthöhe (5-6cm) und 
                morgendliche Bewässerung um 5-7 Uhr für optimale Wasseraufnahme.
              </p>
            </div>
          </div>

          <div className="text-center bg-green-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Perfekter Rasen trotz Hanglage?
            </h2>
            <p className="text-gray-600 mb-6">
              Unsere KI kennt die Stuttgarter Herausforderungen und erstellt Ihren individuellen Pflegeplan.
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Jetzt Stuttgarter Rasen optimieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stuttgart;