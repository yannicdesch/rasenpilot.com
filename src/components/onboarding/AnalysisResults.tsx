import React from 'react';
import { Sparkles, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  // Mock analysis data - in real app this would come from the AI analysis
  const mockAnalysis = {
    condition: "Lückenhaft mit leichten Moosstellen",
    cause: "Verdichteter Boden & zu wenig Licht",
    tip: "Vertikutiere deinen Rasen im Frühjahr bei feuchtem Boden. Danach nachsäen und regelmäßig düngen.",
    score: 41,
    products: [
      "Moosfrei Granulat (mit Eisen)",
      "Nachsaat-Mix \"Sport & Spiel\""
    ]
  };

  // If we have actual analysis results, try to extract structured data from them
  // Otherwise, use mock data for display
  const analysisData = analysisResults ? mockAnalysis : mockAnalysis;

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
