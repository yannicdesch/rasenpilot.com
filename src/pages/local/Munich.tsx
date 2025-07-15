import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Thermometer, Cloud, Leaf, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const Munich = () => {
  const navigate = useNavigate();

  const municLocalInfo = {
    climate: "Kontinentales Klima mit warmen Sommern und kalten Wintern",
    soilType: "Lehmiger Boden mit guter Drainage",
    bestGrassTypes: ["Deutsches Weidelgras", "Rotschwingel", "Wiesenrispengras"],
    challenges: ["Späte Fröste im Frühjahr", "Trockene Sommer", "Schneeschimmel im Winter"],
    plantingSeasons: {
      spring: "Mitte April bis Ende Mai",
      autumn: "Mitte September bis Mitte Oktober"
    }
  };

  const structuredData = {
    type: "Service" as const,
    data: {
      "@type": "Service",
      "name": "KI-Rasenanalyse München",
      "provider": {
        "@type": "Organization",
        "name": "Rasenpilot"
      },
      "description": "Professionelle KI-gestützte Rasenanalyse speziell für München und Umgebung",
      "areaServed": {
        "@type": "City",
        "name": "München",
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
        title="Rasenpflege München - KI-Rasenanalyse für München | Rasenpilot"
        description="Professionelle Rasenpflege in München mit KI-Analyse. Klimaangepasste Pflegetipps für Münchener Böden und Wetter. Kostenlose Analyse mit lokalem Expertenwissen."
        keywords="Rasenpflege München, Rasen München, Gartenpflege München, KI Rasenanalyse München, Rasen düngen München, Rasenpilot München"
        canonical="/local/munich"
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
                Rasenpflege München
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              KI-gestützte Rasenanalyse speziell für München und Umgebung. 
              Klimaangepasste Pflegetipps für perfekte Rasenergebnisse.
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
              Kostenlose München-Analyse starten
            </Button>
          </div>

          {/* Munich-specific Climate Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  Klima in München
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{municLocalInfo.climate}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Durchschnittlicher Niederschlag: 954mm/Jahr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Durchschnittstemperatur: 8.6°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Ideale Grasarten für München
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {municLocalInfo.bestGrassTypes.map((grass, index) => (
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
              <CardTitle>Saisonale Rasenpflege in München</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Frühjahr (März - Mai)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Erste Düngung ab Mitte März</li>
                    <li>• Vertikutieren bei Temperaturen über 10°C</li>
                    <li>• Nachsaat: {municLocalInfo.plantingSeasons.spring}</li>
                    <li>• Vorsicht vor Spätfrösten!</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Sommer (Juni - August)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Erhöhte Schnitthöhe (4-5cm) wegen Trockenheit</li>
                    <li>• Intensive Bewässerung in den Morgenstunden</li>
                    <li>• Regelmäßige Kontrolle auf Trockenstress</li>
                    <li>• Keine Düngung bei Hitze über 25°C</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Herbst (September - November)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Herbstdüngung mit Kalium-Schwerpunkt</li>
                    <li>• Nachsaat: {municLocalInfo.plantingSeasons.autumn}</li>
                    <li>• Regelmäßiges Laub entfernen</li>
                    <li>• Letzte Mahd Ende Oktober</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Winter (Dezember - Februar)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Rasen nicht betreten bei Frost</li>
                    <li>• Schneeschimmel-Prophylaxe</li>
                    <li>• Rasenmäher winterfest machen</li>
                    <li>• Planung für das nächste Jahr</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Challenges */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Häufige Rasenprobleme in München</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {municLocalInfo.challenges.map((challenge, index) => (
                  <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">{challenge}</h4>
                    <p className="text-sm text-red-700">
                      {challenge.includes('Fröste') && 'Verwenden Sie robuste Grassorten und schützen Sie junge Triebe.'}
                      {challenge.includes('Sommer') && 'Tiefe, seltene Bewässerung statt häufiger oberflächlicher Bewässerung.'}
                      {challenge.includes('Schneeschimmel') && 'Gute Drainage und Herbstdüngung ohne Stickstoff.'}
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
                  Bereit für Ihren perfekten Münchener Rasen?
                </h2>
                <p className="text-gray-700 mb-6">
                  Unsere KI berücksichtigt alle München-spezifischen Faktoren für optimale Ergebnisse.
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

export default Munich;