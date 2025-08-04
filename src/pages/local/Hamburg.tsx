import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Thermometer, Cloud, Leaf, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const Hamburg = () => {
  const navigate = useNavigate();

  const hamburgLocalInfo = {
    climate: "Ozeanisches Klima mit milden Wintern und mäßig warmen Sommern",
    soilType: "Lehmiger und sandiger Boden mit hoher Feuchtigkeit",
    bestGrassTypes: ["Englisches Weidelgras", "Wiesenrispengras", "Rotschwingel"],
    challenges: ["Hohe Luftfeuchtigkeit", "Häufige Niederschläge", "Moos- und Pilzbefall"],
    plantingSeasons: {
      spring: "Mitte April bis Ende Mai",
      autumn: "September bis Mitte Oktober"
    }
  };

  const structuredData = {
    type: "Service" as const,
    data: {
      "@type": "Service",
      "name": "KI-Rasenanalyse Hamburg",
      "provider": {
        "@type": "Organization",
        "name": "Rasenpilot"
      },
      "description": "Professionelle KI-gestützte Rasenanalyse speziell für Hamburg und Umgebung",
      "areaServed": {
        "@type": "City",
        "name": "Hamburg",
        "addressCountry": "DE"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Kostenlose KI-Rasenanalyse"
      }
    }
  };

  return (
    <>
      <SEO
        title="Rasenpflege Hamburg - KI-Rasenanalyse für Hamburg | Rasenpilot"
        description="Professionelle Rasenpflege in Hamburg mit KI-Analyse. Optimiert für feuchtes Nordseeklima und hohe Luftfeuchtigkeit. Kostenlose Analyse mit lokalem Expertenwissen."
        keywords="Rasenpflege Hamburg, Rasen Hamburg, Gartenpflege Hamburg, KI Rasenanalyse Hamburg, Rasen düngen Hamburg, Rasenpilot Hamburg"
        canonical="https://www.rasenpilot.com/local/hamburg"
        structuredData={structuredData}
        ogImage="/og-image.jpg"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-green-800">
                Rasenpflege Hamburg
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              KI-gestützte Rasenanalyse für Hamburg. Speziell angepasst an das 
              feuchte Nordseeklima und hohe Luftfeuchtigkeit der Hansestadt.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-12">
            <Button 
              size="lg"
              onClick={() => navigate('/lawn-analysis')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              Kostenlose Hamburg-Analyse starten
            </Button>
          </div>

          {/* Hamburg-specific Climate Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  Klima in Hamburg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{hamburgLocalInfo.climate}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Durchschnittlicher Niederschlag: 773mm/Jahr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Durchschnittstemperatur: 9.7°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Ideale Grasarten für Hamburg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hamburgLocalInfo.bestGrassTypes.map((grass, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{grass}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Care Tips */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Saisonale Rasenpflege in Hamburg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Frühjahr (März - Mai)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Erste Düngung ab Mitte März</li>
                    <li>• Vertikutieren bei stabiler Witterung</li>
                    <li>• Nachsaat: {hamburgLocalInfo.plantingSeasons.spring}</li>
                    <li>• Moosbekämpfung nach dem Winter</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Sommer (Juni - August)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Vorsicht vor Staunässe bei Regen</li>
                    <li>• Regelmäßige Belüftung des Rasens</li>
                    <li>• Pilzbefall-Prophylaxe</li>
                    <li>• Angepasste Bewässerung je nach Wetter</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Herbst (September - November)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Herbstdüngung mit Kalium-Schwerpunkt</li>
                    <li>• Nachsaat: {hamburgLocalInfo.plantingSeasons.autumn}</li>
                    <li>• Intensive Laubentfernung</li>
                    <li>• Drainage-Kontrolle vor dem Winter</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Winter (Dezember - Februar)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Schutz vor Schneeschimmel</li>
                    <li>• Drainage-Überwachung</li>
                    <li>• Rasenmäher-Wartung</li>
                    <li>• Vorbereitung auf feuchte Frühjahrs-Saison</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Challenges */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Häufige Rasenprobleme in Hamburg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {hamburgLocalInfo.challenges.map((challenge, index) => (
                  <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">{challenge}</h4>
                    <p className="text-sm text-red-700">
                      {challenge.includes('Luftfeuchtigkeit') && 'Regelmäßige Belüftung und resistente Grassorten verwenden.'}
                      {challenge.includes('Niederschläge') && 'Drainage verbessern und Staunässe vermeiden.'}
                      {challenge.includes('Moos') && 'pH-Wert regulieren und Belüftung optimieren.'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final CTA */}
          <div className="text-center">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">
                  Bereit für Ihren perfekten Hamburger Rasen?
                </h2>
                <p className="text-gray-700 mb-6">
                  Unsere KI berücksichtigt alle Hamburg-spezifischen Faktoren für optimale Ergebnisse.
                </p>
                <Button 
                  size="lg"
                  onClick={() => navigate('/lawn-analysis')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Jetzt kostenlose Analyse starten
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hamburg;