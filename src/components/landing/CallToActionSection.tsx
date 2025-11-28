
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
    <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden" id="jetzt-starten">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
      <div className="container mx-auto px-4 text-center relative">
        <h2 className="text-4xl md:text-5xl font-bold font-dm-serif text-primary-foreground mb-6">
          Bereit für Ihren <span className="text-primary-foreground/90">Traumrasen?</span>
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed font-poppins">
          Erleben Sie die Zukunft der Rasenpflege mit wissenschaftlich fundierter KI-Analyse. 
          Kostenlose Analyse, sofortige Ergebnisse, garantierter Erfolg.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
          <Button 
            onClick={handleFreeAnalysisClick}
            size="lg"
            className="bg-background text-primary hover:bg-background/90 text-xl py-7 px-12 shadow-2xl font-poppins font-semibold transition-all duration-300 transform hover:-translate-y-1"
          >
            <Sparkles className="mr-2 h-6 w-6" />
            Kostenlose KI-Analyse starten
          </Button>
          <Button 
            onClick={handleFullVersionClick}
            variant="outline"
            size="lg"
            className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-xl py-7 px-12 font-poppins font-semibold transition-all duration-300 transform hover:-translate-y-1"
          >
            Vollversion freischalten
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/90 font-poppins">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Keine Kreditkarte erforderlich</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Sofortige Ergebnisse</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">98,3% Erfolgsrate</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
