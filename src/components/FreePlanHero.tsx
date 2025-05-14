
import React, { useEffect, useState } from 'react';
import { useLawn } from '@/context/LawnContext';

const FreePlanHero: React.FC = () => {
  const { temporaryProfile, isAuthenticated } = useLawn();
  const [seoContent, setSEOContent] = useState<any>(null);

  useEffect(() => {
    const savedSeoContent = localStorage.getItem('seoContent');
    if (savedSeoContent) {
      setSEOContent(JSON.parse(savedSeoContent));
    }
  }, []);

  return (
    <section className="bg-gradient-to-br from-green-100 to-white py-12 md:py-16 border-b border-green-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
            {seoContent?.title || "Wir haben Tausende Rasen analysiert – jetzt ist deiner dran."}
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-green-700 mb-6">
            Mit Hilfe von KI und der Rasenpilot-Community erstellen wir den perfekten Pflegeplan für deinen Rasen – basierend auf Standort, Grasart und Ziel.
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Egal ob du einen grüneren Rasen willst, kahle Stellen reparieren musst oder Unkraut bekämpfst – Rasenpilot kombiniert Expertenwissen, echte Erfahrungen und aktuelle Wetterdaten.
            <br />
            <span className="font-medium text-green-600">
              Sofort starten. Ohne Anmeldung. Kostenlos.
            </span>
          </p>
          
          {/* Hidden SEO content that's visible to search engines */}
          {seoContent && (
            <div className="mt-8 text-xs text-gray-500 max-h-20 overflow-hidden opacity-70">
              <p>{seoContent.description}</p>
              <div className="sr-only">{seoContent.keywords}</div>
              <div className="sr-only">{seoContent.content}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FreePlanHero;
