
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';

const FooterSection = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="bg-gradient-to-br from-background via-accent/5 to-background py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h2 className="text-2xl font-bold font-dm-serif text-primary mb-4">
              <a 
                href="https://www.rasenpilot.com/" 
                className="hover:text-primary/80 transition-colors"
                title="Zur Rasenpilot Startseite"
              >
                Rasenpilot
              </a>
            </h2>
            <p className="text-muted-foreground mb-4 font-poppins">
              Deutschlands intelligentester KI-Rasenberater für perfekte Rasenpflege.
            </p>
            <div className="mb-4">
              <a 
                href="https://www.rasenpilot.com/" 
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                title="Rasenpilot Hauptseite besuchen"
              >
                🌐 www.rasenpilot.com
              </a>
            </div>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground font-poppins">KI-Experte</div>
                <div className="text-xs text-muted-foreground">98,3% Erfolgsrate</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-poppins">Produkt</h3>
            <ul className="space-y-3">
              <li><Button variant="link" onClick={() => navigate('/lawn-analysis')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">KI-Analyse</Button></li>
              <li><Button variant="link" onClick={() => navigate('/blog-overview')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Ratgeber</Button></li>
              <li><Button variant="link" onClick={() => navigate('/weather-advice')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Wetter-Tipps</Button></li>
              <li><Button variant="link" onClick={() => navigate('/')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Startseite</Button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-poppins">Unternehmen</h3>
            <ul className="space-y-3">
              <li><Button variant="link" onClick={() => navigate('/ueber-uns')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Über uns</Button></li>
              <li><Button variant="link" onClick={() => navigate('/kontakt')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Kontakt</Button></li>
              <li><span className="p-0 h-auto text-muted-foreground/50 cursor-not-allowed text-sm">Karriere</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-poppins">Rechtliches</h3>
            <ul className="space-y-3">
              <li><Button variant="link" onClick={() => navigate('/datenschutz')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Datenschutz</Button></li>
              <li><Button variant="link" onClick={() => navigate('/agb')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">AGB</Button></li>
              <li><Button variant="link" onClick={() => navigate('/impressum')} className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors">Impressum</Button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm font-poppins">
              &copy; {new Date().getFullYear()} Rasenpilot - Deutschlands intelligentester KI-Rasenberater. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground font-poppins">
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
