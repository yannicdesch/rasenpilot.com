
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Rocket } from 'lucide-react';

const StickyMobileCTA = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl md:hidden">
      <Button
        onClick={() => navigate('/lawn-analysis')}
        className="w-full py-5 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-poppins"
      >
        <Rocket className="mr-2 h-5 w-5" />
        Kostenlose Analyse starten
      </Button>
    </div>
  );
};

export default StickyMobileCTA;
