import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Star, Zap, Target } from 'lucide-react';

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
  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-600" />
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            Score: {score}/100
          </Badge>
        </div>
        <CardTitle className="text-xl text-yellow-800">
          Möchten Sie die vollständige Analyse sehen?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white/60 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Was Sie zusätzlich erhalten:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Detaillierte Teilbewertungen (Dichte, Feuchtigkeit, Boden)</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-yellow-500" />
              <span>Personalisierter 7-Tage-Aktionsplan</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>PDF-Download für Ihren Pflegeplan</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Unbegrenzte weitere Analysen</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3"
          >
            <Crown className="mr-2 h-4 w-4" />
            Premium für €9,99/Monat
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            oder
          </div>
          
          <Button 
            onClick={onEmailCapture}
            variant="outline"
            className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            Kostenlosen Grundplan per E-Mail erhalten
          </Button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          ✓ Jederzeit kündbar ✓ 30 Tage Geld-zurück-Garantie
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeAnalysisGate;