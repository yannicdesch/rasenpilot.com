import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Calendar, ArrowRight, Check, Target, Clock, Shield, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import MainNavigation from '@/components/MainNavigation';
import FAQ from '@/components/FAQ';
import { Badge } from '@/components/ui/badge';

const RasenpflegeOesterreich = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO 
        title="Rasenanalyse Österreich — KI-Pflegeplan für österreichische Gärten | Rasenpilot"
        description="Lass deinen Rasen kostenlos von KI analysieren. Angepasst an Österreichs Klima & Böden — von Wien bis Salzburg. Ergebnis in 30 Sekunden, ohne Anmeldung."
        canonical="/rasenpflege-oesterreich"
        keywords="rasenpflege österreich, rasenanalyse österreich, gartenpflege wien, rasen graz, rasenpilot österreich, rasen salzburg, rasen innsbruck"
        structuredData={{
          type: 'Service' as const,
          data: {
            "@type": "Service",
            name: "KI-Rasenanalyse Österreich",
            provider: { "@type": "Organization", name: "Rasenpilot" },
            description: "Kostenlose KI-gestützte Rasenanalyse für ganz Österreich",
            areaServed: { "@type": "Country", name: "Österreich", addressCountry: "AT" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", description: "Kostenlose KI-Rasenanalyse" }
          }
        }}
      />

      <MainNavigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <Badge className="bg-red-50 text-red-700 border-red-200">🇦🇹 Für Österreich</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            Rasenanalyse für <span className="text-primary">Österreich</span> — kostenlos & sofort
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Foto hochladen → KI analysiert deinen Rasen → Persönlicher Pflegeplan in 30 Sekunden. 
            Angepasst an österreichisches Klima und Bodenverhältnisse.
          </p>
          <Button 
            onClick={() => navigate('/lawn-analysis')} 
            size="lg"
            className="text-lg py-6 px-12 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Camera className="mr-2 h-5 w-5" />
            Rasen kostenlos analysieren →
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            ✅ Kostenlos · 🔒 DSGVO-konform · ⚡ 30 Sekunden
          </p>
        </div>
      </section>

      {/* Austrian Climate & Regions */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
            Rasenpflege in Österreich — das musst du wissen
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Österreichs vielfältige Klimazonen erfordern eine angepasste Rasenpflege. Unsere KI berücksichtigt regionale Besonderheiten.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wien */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🏛️ Wien & Umgebung</h3>
                <p className="text-sm text-muted-foreground mb-3">Pannonisches Klima — warm & trocken</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Heiße Sommer erfordern regelmäßige Bewässerung</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Tschernosem-Böden ideal für Zierrasen</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Vertikutieren ab Mitte März möglich</li>
                </ul>
              </CardContent>
            </Card>

            {/* Graz / Steiermark */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🍇 Graz & Steiermark</h3>
                <p className="text-sm text-muted-foreground mb-3">Illyrisches Klima — feucht & mild</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Höherer Niederschlag fördert Mooswachstum</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Regelmäßiges Vertikutieren gegen Moos</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Lehmige Böden brauchen Belüftung</li>
                </ul>
              </CardContent>
            </Card>

            {/* Salzburg */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">⛰️ Salzburg & Alpenvorland</h3>
                <p className="text-sm text-muted-foreground mb-3">Alpines Übergangsklima — regenreich</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Hoher Niederschlag: Drainage beachten</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Schattenrasen-Mischungen für Hanglagen</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Späte erste Düngung (April/Mai)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Innsbruck / Tirol */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🏔️ Innsbruck & Tirol</h3>
                <p className="text-sm text-muted-foreground mb-3">Inneralpines Klima — kalt & sonnig</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Kurze Vegetationsperiode beachten</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Frostresistente Grasarten wählen</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Herbstdüngung mit Kalium für Winterhärte</li>
                </ul>
              </CardContent>
            </Card>

            {/* Linz / OÖ */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🏭 Linz & Oberösterreich</h3>
                <p className="text-sm text-muted-foreground mb-3">Gemäßigtes Klima — ausgeglichen</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Gute Bedingungen für Sport- & Spielrasen</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Regelmäßig mähen ab April</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Kalkung gegen saure Böden</li>
                </ul>
              </CardContent>
            </Card>

            {/* Klagenfurt / Kärnten */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">☀️ Klagenfurt & Kärnten</h3>
                <p className="text-sm text-muted-foreground mb-3">Südalpines Klima — sonnig & warm</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Längste Rasensaison in Österreich</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Bewässerung im Hochsommer wichtig</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Ideale Bedingungen für Zierrasen</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            So funktioniert's — in 3 Schritten
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Camera, num: '1', title: 'Foto hochladen', desc: 'Rasen mit dem Smartphone fotografieren und hochladen.' },
              { icon: Target, num: '2', title: 'KI analysiert', desc: 'Unsere KI erkennt Probleme und bewertet deinen Rasen.' },
              { icon: Calendar, num: '3', title: 'Pflegeplan erhalten', desc: 'Persönlicher Monatsplan, angepasst an österreichisches Klima.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="text-lg py-6 px-12 rounded-2xl font-bold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Jetzt Rasen analysieren <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Austrian-specific tips */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Rasenpflege-Tipps für Österreich
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              Die Rasenpflege in Österreich unterscheidet sich deutlich von anderen Ländern. Das alpine Klima mit kalten Wintern 
              und feuchtwarmen Sommern stellt besondere Anforderungen an Grasarten und Pflegemaßnahmen.
            </p>
            <h3 className="text-foreground">Beste Grasarten für Österreich</h3>
            <p>
              Für österreichische Gärten eignen sich besonders <strong>Rotschwingel</strong> (Festuca rubra) für Schattenlagen, 
              <strong> Deutsches Weidelgras</strong> (Lolium perenne) für strapazierfähige Flächen und <strong>Wiesenrispe</strong> (Poa pratensis) 
              für dichte, sattgrüne Rasenflächen. In höheren Lagen empfehlen wir zusätzlich <strong>Straußgras</strong> für seine Frostresistenz.
            </p>
            <h3 className="text-foreground">Saisonaler Pflegekalender</h3>
            <p>
              <strong>Frühjahr (März–Mai):</strong> Erste Düngung je nach Höhenlage ab März (Flachland) bis Mai (alpine Regionen). 
              Vertikutieren bei Bodentemperaturen über 10°C. Nachsaat bei kahlen Stellen.
            </p>
            <p>
              <strong>Sommer (Juni–August):</strong> Regelmäßig mähen (einmal pro Woche). Bei Hitze Schnitthöhe auf 5 cm erhöhen. 
              Morgens oder abends bewässern — besonders in Wien und dem Burgenland.
            </p>
            <p>
              <strong>Herbst (September–November):</strong> Herbstdüngung mit Kalium für Winterhärte. Laub entfernen. 
              Letzte Nachsaat bis Anfang Oktober.
            </p>
            <p>
              <strong>Winter (Dezember–Februar):</strong> Rasen bei Frost nicht betreten. Kein Streusalz auf Rasenflächen. 
              Mäher warten und Saatgut für das Frühjahr bestellen.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Bereit für den perfekten Rasen in Österreich?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Unsere KI berücksichtigt österreichisches Klima, Bodenverhältnisse und regionale Besonderheiten.
          </p>
          <Button 
            onClick={() => navigate('/lawn-analysis')} 
            size="lg"
            className="text-lg py-6 px-12 rounded-2xl font-bold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Kostenlose Analyse starten 🇦🇹
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Funktioniert für ganz Österreich — Wien, Graz, Salzburg, Innsbruck, Linz, Klagenfurt und mehr.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RasenpflegeOesterreich;
