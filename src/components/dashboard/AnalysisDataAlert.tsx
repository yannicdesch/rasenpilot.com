
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Sparkles } from 'lucide-react';

interface AnalysisDataAlertProps {
  hasAnalysisData: boolean;
}

const AnalysisDataAlert: React.FC<AnalysisDataAlertProps> = ({ hasAnalysisData }) => {
  if (!hasAnalysisData) return null;

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Sparkles className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800 mb-1">
              KI-Analyse verfügbar
            </h3>
            <p className="text-green-700">
              Ihre Rasenanalyse wurde erfolgreich übertragen und fließt in Ihre Empfehlungen ein.
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisDataAlert;
