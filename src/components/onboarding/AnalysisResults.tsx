
import React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, UserPlus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  // Parse the analysis results if they exist
  const parseAnalysisResults = (results: string | null) => {
    if (!results) {
      return {
        problem: "Nährstoffmangel oder Wasserproblem erkannt",
        cause: "Basierend auf KI-Analyse",
        solutions: [
          "Bodentest durchführen (pH-Wert und Nährstoffe)",
          "Regelmäßig aber tief bewässern",
          "Ausgewogenen Rasendünger verwenden",
          "Verdichtete Bereiche lockern"
        ],
        score: 65
      };
    }

    // Try to extract structured information from the analysis text
    const lines = results.split('\n').filter(line => line.trim());
    
    // Look for health score in the text
    let score = 65; // default
    const healthLine = lines.find(line => line.includes('Gesamtgesundheit') || line.includes('/10'));
    if (healthLine) {
      const scoreMatch = healthLine.match(/(\d+)\/10/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]) * 10; // Convert to percentage
      }
    }

    // Extract main issues/problems
    const problemLine = lines.find(line => 
      line.includes('Diagnose') || line.includes('Problem') || line.includes('Zustand')
    );
    
    // Adjust problem description based on score
    let problem;
    if (score >= 85) {
      problem = "Ihr Rasen ist in sehr gutem Zustand";
    } else if (score >= 70) {
      problem = "Ihr Rasen hat kleinere Verbesserungsmöglichkeiten";
    } else {
      problem = problemLine ? problemLine.replace(/[🌱🔍]/g, '').replace(/\*\*/g, '').trim() : 
        'Nährstoffmangel oder Wasserproblem erkannt';
    }

    // Extract cause
    const causeLine = lines.find(line => line.includes('Ursache') || line.includes('wahrscheinlich'));
    let cause;
    if (score >= 85) {
      cause = "Basierend auf KI-Analyse - Optimierungspotential vorhanden";
    } else {
      cause = causeLine ? causeLine.replace(/[🧠]/g, '').replace(/\*\*/g, '').trim() : 
        'Basierend auf KI-Analyse';
    }

    // Extract solutions or provide optimization tips for high scores
    const solutionLines = lines.filter(line => 
      line.includes('Empfehlung') || line.includes('Behandlung') || line.includes('- ')
    ).slice(0, 4);
    
    let solutions;
    if (score >= 85) {
      // Optimization tips for already good lawns
      solutions = [
        "Regelmäßige Bodenanalyse für Feintuning (2x jährlich)",
        "Saisonale Düngung mit Langzeitdünger optimieren",
        "Bewässerungszeiten perfektionieren (früh morgens)",
        "Mährhythmus für dichteres Wachstum anpassen"
      ];
    } else if (solutionLines.length > 0) {
      solutions = solutionLines.map(line => line.replace(/[🛠️💡-]/g, '').replace(/\*\*/g, '').trim());
    } else {
      solutions = [
        "Bodentest durchführen (pH-Wert und Nährstoffe)",
        "Regelmäßig aber tief bewässern",
        "Ausgewogenen Rasendünger verwenden",
        "Verdichtete Bereiche lockern"
      ];
    }

    return { problem, cause, solutions, score };
  };

  const analysisData = parseAnalysisResults(analysisResults);

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card className="border-green-100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-green-800 mb-4">
            🌿 Deine Rasenanalyse ist da!
          </CardTitle>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-gray-800">
                📊 Dein Rasen-Score:
              </span>
              <span className="text-3xl font-bold text-green-600">
                {analysisData.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${analysisData.score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              🎯 Ziel: <strong>100%</strong> - Wir zeigen dir wie!
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Problem/Status Identification */}
      <Card className={analysisData.score >= 85 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {analysisData.score >= 85 ? (
              <Target className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            )}
            <CardTitle className={`text-lg ${analysisData.score >= 85 ? 'text-green-800' : 'text-orange-800'}`}>
              {analysisData.score >= 85 ? 'Aktueller Zustand' : 'Erkanntes Problem'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800 mb-1">🟢 Zustand:</p>
              <p className="text-gray-700">{analysisData.problem}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">🧠 Analyse:</p>
              <p className="text-gray-700">{analysisData.cause}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solutions/Optimization */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">
              {analysisData.score >= 85 ? 'Optimierungsempfehlungen' : 'Lösungsempfehlungen'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysisData.solutions.map((solution, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{solution}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration CTA */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">
                Jetzt kostenlos registrieren für:
              </h3>
            </div>
            
            <div className="space-y-2 mb-6 text-left">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Unbegrenzte KI-Analysen</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Personalisierte Pflegepläne</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Fortschritts-Tracking</span>
              </div>
            </div>

            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3">
              <UserPlus className="mr-2 h-5 w-5" />
              Kostenlos registrieren
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
