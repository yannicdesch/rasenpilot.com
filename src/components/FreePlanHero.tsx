
import React, { useEffect, useState } from 'react';
import { useLawn } from '@/context/LawnContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles } from 'lucide-react';

const FreePlanHero: React.FC = () => {
  const { temporaryProfile, isAuthenticated } = useLawn();
  const [seoContent, setSEOContent] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const savedSeoContent = localStorage.getItem('seoContent');
    if (savedSeoContent) {
      setSEOContent(JSON.parse(savedSeoContent));
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-white py-10 md:py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green-300 rounded-full opacity-20 blur-xl"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge for highlighting the feature */}
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Neu: KI-gestützte Rasenpflege
          </div>
          
          {/* Main headline with colored text */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Ihr perfekter Rasen mit <span className="text-green-600 relative">
              KI-Unterstützung
              <span className="absolute bottom-0 left-0 w-full h-1 bg-green-400 opacity-40 rounded"></span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Rasenpilot analysiert Ihren Rasen und erstellt einen personalisierten Pflegeplan basierend auf Wetter, Bodentyp und Ihren Zielen.
          </p>
          
          {/* Visual indicator */}
          <div className="hidden md:flex justify-center mb-4">
            <div className="w-16 h-1 bg-green-500 rounded-full"></div>
          </div>
          
          {/* Benefits list - visible on larger screens */}
          <div className="hidden md:flex justify-center gap-8 text-sm font-medium text-gray-700 mt-6">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Personalisierter Plan</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>KI-Analyse</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Kostenlos starten</span>
            </div>
          </div>
          
          {/* Hidden SEO content that's visible to search engines */}
          {seoContent && (
            <div className="sr-only">
              <p>{seoContent.description}</p>
              <div>{seoContent.keywords}</div>
              <div>{seoContent.content}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FreePlanHero;
