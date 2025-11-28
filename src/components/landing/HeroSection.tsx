import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Rocket, Star, Trophy, Shield, CheckCircle, Sparkles } from 'lucide-react';
import lawnBefore from '@/assets/lawn-before.jpg';
import lawnAfter from '@/assets/lawn-after.jpg';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section 
      className="relative w-full py-8 md:py-16 lg:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #ffffff 100%)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          
          {/* Left Column - Content */}
          <div className="flex-1 space-y-5 md:space-y-7 text-center lg:text-left max-w-2xl">
            
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 px-4 py-2 rounded-full shadow-sm">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm md:text-base font-semibold text-gray-800 font-poppins">
                #1 KI-Rasenexperte • 50.000+ Nutzer
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-dm-serif text-primary">
              Perfekter Rasen in{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">30 Sekunden</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-accent/40 -rotate-1"></span>
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-poppins">
              Unsere KI analysiert über{' '}
              <span className="font-bold text-primary">200 Rasenparameter</span>{' '}
              und erstellt deinen persönlichen Pflegeplan – mit{' '}
              <span className="font-bold text-primary">98,3% Genauigkeit</span>
            </p>
            
            {/* CTA Button */}
            <div className="pt-2">
              <Button 
                onClick={() => navigate('/lawn-analysis')} 
                size="lg"
                className="group relative w-full md:w-auto text-base md:text-lg py-6 px-10 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden font-poppins"
                style={{ 
                  background: 'linear-gradient(135deg, #00A651 0%, #00C853 100%)',
                  color: 'white'
                }}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center justify-center gap-3">
                  <Rocket className="h-5 w-5 md:h-6 md:w-6" />
                  Jetzt kostenlos analysieren
                </span>
              </Button>
              <p className="text-xs md:text-sm text-gray-600 mt-3 font-poppins">
                ✓ Keine Kreditkarte erforderlich • ✓ Ergebnis in 30 Sekunden
              </p>
            </div>
            
            {/* Trust Elements */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 pt-3">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-base md:text-lg font-bold text-gray-900 font-poppins">4.9/5</span>
              </div>
              
              <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm md:text-base text-gray-700 font-medium font-poppins">
                  TÜV geprüft
                </span>
              </div>
              
              <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm md:text-base text-gray-700 font-medium font-poppins">
                  100% kostenlos
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="relative">
              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex h-72 md:h-80 lg:h-96">
                  
                  {/* Before */}
                  <div 
                    className="flex-1 relative flex items-end justify-center p-6 bg-cover bg-center"
                    style={{ backgroundImage: `url(${lawnBefore})` }}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      Vorher
                    </div>
                    <div className="relative z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <p className="text-white font-bold text-sm md:text-base font-poppins">Trockener,<br/>lückenhafter Rasen</p>
                    </div>
                  </div>
                  
                  {/* After */}
                  <div 
                    className="flex-1 relative flex items-end justify-center p-6 bg-cover bg-center"
                    style={{ backgroundImage: `url(${lawnAfter})` }}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      Nachher
                    </div>
                    <div className="relative z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <p className="text-white font-bold text-sm md:text-base drop-shadow-lg font-poppins">Saftiger,<br/>perfekter Rasen</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div 
                className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 rounded-2xl w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center shadow-2xl border-4 border-white font-poppins"
                style={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                }}
              >
                <Sparkles className="h-5 w-5 text-white mb-1" />
                <span className="text-xl md:text-2xl font-extrabold text-white">30s</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;