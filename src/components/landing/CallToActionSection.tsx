
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from 'lucide-react';
import { useInteractionTracking } from '@/hooks/useJourneyTracking';

const CallToActionSection = () => {
  const navigate = useNavigate();
  const { trackButtonClick } = useInteractionTracking('/');
  
  const handleFreeAnalysisClick = () => {
    trackButtonClick('free_analysis_cta', { section: 'main_cta', priority: 'primary' });
    navigate('/lawn-analysis');
  };
  
  const handleFullVersionClick = () => {
    trackButtonClick('full_version_cta', { section: 'main_cta', priority: 'secondary' });
    navigate('/lawn-analysis');
  };
  
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 via-green-700 to-green-800" id="jetzt-starten">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Bereit für Ihren <span className="text-green-200">Traumrasen?</span>
        </h2>
        <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Erleben Sie die Zukunft der Rasenpflege mit wissenschaftlich fundierter KI-Analyse. 
          Kostenlose Analyse, sofortige Ergebnisse, garantierter Erfolg.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
          <Button 
            onClick={handleFreeAnalysisClick}
            size="lg"
            className="bg-white text-green-700 hover:bg-green-50 text-xl py-6 px-10 shadow-xl"
          >
            <Sparkles className="mr-2 h-6 w-6" />
            Kostenlose KI-Analyse starten
          </Button>
          <Button 
            onClick={handleFullVersionClick}
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-green-700 text-xl py-6 px-10"
          >
            Vollversion freischalten
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-green-100">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Keine Kreditkarte erforderlich</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Sofortige Ergebnisse</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>98,3% Erfolgsrate</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
