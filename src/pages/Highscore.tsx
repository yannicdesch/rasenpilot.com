
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowLeft, Camera } from 'lucide-react';
import LawnHighscore from '@/components/LawnHighscore';

const Highscore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Rasenpilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/lawn-analysis')}
            >
              <Camera className="mr-2 h-4 w-4" />
              Rasen analysieren
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog-overview')}
            >
              Ratgeber
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Startseite
            </Button>
          </div>
        </nav>
      </header>
      
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
