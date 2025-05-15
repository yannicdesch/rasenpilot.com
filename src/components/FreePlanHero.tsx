
import React, { useEffect, useState } from 'react';
import { useLawn } from '@/context/LawnContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <section className="bg-gradient-to-br from-green-50 to-white py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge for highlighting the new feature */}
          <div className="inline-block bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Neu: KI-gestützte Rasenpflege
          </div>
          
          {/* Main headline with colored text */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Ihr perfekter Rasen mit <span className="text-green-600">KI-Unterstützung</span>
          </h1>
          
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Rasenpilot analysiert Ihren Rasen und erstellt einen personalisierten Pflegeplan basierend auf Wetter, Bodentyp und Ihren Zielen.
          </p>
          
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
