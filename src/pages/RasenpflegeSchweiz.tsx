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

const RasenpflegeSchweiz = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO 
        title="Rasenanalyse Schweiz — KI-Pflegeplan für Schweizer Gärten | Rasenpilot"
        description="Lass deinen Rasen kostenlos von KI analysieren. Angepasst an Schweizer Klima & Böden — von Zürich bis Genf. Ergebnis in 30 Sekunden, ohne Anmeldung."
        canonical="/rasenpflege-schweiz"
        keywords="rasenpflege schweiz, rasenanalyse schweiz, gartenpflege zürich, rasen bern, rasenpilot schweiz, rasen basel, rasen luzern"
        structuredData={{
          type: 'Service' as const,
          data: {
            "@type": "Service",
            name: "KI-Rasenanalyse Schweiz",
            provider: { "@type": "Organization", name: "Rasenpilot" },
            description: "Kostenlose KI-gestützte Rasenanalyse für die gesamte Schweiz",
            areaServed: { "@type": "Country", name: "Schweiz", addressCountry: "CH" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "CHF", description: "Kostenlose KI-Rasenanalyse" }
          }
        }}
      />

      <MainNavigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <Badge className="bg-red-50 text-red-700 border-red-200">🇨🇭 Für die Schweiz</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            Rasenanalyse für die <span className="text-primary">Schweiz</span> — kostenlos & sofort
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Foto hochladen → KI analysiert deinen Rasen → Persönlicher Pflegeplan in 30 Sekunden. 
            Angepasst an Schweizer Klima, Böden und Höhenlagen.
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
            ✅ Kostenlos · 🔒 DSG-konform · ⚡ 30 Sekunden
          </p>
        </div>
      </section>

      {/* Swiss Climate & Regions */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
            Rasenpflege in der Schweiz — regional angepasst
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Vom Mittelland bis in die Alpen — die Schweiz bietet einzigartige Herausforderungen für die Rasenpflege.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Zürich */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🏙️ Zürich & Mittelland</h3>
                <p className="text-sm text-muted-foreground mb-3">Gemässigtes Klima — ideal für Rasen</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Beste Bedingungen für Zier- & Spielrasen</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Moränenböden bieten gute Nährstoffversorgung</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Erste Düngung ab Mitte März</li>
                </ul>
              </CardContent>
            </Card>

            {/* Bern */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🐻 Bern & Emmental</h3>
                <p className="text-sm text-muted-foreground mb-3">Voralpines Klima — wechselhaft</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Häufiger Regen: gute Drainage nötig</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Moosbekämpfung durch Vertikutieren</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Robuste RSM-Mischungen empfohlen</li>
                </ul>
              </CardContent>
            </Card>

            {/* Basel */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🌡️ Basel & Nordwestschweiz</h3>
                <p className="text-sm text-muted-foreground mb-3">Wärmstes Klima der Schweiz</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Früher Saisonstart ab Ende Februar</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Bewässerung in heissen Sommern wichtig</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Trockenresistente Sorten wählen</li>
                </ul>
              </CardContent>
            </Card>

            {/* Luzern */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🏔️ Luzern & Zentralschweiz</h3>
                <p className="text-sm text-muted-foreground mb-3">Alpenrandklima — feucht</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Hoher Niederschlag begünstigt Moos</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Kalkung gegen saure Böden empfohlen</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Schattenrasen für Hanglagen</li>
                </ul>
              </CardContent>
            </Card>

            {/* Genf / Lausanne */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🍷 Genf & Genfersee</h3>
                <p className="text-sm text-muted-foreground mb-3">Mildes Seeklima — mediterran beeinflusst</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Milde Winter, lange Vegetationsperiode</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Zierrasen gedeiht hervorragend</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Regelmässige Sommerbewässerung nötig</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tessin */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">🌴 Tessin & Südschweiz</h3>
                <p className="text-sm text-muted-foreground mb-3">Subtropisches Klima — feucht & warm</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Ganzjährig grüner Rasen möglich</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Starke Niederschläge: Drainage wichtig</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Pilzbefall vorbeugen durch Belüftung</li>
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
              { num: '1', title: 'Foto hochladen', desc: 'Rasen mit dem Smartphone fotografieren und hochladen.' },
              { num: '2', title: 'KI analysiert', desc: 'Unsere KI erkennt Probleme und bewertet deinen Rasen.' },
              { num: '3', title: 'Pflegeplan erhalten', desc: 'Persönlicher Monatsplan, angepasst an Schweizer Klima.' },
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

      {/* Swiss-specific tips */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Rasenpflege-Tipps für die Schweiz
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              Die Schweiz bietet mit ihren unterschiedlichen Höhenlagen und Klimazonen besondere Herausforderungen 
              für die Rasenpflege. Vom milden Genferseegebiet bis ins alpine Engadin — jeder Garten braucht eine individuelle Strategie.
            </p>
            <h3 className="text-foreground">Beste Grasarten für die Schweiz</h3>
            <p>
              Im Mittelland eignen sich <strong>Deutsches Weidelgras</strong> und <strong>Wiesenrispe</strong> für dichte, 
              strapazierfähige Rasenflächen. In höheren Lagen empfehlen wir <strong>Rotschwingel</strong> und <strong>Straussgras</strong> 
              für ihre Kältetoleranz. Im Tessin gedeihen auch wärmeliebende Sorten.
            </p>
            <h3 className="text-foreground">Saisonaler Pflegekalender</h3>
            <p>
              <strong>Frühling (März–Mai):</strong> Erste Düngung im Mittelland ab Mitte März, in den Bergen erst ab Mai. 
              Vertikutieren bei trockenem Boden. pH-Wert prüfen und bei Bedarf kalken.
            </p>
            <p>
              <strong>Sommer (Juni–August):</strong> Wöchentlich mähen, bei Trockenheit Schnitthöhe erhöhen. 
              Frühmorgens bewässern. In Basel und Genf besonders auf Hitzeperioden achten.
            </p>
            <p>
              <strong>Herbst (September–November):</strong> Herbstdüngung mit Kalium für Winterhärte. 
              Laub regelmässig entfernen. Letzte Nachsaat bis Ende September.
            </p>
            <p>
              <strong>Winter (Dezember–Februar):</strong> Rasen bei Frost und Schnee nicht betreten. 
              Schneeschimmel vorbeugen. Rasenmäher warten und Saatgut für das Frühjahr planen.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Bereit für den perfekten Rasen in der Schweiz?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Unsere KI berücksichtigt Schweizer Klima, Höhenlagen und regionale Bodenverhältnisse.
          </p>
          <Button 
            onClick={() => navigate('/lawn-analysis')} 
            size="lg"
            className="text-lg py-6 px-12 rounded-2xl font-bold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Kostenlose Analyse starten 🇨🇭
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Funktioniert für die gesamte Schweiz — Zürich, Bern, Basel, Luzern, Genf, Tessin und mehr.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RasenpflegeSchweiz;
