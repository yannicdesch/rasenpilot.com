
import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnalysisResultsProps {
  analysisResults: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Sparkles className="h-6 w-6 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-green-800">
          Deine kostenlose Rasenanalyse ist fertig!
        </h3>
      </div>
      
      {/* Display the actual analysis results */}
      <div className="bg-white rounded-md p-4 border border-green-100 mb-4">
        <div 
          className="prose prose-green max-w-none text-sm"
          dangerouslySetInnerHTML={{ 
            __html: analysisResults?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/^🌱/gm, '<div class="mb-3">🌱')
              .replace(/^🛠️/gm, '</div><div class="mb-3">🛠️')
              .replace(/^💡/gm, '</div><div class="mb-3">💡')
              .replace(/^🛒/gm, '</div><div class="mb-3">🛒')
              .replace(/\n• /g, '<br>• ')
              .replace(/\n/g, '<br>')
              + '</div>' || ''
          }}
        />
      </div>
      
      <p className="text-gray-700 text-sm">
        Registriere dich kostenlos für weitere Analysen, detaillierte Pflegepläne und unbegrenzte Nutzung aller Features.
      </p>
    </div>
  );
};

export default AnalysisResults;
