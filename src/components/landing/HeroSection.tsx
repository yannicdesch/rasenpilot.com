import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Rocket, Star, CheckCircle, Shield } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section 
      className="w-full py-10 md:py-16 lg:py-20"
      style={{
        background: 'linear-gradient(to bottom, #E6F5E6 0%, #ffffff 100%)'
      }}
    >
      <div className="container mx-auto px-8 sm:px-10 md:px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          
          {/* Left Column */}
          <div className="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Headline */}
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
              style={{ color: '#006400', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Perfekter Rasen in 30 Sekunden – kostenlos & wissenschaftlich präzise
            </h1>
            
            {/* Paragraph */}
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
              Unsere KI analysiert über <strong>200 Rasenparameter</strong> und erstellt deinen persönlichen Pflegeplan – 
              mit <strong>98,3 % Genauigkeit</strong>.
            </p>
            
            {/* CTA Button */}
            <div className="pt-2">
              <Button 
                onClick={() => navigate('/lawn-analysis')} 
                size="lg"
                className="text-lg sm:text-xl py-4 sm:py-6 px-8 sm:px-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: '#00A651',
                  color: 'white'
                }}
              >
                <Rocket className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Jetzt kostenlose Rasenanalyse starten
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
              {/* Stars and 50,000+ */}
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-xl font-bold text-gray-900">50.000+</span>
              </div>
              
              {/* Text */}
              <span className="text-gray-700 font-medium">Von Gartenexperten empfohlen</span>
              
              {/* Validation Badge */}
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Wissenschaftlich validiert</span>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Before/After Container */}
              <div className="flex h-64 sm:h-80 lg:h-96">
                
                {/* Vorher (Before) */}
                <div className="flex-1 relative bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center">
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Vorher
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-400/60 rounded-full mb-3 mx-auto flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-600/40 rounded-lg"></div>
                    </div>
                    <p className="text-yellow-800 font-medium text-sm">Trockener,<br/>lückenhafter Rasen</p>
                  </div>
                </div>
                
                {/* Nachher (After) */}
                <div className="flex-1 relative bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Nachher
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-200/60 rounded-full mb-3 mx-auto flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-700 rounded-lg"></div>
                    </div>
                    <p className="text-white font-medium text-sm">Saftiger,<br/>perfekter Rasen</p>
                  </div>
                </div>
              </div>
              
              {/* Yellow Floating Badge */}
              <div 
                className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center shadow-lg text-black font-bold"
                style={{ backgroundColor: '#FFD700' }}
              >
                <span className="text-lg sm:text-xl font-bold">30</span>
                <span className="text-xs sm:text-sm leading-tight text-center">Sekunden<br/>später...</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;