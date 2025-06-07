
import React from 'react';
import { Loader2 } from 'lucide-react';

const AnalysisLoading: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <Loader2 className="h-6 w-6 text-blue-600 mr-2 animate-spin" />
        <h3 className="text-lg font-semibold text-blue-800">
          KI analysiert dein Rasenbild...
        </h3>
      </div>
      <p className="text-blue-700 text-center">
        Bitte warte einen Moment, während unsere KI dein Bild analysiert und personalisierte Empfehlungen erstellt.
      </p>
    </div>
  );
};

export default AnalysisLoading;
