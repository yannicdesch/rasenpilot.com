import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import LawnHighscore from '@/components/LawnHighscore';
import SEO from '@/components/SEO';
import MainNavigation from '@/components/MainNavigation';

const Highscore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Rasen-Ranking in deiner Nachbarschaft | Rasenpilot"
        description="Vergleiche deinen Rasen mit deinen Nachbarn. Anonymisiertes PLZ-Ranking zeigt dir, wie dein Rasen im Vergleich abschneidet."
        canonical="https://www.rasenpilot.com/highscore"
        keywords="Rasen Ranking, Nachbarschaft, PLZ Vergleich, Rasen Score, Rasenpflege"
      />
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <LawnHighscore />
        
        {/* CTA */}
        <div className="mt-10 text-center max-w-md mx-auto">
          <Button 
            onClick={() => navigate('/lawn-analysis')}
            className="bg-primary hover:bg-primary/90 w-full h-12 text-base"
          >
            <Camera className="mr-2 h-5 w-5" />
            Jetzt Rasen analysieren & einsteigen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Highscore;
