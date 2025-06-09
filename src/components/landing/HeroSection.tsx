
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles, Zap, Shield, Star, Clock } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-4 md:py-8">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Deutschlands <span className="text-green-600">intelligentester</span> KI-Rasenberater.<br/>
            <span className="text-blue-600">Perfekte Ergebnisse</span> in 60 Sekunden.
          </h1>
          <h2 className="text-lg md:text-xl text-gray-700 max-w-2xl leading-relaxed">
            <span className="hidden md:inline">KI analysiert Ihren Rasen und erstellt einen <strong>wissenschaftlich fundierten Pflegeplan</strong> - maßgeschneidert für deutsche Klimabedingungen.</span>
            <span className="md:hidden">KI analysiert Ihren Rasen und erstellt einen <strong>wissenschaftlich fundierten Pflegeplan</strong>.</span>
          </h2>
          
          {/* Unique Selling Points - Simplified for mobile */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 py-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              </div>
              <span className="text-sm md:text-base text-gray-700 font-medium">60 Sek. Analyse</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              </div>
              <span className="text-sm md:text-base text-gray-700 font-medium">Wissenschaftlich</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
              </div>
              <span className="text-sm md:text-base text-gray-700 font-medium">50.000+ Nutzer</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
              </div>
              <span className="text-sm md:text-base text-gray-700 font-medium">24/7 verfügbar</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={() => navigate('/onboarding')} 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-6 px-8 shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Kostenlose KI-Analyse starten</span>
              <span className="sm:hidden">KI-Analyse starten</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="lg"
              className="border-2 border-green-200 text-green-700 hover:bg-green-50 text-lg py-6 px-8"
            >
              <span className="hidden sm:inline">Anmelden & Vollversion nutzen</span>
              <span className="sm:hidden">Anmelden</span>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-600 pt-2">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Keine Kreditkarte</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Sofortige Ergebnisse</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="hidden sm:inline">100% kostenlose Testversion</span>
              <span className="sm:hidden">100% kostenlos</span>
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
