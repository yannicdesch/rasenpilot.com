
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserRound } from 'lucide-react';

interface FeatureCallToActionProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

const FeatureCallToAction = ({ 
  variant = 'default',
  className = '' 
}: FeatureCallToActionProps) => {
  const navigate = useNavigate();

  if (variant === 'minimal') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        <Button 
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          onClick={() => navigate('/auth')}
        >
          <UserRound className="mr-2 h-4 w-4" />
          Kostenlos anmelden
        </Button>
        <Button 
          variant="outline"
          className="border-green-600 text-green-700 dark:border-green-400 dark:text-green-400"
          onClick={() => navigate('/features')}
        >
          Mehr Infos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-400">
            Alle Premium-Funktionen freischalten
          </h3>
          <p className="text-green-700 dark:text-green-300 mt-1">
            Erstellen Sie ein kostenloses Konto, um personalisierte Pflegepläne und mehr zu erhalten
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            size="lg"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            onClick={() => navigate('/auth')}
          >
            <UserRound className="mr-2 h-4 w-4" />
            Kostenlos anmelden
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="border-green-600 text-green-700 dark:border-green-400 dark:text-green-400"
            onClick={() => navigate('/features')}
          >
            Mehr Infos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureCallToAction;
