import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-4 md:py-8">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Revolutionäre <span className="text-blue-600">KI-Rasenanalyse</span><br/>
            mit wissenschaftlicher Präzision
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-6 px-8 shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Kostenlose KI-Analyse starten</span>
              <span className="sm:hidden">KI-Analyse starten</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              variant="outline" 
              size="lg"
              className="border-2 border-green-200 text-green-700 hover:bg-green-50 text-lg py-6 px-8"
            >
              <span className="hidden sm:inline">Anmelden & Vollversion nutzen</span>
              <span className="sm:hidden">Anmelden</span>
            </Button>
          </div>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl">
            KI analysiert über <strong>200 Rasenparameter</strong> in Sekunden. 
            Erhalten Sie eine professionelle Diagnose mit <strong>98,3% Genauigkeit</strong>.
          </p>
          
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