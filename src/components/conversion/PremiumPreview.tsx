import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lightbulb, Target, Clock, Zap, CheckCircle, Star, Shield } from 'lucide-react';

interface PremiumPreviewProps {
  score: number;
  sampleProblems: string[];
  onUpgrade: (email?: string) => void;
}

const PremiumPreview: React.FC<PremiumPreviewProps> = ({ score, sampleProblems, onUpgrade }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Score Breakdown Preview */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Crown className="h-5 w-5" />
            Premium: Detaillierte Bewertung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-700">{Math.max(5, Math.floor(score * 0.8))}</div>
              <div className="text-xs text-yellow-600">Dichte</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded relative">
              <div className="text-2xl font-bold text-yellow-700 blur-sm">{Math.floor(score * 1.1)}</div>
              <div className="text-xs text-yellow-600 blur-sm">Farbe</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded relative">
              <div className="text-2xl font-bold text-yellow-700 blur-sm">{Math.floor(score * 0.9)}</div>
              <div className="text-xs text-yellow-600 blur-sm">Boden</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded relative">
              <div className="text-2xl font-bold text-yellow-700 blur-sm">{Math.floor(score * 1.2)}</div>
              <div className="text-xs text-yellow-600 blur-sm">Gesundheit</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Analysis Preview */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Lightbulb className="h-5 w-5" />
            Premium: Detaillierte Problemanalyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleProblems.slice(0, 2).map((problem, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-medium text-yellow-800">{problem}</div>
                <div className="text-sm text-yellow-600 mt-1">
                  + Detaillierte Ursachen und Lösungsschritte
                </div>
              </div>
            ))}
            <div className="relative p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="blur-sm">
                <div className="font-medium text-yellow-800">Weitere spezifische Probleme...</div>
                <div className="text-sm text-yellow-600 mt-1">+ Erweiterte Diagnose und Behandlung</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge className="bg-yellow-600 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan Preview */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Target className="h-5 w-5" />
            Premium: 7-Tage Aktionsplan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <div className="font-medium text-yellow-800">Tag 1-2: Sofortmaßnahmen</div>
                <div className="text-sm text-yellow-600">Erste Schritte zur Rasenerholung</div>
              </div>
            </div>
            
            <div className="relative p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-yellow-800">Tag 3-5: Intensive Behandlung</div>
                    <div className="text-sm text-yellow-600">Spezielle Pflegemaßnahmen...</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge className="bg-yellow-600 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>

            <div className="relative p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    7
                  </div>
                  <div>
                    <div className="font-medium text-yellow-800">Tag 6-7: Nachhaltung</div>
                    <div className="text-sm text-yellow-600">Langfristige Rasengesundheit...</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge className="bg-yellow-600 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Recommendations Preview */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Clock className="h-5 w-5" />
            Premium: Wetter-basierte Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <span className="font-medium text-blue-800">Heute:</span> Optimal für Bewässerung (18°C, bewölkt)
            </div>
            <div className="relative p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <div className="blur-sm">
                <span className="font-medium text-blue-800">Morgen:</span> Perfekt für Düngung...
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="h-3 w-3 text-yellow-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA - No email required, direct checkout */}
      <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              <Zap className="h-4 w-4" />
              7 Tage kostenlos testen
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Jetzt alle Details freischalten
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              Detaillierte Scores, Aktionsplan, Wetter-Empfehlungen & unbegrenzte Analysen
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => onUpgrade()}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumPreview;