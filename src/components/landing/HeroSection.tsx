
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles, Zap, Shield, Star, Clock } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-20">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
            🚀 Revolutionäre KI-Technologie - Jetzt in Deutschland verfügbar
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Deutschlands <span className="text-green-600">intelligentester</span> KI-Rasenberater.<br/>
            <span className="text-blue-600">Perfekte Ergebnisse</span> in 60 Sekunden.
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-700 max-w-2xl leading-relaxed">
            Revolutionäre Künstliche Intelligenz analysiert Ihren Rasen, erkennt Probleme sofort und erstellt einen 
            <strong> wissenschaftlich fundierten Pflegeplan</strong> - maßgeschneidert für deutsche Klimabedingungen.
          </h2>
          
          {/* Unique Selling Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">KI-Analyse in 60 Sekunden</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">Wissenschaftlich fundiert</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Über 50.000 zufriedene Nutzer</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-gray-700 font-medium">24/7 verfügbar</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={() => navigate('/onboarding')} 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-6 px-8 shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Kostenlose KI-Analyse starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="lg"
              className="border-2 border-green-200 text-green-700 hover:bg-green-50 text-lg py-6 px-8"
            >
              Anmelden & Vollversion nutzen
            </Button>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 pt-2">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Keine Kreditkarte erforderlich</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Sofortige Ergebnisse</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>100% kostenlose Testversion</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
          <AspectRatio ratio={16/9}>
            <img 
              src="/placeholder.svg" 
              alt="Rasenpilot KI-Rasenanalyse - Revolutionäre Technologie für perfekte Rasenpflege" 
              className="w-full h-full object-cover rounded-xl" 
              loading="eager"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
