import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only on desktop
    if (window.innerWidth < 768) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem('exitIntentShown')) {
        setShow(true);
        sessionStorage.setItem('exitIntentShown', '1');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        
        <p className="text-4xl mb-4">🌱</p>
        <h2 className="text-2xl font-bold text-foreground mb-3">Warte kurz!</h2>
        <p className="text-muted-foreground mb-6">
          Deine kostenlose Rasen-Analyse dauert nur 30 Sekunden.
        </p>
        <Button
          onClick={() => {
            setShow(false);
            navigate('/lawn-analysis');
          }}
          size="lg"
          className="w-full py-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          Jetzt kostenlos analysieren
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
