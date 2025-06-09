
import React from 'react';
import { Sparkles, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  // Parse the analysis results if they exist
  const parseAnalysisResults = (results: string | null) => {
    if (!results) {
      return {
        condition: "Analyse nicht verfügbar",
        cause: "Keine Daten erhalten",
        tip: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        score: 50,
        products: ["Basis-Rasenpflege", "Standarddünger"]
      };
    }

    // Try to extract structured information from the analysis text
    const lines = results.split('\n').filter(line => line.trim());
    
    // Look for health score in the text
    let score = 50; // default
    const healthLine = lines.find(line => line.includes('Gesamtgesundheit') || line.includes('/10'));
    if (healthLine) {
      const scoreMatch = healthLine.match(/(\d+)\/10/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]) * 10; // Convert to percentage
      }
    }

    // Extract main issues/problems
    const issueLines = lines.filter(line => 
      line.includes('Problem') || 
      line.includes('erkannt') || 
      line.includes('Ursache') ||
      line.includes('•')
    );
    
    const condition = issueLines.length > 0 
      ? issueLines[0].replace(/[•\-\*]/g, '').trim()
      : "Rasenprobleme erkannt";

    // Extract recommendations
    const recommendationLines = lines.filter(line => 
      line.includes('Empfehlung') || 
      line.includes('sollten') || 
      line.includes('Dünger') ||
      line.includes('Bewässer')
    );

    const tip = recommendationLines.length > 0
      ? recommendationLines[0].replace(/[•\-\*]/g, '').trim()
      : "Folgen Sie den detaillierten Empfehlungen in der Analyse.";

    // Extract product recommendations
    const productLines = lines.filter(line => 
      line.includes('Dünger') || 
      line.includes('Produkt') ||
      line.includes('Nachsaat') ||
      line.includes('Granulat')
    );

    const products = productLines.length > 0 
      ? productLines.slice(0, 2).map(line => line.replace(/[•\-\*]/g, '').trim())
      : ["Langzeitrasendünger", "Nachsaat-Mix"];

    return { condition, cause: "Basierend auf KI-Analyse", tip, score, products };
  };

  const analysisData = parseAnalysisResults(analysisResults);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-green-800 mb-2">
            🌿 Deine Rasenanalyse ist da!
          </h3>
          <p className="text-gray-700">
            📸 Wir haben dein Bild analysiert. Das Ergebnis:
          </p>
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          {/* Condition */}
          <div>
            <p className="text-gray-800">
              🟢 Zustand: <strong>{analysisData.condition}</strong>
            </p>
          </div>

          {/* Cause */}
          <div>
            <p className="text-gray-800">
              🧠 Wahrscheinlichste Ursache: {analysisData.cause}
            </p>
          </div>

          {/* Tip */}
          <div>
            <p className="text-gray-800">
              💡 <strong>Tipp:</strong><br />
              {analysisData.tip}
            </p>
          </div>

          {/* Score */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-800">
                📊 <strong>Dein Rasen-Score:</strong>
              </span>
              <span className="text-2xl font-bold text-green-600">
                {analysisData.score} %
              </span>
            </div>
            <p className="text-sm text-gray-700">
              🔒 Du kannst ihn auf <strong>90 %</strong> verbessern – wir zeigen dir wie!
            </p>
          </div>

          {/* Product Recommendations */}
          <div>
            <p className="font-semibold text-gray-800 mb-2">
              🧰 Produktempfehlungen:
            </p>
            <ul className="space-y-1">
              {analysisData.products.map((product, index) => (
                <li key={index} className="text-gray-700">
                  • {product}
                </li>
              ))}
            </ul>
          </div>

          {/* Show raw analysis if available */}
          {analysisResults && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Detaillierte KI-Analyse:</p>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {analysisResults}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-100 to-blue-50 rounded-lg p-6 text-center">
          <p className="text-lg font-bold text-gray-800 mb-4">
            👉 <strong>Jetzt kostenlos registrieren</strong>, um:
          </p>
          
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Deinen individuellen 14-Tage-Pflegeplan zu sehen</span>
            </div>
            <div className="flex items-center text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Weitere Analysen freizuschalten</span>
            </div>
            <div className="flex items-center text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span>Zugriff auf Rasen-Score-Verlauf & Wetterdaten zu erhalten</span>
            </div>
          </div>

          <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg">
            🔓 Jetzt freischalten
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
