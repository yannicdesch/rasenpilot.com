
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

const FooterSection = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="bg-white py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Rasenpilot</h2>
            <p className="text-gray-600 mb-4">
              Deutschlands intelligentester KI-Rasenberater für perfekte Rasenpflege.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold">50.000+ Nutzer</div>
                <div className="text-xs text-gray-500">98,3% Erfolgsrate</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produkt</h3>
            <ul className="space-y-2">
              <li><Button variant="link" onClick={() => navigate('/lawn-analysis')} className="p-0 h-auto text-gray-600 hover:text-green-600">KI-Analyse</Button></li>
              <li><Button variant="link" onClick={() => navigate('/blog-overview')} className="p-0 h-auto text-gray-600 hover:text-green-600">Ratgeber</Button></li>
              <li><Button variant="link" onClick={() => navigate('/')} className="p-0 h-auto text-gray-600 hover:text-green-600">Startseite</Button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Unternehmen</h3>
            <ul className="space-y-2">
              <li><Button variant="link" onClick={() => navigate('/ueber-uns')} className="p-0 h-auto text-gray-600 hover:text-green-600">Über uns</Button></li>
              <li><Button variant="link" onClick={() => navigate('/kontakt')} className="p-0 h-auto text-gray-600 hover:text-green-600">Kontakt</Button></li>
              <li><span className="p-0 h-auto text-gray-600 opacity-50 cursor-not-allowed text-sm">Karriere</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              <li><Button variant="link" onClick={() => navigate('/datenschutz')} className="p-0 h-auto text-gray-600 hover:text-green-600">Datenschutz</Button></li>
              <li><Button variant="link" onClick={() => navigate('/agb')} className="p-0 h-auto text-gray-600 hover:text-green-600">AGB</Button></li>
              <li><Button variant="link" onClick={() => navigate('/impressum')} className="p-0 h-auto text-gray-600 hover:text-green-600">Impressum</Button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Rasenpilot - Deutschlands intelligentester KI-Rasenberater. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>🇩🇪 Made in Germany</span>
              <span>•</span>
              <span>🏆 #1 Rasenpflege-App</span>
              <span>•</span>
              <span>⭐ 4.9/5 Bewertung</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
