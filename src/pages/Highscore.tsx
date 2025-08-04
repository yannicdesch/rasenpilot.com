
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowLeft, Camera } from 'lucide-react';
import LawnHighscore from '@/components/LawnHighscore';
import SEO from '@/components/SEO';
import MainNavigation from '@/components/MainNavigation';

const Highscore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="Rasen Bestenliste - Die schönsten Rasenflächen Deutschlands | Rasenpilot"
        description="Entdecken Sie die Bestenliste der schönsten Rasenflächen Deutschlands. Lassen Sie sich von perfekt gepflegten Rasenflächen inspirieren und teilen Sie Ihren eigenen Traumrasen."
        canonical="https://www.rasenpilot.com/highscore"
        keywords="Rasen Bestenliste, schönste Rasenflächen Deutschland, Rasen Highscore, perfekter Rasen, Traumrasen"
      />
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <LawnHighscore />
        
        {/* Call to Action */}
        <div className="mt-12 text-center bg-green-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Möchtest du auch in die Bestenliste?
          </h2>
          <p className="text-gray-600 mb-6">
            Lade ein Foto deines Rasens hoch und erhalte eine professionelle Bewertung!
          </p>
          <Button 
            onClick={() => navigate('/lawn-analysis')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Camera className="mr-2 h-4 w-4" />
            Jetzt Rasen analysieren
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Highscore;
