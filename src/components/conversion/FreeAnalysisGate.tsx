import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Star, Zap, Target, CheckCircle, Shield } from 'lucide-react';

interface FreeAnalysisGateProps {
  score: number;
  onUpgrade: () => void;
  onEmailCapture: () => void;
}

const FreeAnalysisGate: React.FC<FreeAnalysisGateProps> = ({ 
  score, 
  onUpgrade, 
  onEmailCapture 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
      <CardHeader className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mx-auto mb-2">
          <Zap className="h-4 w-4" />
          7 Tage kostenlos testen
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Score: {score}/100
          </Badge>
        </div>
        <CardTitle className="text-xl text-gray-900">
          Vollständige Analyse & Pflegeplan freischalten
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white/60 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-green-600" />
            Was Sie mit Premium erhalten:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Detaillierte Teilbewertungen (Dichte, Feuchtigkeit, Boden)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Personalisierter 7-Tage-Aktionsplan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Unbegrenzte weitere Analysen</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Wetter-basierte Pflegeempfehlungen</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/subscription?ref=analysis')}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-base font-bold shadow-md"
          >
            <Crown className="mr-2 h-5 w-5" />
            7 Tage kostenlos starten
          </Button>
          
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
            <span>Danach ab</span>
            <span className="font-bold text-green-700">€9,99/Monat</span>
            <span>· Jederzeit kündbar</span>
          </div>
          
          <div className="text-center">
            <button 
              onClick={onEmailCapture}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Kostenlosen Grundplan per E-Mail erhalten
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>30 Tage Garantie</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>4,8/5 Bewertung</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeAnalysisGate;