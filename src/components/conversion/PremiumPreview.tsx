import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, ArrowRight, Lightbulb, Target, Clock, Zap } from 'lucide-react';

interface PremiumPreviewProps {
  score: number;
  sampleProblems: string[];
  onUpgrade: (email?: string) => void;
}

const PremiumPreview: React.FC<PremiumPreviewProps> = ({ score, sampleProblems, onUpgrade }) => {
  const [email, setEmail] = useState('');
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

      {/* Upgrade CTA */}
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-yellow-800 mb-2">
              Premium abonnieren
            </h3>
            <p className="text-yellow-700 text-sm mb-4">
              Erhalten Sie Zugang zu allen detaillierten Analysen, personalisierten Pflegeplänen und unbegrenzten weiteren Analysen
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="mb-4">
              <Label htmlFor="premium-email" className="block text-sm font-medium text-yellow-700 mb-2">
                E-Mail für Premium-Zugang
              </Label>
              <Input
                id="premium-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre.email@beispiel.de"
                className="w-full border-yellow-300 focus:border-yellow-500"
                required
              />
            </div>
            
            <Button 
              onClick={() => onUpgrade(email)}
              disabled={!email || !email.includes('@')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="mr-2 h-4 w-4" />
              Premium für €9,99/Monat
            </Button>
            
            <div className="text-xs text-yellow-600">
              ✓ 30 Tage Geld-zurück-Garantie ✓ Jederzeit kündbar
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumPreview;