
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisHeaderProps {
  score: number;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ score }) => {
  const getHealthStatus = (score: number) => {
    if (score >= 80) return 'Sehr gut';
    if (score >= 60) return 'Verbesserungsfähig';
    return 'Behandlung nötig';
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-green-800 mb-4">
          🌿 Deine umfassende Rasenanalyse
        </CardTitle>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-800">
              📊 Rasen-Gesundheit:
            </span>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-600">
                {score}%
              </span>
              <p className="text-sm text-gray-600">
                {getHealthStatus(score)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-1000" 
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default AnalysisHeader;
