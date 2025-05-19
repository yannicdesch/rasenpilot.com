
import React from 'react';
import { Calendar, MessageSquare } from 'lucide-react';

const FeatureCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-5 w-5 text-green-600" />
          <h3 className="font-medium">14-Tage Pflegeplan</h3>
        </div>
        <p className="text-sm text-gray-600">
          Tägliche Pflegeaufgaben für gesundes Rasenwachstum
        </p>
      </div>
      
      <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          <h3 className="font-medium">KI-Chat Assistent</h3>
        </div>
        <p className="text-sm text-gray-600">
          Beantwortet deine Fragen zur Rasenpflege
        </p>
      </div>
    </div>
  );
};

export default FeatureCards;
