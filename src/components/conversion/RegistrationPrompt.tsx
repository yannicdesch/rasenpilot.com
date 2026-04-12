import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Lock, Shield, TrendingUp } from 'lucide-react';

interface RegistrationPromptProps {
  score: number;
  jobId?: string;
}

const EXPIRY_KEY = 'analysis_expiry_';

const getExpiryTime = (jobId: string): number => {
  const key = EXPIRY_KEY + jobId;
  const stored = localStorage.getItem(key);
  if (stored) return parseInt(stored, 10);
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(key, expiry.toString());
  return expiry;
};

/** Inline banner shown right after score loads for anonymous users */
export const RegistrationBanner: React.FC<RegistrationPromptProps> = ({ score, jobId }) => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    const expiry = getExpiryTime(jobId);
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [jobId]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;

  return (
    <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg mb-6 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold tabular-nums">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>

        <h3 className="font-bold text-foreground text-base mb-1">
          Dein Ergebnis wird in 24 Stunden gelöscht
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Erstelle jetzt ein kostenloses Konto um es dauerhaft zu speichern und deinen Pflegefortschritt zu tracken.
        </p>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold"
          onClick={() => navigate(`/auth?redirect=/analysis-result/${jobId}&ref=result-save`)}
        >
          <Shield className="h-4 w-4 mr-2" />
          Kostenlos registrieren — Ergebnis speichern
        </Button>

        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> 100% kostenlos</span>
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Fortschritt tracken</span>
        </div>
      </CardContent>
    </Card>
  );
};

/** Overlay shown on blurred recommendation cards */
export const BlurredRecommendationOverlay: React.FC<{ jobId?: string }> = ({ jobId }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
      <div className="text-center px-4">
        <Lock className="h-6 w-6 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground mb-2">
          Registriere dich kostenlos um alle Empfehlungen zu sehen
        </p>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate(`/auth?redirect=/analysis-result/${jobId}&ref=blurred-rec`)}
        >
          Kostenlos freischalten
        </Button>
      </div>
    </div>
  );
};

export default RegistrationBanner;
