import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MainNavigation from '@/components/MainNavigation';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Calendar, ArrowRight, Check, BookOpen, Trophy, Crown, Clock, Users, Target, Shield, Flame, Share2, Bug, ShoppingCart, BarChart3, MapPin } from 'lucide-react';
import type { SEOContentType } from '@/components/SEOContentEditor';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import HeroSection from '@/components/landing/HeroSection';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const [seoContent, setSeoContent] = useState<SEOContentType | null>(null);
  
  useEffect(() => {
    const savedSeoContent = localStorage.getItem('seoContent');
    if (savedSeoContent) {
      try {
        setSeoContent(JSON.parse(savedSeoContent));
      } catch (e) {
        console.error("Error parsing saved SEO content:", e);
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      <SEO 
        title="Rasenpilot — KI-Rasenanalyse kostenlos | Lawn Score in 30 Sekunden"
        description="Lade ein Foto deines Rasens hoch und erhalte sofort deine persönliche KI-Diagnose mit Lawn Score, Pflegekalender und Produktempfehlungen. Kostenlos & ohne Anmeldung."
        canonical="/"
        keywords="rasen analyse, rasen ki, rasenpflege app, lawn score, rasen gelb, rasen moos, rasendünger empfehlung"
        type="website"
        structuredData={{
          type: 'WebSite',
          data: {
            name: 'Rasenpilot',
            description: 'Intelligenter KI-Rasenberater für personalisierten Rasenpflegeplan',
            url: 'https://rasenpilot.com',
            potentialAction: {
              "@type": "SearchAction",
              target: "https://rasenpilot.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            sameAs: [
              "https://rasenpilot.com/blog-overview",
              "https://rasenpilot.com/lawn-analysis"
            ]
          }
        }}
      />
      
      <StructuredData 
        type="Service"
        data={{
          name: "KI-Rasenpflegeplan von Rasenpilot",
          description: "Kostenloser personalisierter Rasenpflegeplan in 30 Sekunden. KI-gestützte Rasenanalyse mit professionellen Empfehlungen.",
          provider: "Rasenpilot",
          serviceType: "Rasenberatung"
        }}
      />
      
      <StructuredData 
        type="Organization"
        data={{
          name: "Rasenpilot",
          url: "https://rasenpilot.com",
          logo: "https://rasenpilot.com/logo.png",
          description: "Intelligenter KI-Rasenberater für Deutschland"
        }}
      />
      
      <MainNavigation />
      
      <HeroSection />
      
      {/* Value Proposition Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              Warum 50.000+ Gartenbesitzer <br className="hidden md:block" />
              uns vertrauen
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Modernste KI-Technologie trifft auf jahrzehntelange Rasenexpertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl border border-green-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center transform rotate-12">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Deep Learning Analyse</h3>
              <p className="text-muted-foreground leading-relaxed">
                Über <strong className="text-foreground">200 Rasenparameter</strong> werden in Echtzeit analysiert — 
                inkl. <strong className="text-foreground">Krankheitserkennung</strong> und Produktempfehlungen.
              </p>
              <div className="mt-6 pt-6 border-t border-green-200">
                <div className="text-3xl font-bold text-primary">98,3%</div>
                <div className="text-sm text-muted-foreground">Genauigkeit</div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center transform -rotate-12">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Gamification & Motivation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rang-System mit <strong className="text-foreground">8 Leveln</strong>, Analyse-Streaks 🔥 
                und Nachbarschafts-Ranking — wer hat den besten Rasen?
              </p>
              <div className="mt-6 pt-6 border-t border-blue-200">
                <div className="text-3xl font-bold text-blue-600">8 Ränge</div>
                <div className="text-sm text-muted-foreground">Vom Neuling zum Legendären Gärtner</div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Sofortige Ergebnisse</h3>
              <p className="text-muted-foreground leading-relaxed">
                Kein Warten, keine Verzögerung. Dein personalisierter 
                <strong className="text-foreground"> Pflegeplan in 30 Sekunden</strong> – 24/7 verfügbar.
              </p>
              <div className="mt-6 pt-6 border-t border-amber-200">
                <div className="text-3xl font-bold text-amber-600">24/7</div>
                <div className="text-sm text-muted-foreground">Verfügbar</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              In 3 einfachen Schritten zum <br className="hidden md:block" />
              perfekten Rasen
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Keine Vorkenntnisse nötig • Keine Anmeldung erforderlich • Sofortige Ergebnisse
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <div className="bg-white p-8 pt-12 rounded-3xl shadow-lg border border-gray-100 h-full">
                <div className="mb-6">
                  <Camera className="h-12 w-12 text-primary mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Foto hochladen</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Mache ein Foto von deinem Rasen mit dem Smartphone. Unsere KI erkennt automatisch 
                  Krankheiten, Schädlinge und Nährstoffmängel.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <div className="bg-white p-8 pt-12 rounded-3xl shadow-lg border border-gray-100 h-full">
                <div className="mb-6">
                  <Target className="h-12 w-12 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">KI-Analyse + Score</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Erhalte deinen Rasen-Score (0–100), passende Produktempfehlungen 
                  und sieh wo du im Nachbarschafts-Ranking stehst.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <div className="bg-white p-8 pt-12 rounded-3xl shadow-lg border border-gray-100 h-full">
                <div className="mb-6">
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Pflegekalender folgen</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Dein persönlicher Monats-Pflegeplan sagt dir genau, wann du düngen, mähen 
                  oder vertikutieren sollst — wetterbasiert.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="text-lg py-6 px-12 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Jetzt kostenlos starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* New Features Showcase */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground px-6 py-2 text-base">
              Neu in 2026
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              Alles was dein Rasen braucht
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Von der Analyse bis zum perfekten Rasen – mit KI, Gamification und Community
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1: Krankheitserkennung */}
            <div className="group bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/lawn-analysis')}>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Krankheitserkennung</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                KI erkennt Pilzbefall, Schädlinge und Nährstoffmängel automatisch und empfiehlt Behandlungen.
              </p>
            </div>

            {/* Feature 2: Produktempfehlungen */}
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/lawn-analysis')}>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Produktempfehlungen</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Passende Dünger, Saatgut und Werkzeug — direkt nach der Analyse, mit Amazon-Link.
              </p>
            </div>

            {/* Feature 3: Pflegekalender */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/care-calendar')}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Pflegekalender</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Monatlicher Plan: Wann düngen, mähen, vertikutieren? KI-generiert nach deiner Analyse.
              </p>
              <Badge variant="outline" className="mt-2 text-xs border-amber-300 text-amber-700">Premium</Badge>
            </div>

            {/* Feature 4: PLZ-Ranking */}
            <div className="group bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/highscore')}>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Nachbarschafts-Ranking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Wer hat den besten Rasen in deiner PLZ? Anonymisiertes Ranking sorgt für Motivation.
              </p>
            </div>

            {/* Feature 5: Gamification */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/highscore')}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Rang-System & Streaks</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                8 Level vom "Rasen-Neuling" bis zum "Legendären Gärtner" 🔥 — mit wöchentlichen Streaks.
              </p>
            </div>

            {/* Feature 6: Score Sharing */}
            <div className="group bg-gradient-to-br from-cyan-50 to-sky-50 p-6 rounded-2xl border border-cyan-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/lawn-analysis')}>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Score teilen</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Teile deinen Rasen-Score auf WhatsApp, Facebook & Instagram — wie Spotify Wrapped! 🌱
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Premium Features Comparison */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 text-base">
              Beliebtes Upgrade
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              Hol dir noch mehr aus <br className="hidden md:block" />
              deinem Rasen
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Starte kostenlos und upgrade jederzeit für erweiterte Features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Kostenlos</h3>
                <div className="text-4xl font-bold text-foreground mb-1">€0</div>
                <div className="text-muted-foreground">Für immer kostenlos</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">1 kostenlose Rasenanalyse</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Krankheitserkennung & Produkttipps</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Score teilen & Bestenliste</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/lawn-analysis')}
                variant="outline"
                className="w-full py-6 text-lg border-2"
              >
                Kostenlos starten
              </Button>
            </div>
            
            {/* Premium Plan */}
            <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-8 rounded-3xl border-2 border-green-500 shadow-2xl transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 text-base shadow-lg">
                  Beliebt
                </Badge>
              </div>
              
              <div className="mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">€9,99</span>
                  <span className="text-lg opacity-90">/Monat</span>
                </div>
                <div className="opacity-90">7 Tage kostenlos testen</div>
              </div>
              
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Unbegrenzte Analysen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">KI-Pflegekalender (Monat für Monat)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Wetter-basierte Empfehlungen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">KI-Chat Assistent 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Rasen-Verlauf & Fortschritts-Tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">PLZ Nachbarschafts-Ranking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Rang-Aufstieg & Analyse-Streaks 🔥</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full py-6 text-lg bg-white text-green-700 hover:bg-gray-50 font-bold"
              >
                7 Tage kostenlos testen
              </Button>
              
              <p className="text-center text-white/80 text-sm mt-4">
                ✓ Jederzeit kündbar • ✓ 30 Tage Geld-zurück-Garantie
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLZ Ranking Teaser */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full text-amber-800 font-medium mb-6">
              <Trophy className="h-4 w-4" />
              <span>Nachbarschafts-Wettbewerb</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              Wer hat den besten Rasen <br className="hidden md:block" />
              in deiner Straße? 🏆
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Vergleiche deinen Rasen-Score mit Nachbarn in deiner PLZ. 
              Niemand will den schlechtesten Rasen in der Nachbarschaft — oder? 😄
            </p>

            {/* Demo Leaderboard Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg mx-auto mb-8">
              <div className="text-xs text-muted-foreground mb-1 text-center italic">So sieht dein Ranking aus — Beispiel</div>
              <div className="text-sm font-semibold text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                Demo: PLZ 69190
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🥇</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm">GartenKing_HD</p>
                      <p className="text-xs text-muted-foreground">👑 Legendärer Gärtner</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-lg">94</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🥈</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm">RasenProfi_2024</p>
                      <p className="text-xs text-muted-foreground">🏆 Rasen-Champion</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-lg">87</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🥉</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm">GrünerDaumen</p>
                      <p className="text-xs text-muted-foreground">🌳 Rasen-Meister</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-lg">79</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border-2 border-primary/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground">📍 Du</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-primary">Platz 12 von 47</p>
                      <p className="text-xs text-muted-foreground">💡 Nur 4 Punkte bis Platz 11!</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-lg">62</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/lawn-analysis')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                <Camera className="mr-2 h-5 w-5" />
                Jetzt Score ermitteln
              </Button>
              <Button 
                onClick={() => navigate('/highscore')}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/5"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Zur Bestenliste
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold font-dm-serif text-primary-foreground mb-6">
            Bereit für deinen Traumrasen?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-poppins">
            Kostenlose KI-Analyse, Krankheitserkennung, Produktempfehlungen und Pflegekalender — alles in einer App.
          </p>
          
          <Button 
            onClick={() => navigate('/lawn-analysis')}
            size="lg"
            className="bg-background text-primary hover:bg-background/90 text-xl py-7 px-12 shadow-2xl font-poppins font-semibold transition-all duration-300 transform hover:-translate-y-1"
          >
            Kostenlose KI-Analyse starten
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-primary-foreground/90 font-poppins">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">Keine Kreditkarte nötig</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">Sofortige Ergebnisse</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">98,3% Erfolgsrate</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Hidden SEO content for search engines */}
      {seoContent && (
        <div className="sr-only">
          <div dangerouslySetInnerHTML={{ __html: seoContent.content }} />
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-full">
                  <div className="h-5 w-5 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-lg font-bold">Rasenpilot</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Deutschlands intelligentester KI-Rasenberater mit Krankheitserkennung, Pflegekalender und Gamification.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>🇩🇪 Made in Germany</span>
                <span>•</span>
                <span>DSGVO-konform</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/lawn-analysis" className="text-gray-300 hover:text-green-400 transition-colors">KI-Rasenanalyse</Link></li>
                <li><Link to="/care-calendar" className="text-gray-300 hover:text-green-400 transition-colors">Pflegekalender</Link></li>
                <li><Link to="/highscore" className="text-gray-300 hover:text-green-400 transition-colors">Nachbarschafts-Ranking</Link></li>
                <li><Link to="/weather-advice" className="text-gray-300 hover:text-green-400 transition-colors">Wetter-Tipps</Link></li>
                <li><Link to="/chat" className="text-gray-300 hover:text-green-400 transition-colors">KI-Chat Assistent</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Wissen & Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/blog-overview" className="text-gray-300 hover:text-green-400 transition-colors">Rasenpflege Blog</Link></li>
                <li><Link to="/season-guide" className="text-gray-300 hover:text-green-400 transition-colors">Saisonaler Leitfaden</Link></li>
                <li><Link to="/kontakt" className="text-gray-300 hover:text-green-400 transition-colors">Kontakt & Support</Link></li>
                <li><Link to="/ueber-uns" className="text-gray-300 hover:text-green-400 transition-colors">Über uns</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rechtliches</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/impressum" className="text-gray-300 hover:text-green-400 transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="text-gray-300 hover:text-green-400 transition-colors">Datenschutz</Link></li>
                <li><Link to="/agb" className="text-gray-300 hover:text-green-400 transition-colors">AGB</Link></li>
              </ul>
              <div className="pt-4">
                <h4 className="text-sm font-semibold mb-2">Lokale Rasenpflege</h4>
                <ul className="space-y-1 text-xs">
                  <li><Link to="/local/berlin" className="text-gray-400 hover:text-green-400 transition-colors">Berlin</Link></li>
                  <li><Link to="/local/munich" className="text-gray-400 hover:text-green-400 transition-colors">München</Link></li>
                  <li><Link to="/local/hamburg" className="text-gray-400 hover:text-green-400 transition-colors">Hamburg</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>Made with 💚 für deutsche Rasenliebhaber</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
