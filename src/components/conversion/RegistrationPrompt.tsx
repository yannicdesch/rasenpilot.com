import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Lock, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface RegistrationPromptProps {
  score: number;
  jobId?: string;
  /** When the analysis completed — anchors the 60-min countdown */
  startTime?: string | number;
}

const EXPIRY_KEY = 'analysis_expiry_';
const EXPIRY_MS = 60 * 60 * 1000; // 60 minutes

const getExpiryTime = (jobId: string, startTime?: string | number): number => {
  const key = EXPIRY_KEY + jobId;
  const stored = localStorage.getItem(key);
  if (stored) return parseInt(stored, 10);
  const baseMs = startTime
    ? typeof startTime === 'number'
      ? startTime
      : new Date(startTime).getTime()
    : Date.now();
  const expiry = baseMs + EXPIRY_MS;
  localStorage.setItem(key, expiry.toString());
  return expiry;
};

/** Inline banner shown right after score loads for anonymous users */
export const RegistrationBanner: React.FC<RegistrationPromptProps> = ({ score, jobId, startTime }) => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!jobId) return;
    const expiry = getExpiryTime(jobId, startTime);
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [jobId, startTime]);

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  // Urgency states
  const isCritical = secondsLeft > 0 && secondsLeft < 120; // < 2 min → pulse
  const isUrgent = secondsLeft > 0 && secondsLeft < 600;   // < 10 min → red bg

  const cardClasses = isUrgent
    ? 'border-red-300 bg-gradient-to-r from-red-50 to-rose-100 shadow-lg mb-6 overflow-hidden'
    : 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg mb-6 overflow-hidden';

  const dotClasses = isUrgent
    ? 'w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0'
    : 'w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0';

  const timerClasses = `flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold tabular-nums ${isCritical ? 'animate-pulse' : ''}`;

  return (
    <Card className={cardClasses}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className={dotClasses}>
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div className={timerClasses}>
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          {isUrgent && (
            <span className={`inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-200 px-2 py-1 rounded-full ${isCritical ? 'animate-pulse' : ''}`}>
              <AlertTriangle className="h-3 w-3" /> Bald gelöscht!
            </span>
          )}
        </div>

        <h3 className="font-bold text-foreground text-base mb-1">
          Dein Ergebnis wird in 60 Minuten gelöscht
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

/** Overlay shown on a blurred recommendation card with a unique message per step */
export const BlurredRecommendationOverlay: React.FC<{
  jobId?: string;
  stepNumber: 2 | 3;
  score: number;
}> = ({ jobId, stepNumber, score }) => {
  const navigate = useNavigate();

  const title = stepNumber === 2
    ? `Schritt 2: Dein persönlicher Düngungsplan`
    : `Schritt 3: 4-Wochen Pflegeplan`;

  const subtitle = stepNumber === 2
    ? `abgestimmt auf deinen Rasen-Score von ${score}`
    : `was du diese Saison tun musst`;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm rounded-xl">
      <div className="text-center px-4 max-w-xs">
        <Lock className="h-6 w-6 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground leading-snug">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mb-3 mt-1">
          — {subtitle}
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
