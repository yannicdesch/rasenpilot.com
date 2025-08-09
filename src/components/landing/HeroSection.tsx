import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-8 md:py-12">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Perfekter Rasen in <span className="text-green-600">30 Sekunden</span> –<br/>
            kostenlos & wissenschaftlich präzise
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl">
            Unsere KI analysiert über <strong>200 Rasenparameter</strong> und erstellt deinen persönlichen Pflegeplan – 
            mit <strong>98,3% Genauigkeit</strong>.
          </p>
          
          <div className="pt-4">
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-xl py-6 px-12 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Jetzt kostenlose Rasenanalyse starten
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-3 sm:space-y-0 text-sm text-gray-600 pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Keine Kreditkarte erforderlich</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Sofortige Ergebnisse</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">100% kostenlos</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-500">
                {'★'.repeat(5)}
              </div>
              <span className="text-lg font-bold text-gray-900">50.000+</span>
            </div>
            <span className="text-gray-600 font-medium">Von Gartenexperten empfohlen</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Datenschutz<br/>validiert</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <AspectRatio ratio={16/10}>
              <div className="w-full h-full bg-gradient-to-r from-yellow-100 via-green-100 to-green-200 flex">
                {/* Before/After Split */}
                <div className="flex-1 relative bg-gradient-to-b from-yellow-200 to-yellow-300">
                  <div className="absolute top-4 left-4 bg-gray-800/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Vorher
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-yellow-400/50 rounded-full mb-4 mx-auto flex items-center justify-center">
                        <span className="text-4xl">😞</span>
                      </div>
                      <p className="text-gray-700 font-medium">Gelber, lückenhafter<br/>Rasen</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative bg-gradient-to-b from-green-400 to-green-500">
                  <div className="absolute top-4 right-4 bg-green-800/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Nachher
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-green-600/30 rounded-full mb-4 mx-auto flex items-center justify-center">
                        <span className="text-4xl">🌱</span>
                      </div>
                      <p className="text-white font-medium">Perfekter, grüner<br/>Traumrasen</p>
                    </div>
                  </div>
                </div>
              </div>
            </AspectRatio>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-gray-900 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg">
              <span className="text-2xl font-bold">30</span>
              <span className="text-xs font-medium leading-tight">Sekunden<br/>später...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;