import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Thermometer, Cloud, Leaf, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const Berlin = () => {
  const navigate = useNavigate();

  const berlinLocalInfo = {
    climate: "Gemäßigtes Kontinentalklima mit mäßig warmen Sommern und kalten Wintern",
    soilType: "Sandiger Boden mit teilweise lehmigen Bereichen",
    bestGrassTypes: ["Rotschwingel", "Straußgras", "Wiesenlieschgras"],
    challenges: ["Sandige Böden (schnelle Austrocknung)", "Starke Temperaturschwankungen", "Luftverschmutzung"],
    plantingSeasons: {
      spring: "Ende April bis Mitte Mai",
      autumn: "Mitte September bis Anfang Oktober"
    }
  };

  const structuredData = {
    type: "Service" as const,
    data: {
      "@type": "Service",
      "name": "KI-Rasenanalyse Berlin",
      "provider": {
        "@type": "Organization",
        "name": "Rasenpilot"
      },
      "description": "Professionelle KI-gestützte Rasenanalyse speziell für Berlin und Umgebung",
      "areaServed": {
        "@type": "City",
        "name": "Berlin",
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
        title="Rasenpflege Berlin - KI-Rasenanalyse für Berlin | Rasenpilot"
        description="Professionelle Rasenpflege in Berlin mit KI-Analyse. Angepasst an sandige Böden und Stadtklima. Kostenlose Analyse mit lokalem Expertenwissen für Berlin."
        keywords="Rasenpflege Berlin, Rasen Berlin, Gartenpflege Berlin, KI Rasenanalyse Berlin, Rasen düngen Berlin, Rasenpilot Berlin"
        canonical="/local/berlin"
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
                Rasenpflege Berlin
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              KI-gestützte Rasenanalyse für Berlin. Optimiert für sandige Böden 
              und das spezielle Stadtklima der Hauptstadt.
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
              Kostenlose Berlin-Analyse starten
            </Button>
          </div>

          {/* Berlin-specific Climate Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  Klima in Berlin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{berlinLocalInfo.climate}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Durchschnittlicher Niederschlag: 571mm/Jahr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Durchschnittstemperatur: 9.6°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Ideale Grasarten für Berlin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {berlinLocalInfo.bestGrassTypes.map((grass, index) => (
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
              <CardTitle>Saisonale Rasenpflege in Berlin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Frühjahr (März - Mai)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Frühe Düngung ab Anfang März möglich</li>
                    <li>• Vertikutieren bei stabilem Wetter</li>
                    <li>• Nachsaat: {berlinLocalInfo.plantingSeasons.spring}</li>
                    <li>• Bodenverbesserung mit Kompost</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Sommer (Juni - August)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Intensive Bewässerung wegen sandiger Böden</li>
                    <li>• Regelmäßige Düngung alle 4-6 Wochen</li>
                    <li>• Schutz vor Hitzeinseln im Stadtbereich</li>
                    <li>• Höhere Schnitthöhe bei Trockenheit</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Herbst (September - November)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Herbstdüngung mit Kalium-Betonung</li>
                    <li>• Nachsaat: {berlinLocalInfo.plantingSeasons.autumn}</li>
                    <li>• Laub regelmäßig entfernen</li>
                    <li>• Wintervorbereitung bei frühen Frösten</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Winter (Dezember - Februar)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Schutz vor Streusalz an Gehwegen</li>
                    <li>• Drainage prüfen (Staunässe vermeiden)</li>
                    <li>• Rasenmäher-Wartung</li>
                    <li>• Planung für Frühjahrsmaßnahmen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Challenges */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Häufige Rasenprobleme in Berlin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {berlinLocalInfo.challenges.map((challenge, index) => (
                  <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">{challenge}</h4>
                    <p className="text-sm text-red-700">
                      {challenge.includes('Sandige') && 'Häufigere Bewässerung und Bodenverbesserung mit Kompost erforderlich.'}
                      {challenge.includes('Temperaturschwankungen') && 'Robuste Grasarten wählen und Winterschutz verwenden.'}
                      {challenge.includes('Luftverschmutzung') && 'Regelmäßige Reinigung und widerstandsfähige Sorten bevorzugen.'}
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
                  Bereit für Ihren perfekten Berliner Rasen?
                </h2>
                <p className="text-gray-700 mb-6">
                  Unsere KI berücksichtigt alle Berlin-spezifischen Faktoren für optimale Ergebnisse.
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

export default Berlin;