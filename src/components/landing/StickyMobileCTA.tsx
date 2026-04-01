
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const StickyMobileCTA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide on /lawn-analysis page
  if (!visible || location.pathname === '/lawn-analysis') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl md:hidden">
      <Button
        onClick={() => navigate('/lawn-analysis')}
        className="w-full py-5 min-h-[56px] text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
      >
        Rasen kostenlos analysieren
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default StickyMobileCTA;
