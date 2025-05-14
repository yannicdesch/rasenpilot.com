
import React, { useEffect, useState } from 'react';
import { useLawn } from '@/context/LawnContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FreePlanHero: React.FC = () => {
  const { temporaryProfile, isAuthenticated } = useLawn();
  const [seoContent, setSEOContent] = useState<any>(null);
  const navigate = useNavigate();

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
          <p className="text-lg text-gray-700 mb-8">
            Egal ob du einen grüneren Rasen willst, kahle Stellen reparieren musst oder Unkraut bekämpfst – Rasenpilot kombiniert Expertenwissen, echte Erfahrungen und aktuelle Wetterdaten.
            <br />
            <span className="font-medium text-green-600">
              Sofort starten. Ohne Anmeldung. Kostenlos.
            </span>
          </p>
          
          {/* Added clear call to action button */}
          <div className="mb-8">
            <Button
              className="px-8 py-6 text-lg rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
              size="lg"
              onClick={() => navigate('/free-plan/form')}
            >
              Rasen-Check mit KI starten <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* KI Technology Badge */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 inline-block">
            <p className="text-green-800 text-sm font-medium">
              <span className="font-bold">IP-geschützte KI-Technologie</span> für präzise Rasenanalyse
            </p>
          </div>
          
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
