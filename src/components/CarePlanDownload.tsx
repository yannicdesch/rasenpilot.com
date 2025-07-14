import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Calendar, FileText, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  overall_health: string;
  grass_condition: string;
  problems: string[];
  recommendations: string[];
  timeline: string;
  score: string;
  detailed_analysis?: string;
  next_steps?: string[];
}

interface CarePlanDownloadProps {
  analysisResult: AnalysisResult;
  grassType: string;
  lawnGoal: string;
}

const CarePlanDownload: React.FC<CarePlanDownloadProps> = ({ 
  analysisResult, 
  grassType, 
  lawnGoal 
}) => {
  const { toast } = useToast();

  const generateCarePlan = () => {
    const carePlan = `
RASENPILOT - 14-TAGE PFLEGEPLAN
===============================

RASEN-ANALYSE ERGEBNIS:
Gesundheitszustand: ${analysisResult.overall_health}%
Score: ${analysisResult.score}/100
Rasentyp: ${grassType || 'Nicht angegeben'}
Ziel: ${lawnGoal || 'Allgemeine Verbesserung'}

AKTUELLE SITUATION:
${analysisResult.grass_condition}

IDENTIFIZIERTE PROBLEME:
${analysisResult.problems.map((problem, index) => `${index + 1}. ${problem}`).join('\n')}

14-TAGE PFLEGEPLAN:
===================

WOCHE 1 (Tag 1-7):
------------------
Tag 1-2: Grundreinigung
- Rasen von Laub und Ästen befreien
- Erste Mähung bei trockenem Wetter
- Vertikutieren bei verdichtetem Boden

Tag 3-4: Bodenverbesserung  
- Boden pH-Wert testen
- Bei Bedarf kalken oder düngen
- Kahle Stellen mit Grassamen nachsäen

Tag 5-7: Erste Pflege
- Regelmäßig wässern (früh morgens)
- Unkraut manuell entfernen
- Erste Düngung mit Langzeitdünger

WOCHE 2 (Tag 8-14):
-------------------
Tag 8-10: Intensivpflege
- Zweite Mähung (nicht zu kurz)
- Bewässerung je nach Wetterlage
- Nachsaat bei Bedarf wiederholen

Tag 11-14: Stabilisierung
- Regelmäßige Bewässerung etablieren
- Unkrautkontrolle fortsetzen
- Rasenschnitt als Mulch verwenden

EMPFOHLENE MASSNAHMEN:
${analysisResult.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

NÄCHSTE SCHRITTE:
${analysisResult.next_steps ? analysisResult.next_steps.map((step, index) => `${index + 1}. ${step}`).join('\n') : 'Regelmäßige Pflege fortsetzen'}

ZEITPLAN FÜR OPTIMALE ERGEBNISSE:
${analysisResult.timeline}

TIPPS FÜR NACHHALTIGEN ERFOLG:
- Regelmäßiges Mähen (1x pro Woche)
- Bewässerung bei Trockenheit
- Unkrautkontrolle alle 2 Wochen
- Düngung alle 6-8 Wochen
- Vertikutieren 1-2x pro Jahr

Viel Erfolg bei der Rasenpflege!
Ihr Rasenpilot-Team

---
Erstellt am: ${new Date().toLocaleDateString('de-DE')}
    `;

    return carePlan;
  };

  const downloadCarePlan = () => {
    const carePlan = generateCarePlan();
    const blob = new Blob([carePlan], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rasenpilot_Pflegeplan_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Pflegeplan heruntergeladen!",
      description: "Ihr persönlicher 14-Tage Pflegeplan wurde erfolgreich heruntergeladen.",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4 md:p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-3">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ihr persönlicher 14-Tage Pflegeplan
          </h3>
          <p className="text-gray-600 text-sm md:text-base">
            Basierend auf Ihrer Rasen-Analyse haben wir einen detaillierten Pflegeplan erstellt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-lg">
            <Leaf className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-medium">Individuell</div>
            <div className="text-xs text-gray-500">Auf Ihren Rasen abgestimmt</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium">14 Tage</div>
            <div className="text-xs text-gray-500">Schritt-für-Schritt Plan</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <FileText className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-sm font-medium">Detailliert</div>
            <div className="text-xs text-gray-500">Alle Empfehlungen inklusive</div>
          </div>
        </div>

        <Button
          onClick={downloadCarePlan}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3"
        >
          <Download className="mr-2 h-4 w-4" />
          14-Tage Pflegeplan herunterladen
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Der Pflegeplan wird als Textdatei heruntergeladen und kann ausgedruckt werden.
        </p>
      </CardContent>
    </Card>
  );
};

export default CarePlanDownload;