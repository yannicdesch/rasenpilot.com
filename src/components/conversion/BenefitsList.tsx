
import React from 'react';
import { Check } from 'lucide-react';

const BenefitsList: React.FC = () => {
  return (
    <div className="space-y-3 text-left max-w-md mx-auto mb-6">
      <div className="flex items-start">
        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
        <span>Zugriff auf deinen vollständigen Plan</span>
      </div>
      <div className="flex items-start">
        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
        <span>Wetter-Updates & Erinnerungen</span>
      </div>
      <div className="flex items-start">
        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
        <span>KI-Chat & Fortschrittsverlauf</span>
      </div>
      <div className="flex items-start">
        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
        <span>Später kostenlos erweitern möglich</span>
      </div>
    </div>
  );
};

export default BenefitsList;
