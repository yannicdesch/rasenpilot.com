
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
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium"
          onClick={() => navigate('/auth')}
        >
          <UserRound className="mr-2 h-4 w-4" />
          Kostenlos anmelden
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-green-100 dark:bg-green-900/40 border-2 border-green-300 dark:border-green-700 rounded-lg p-6 shadow-md ${className}`}>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
            Jetzt kostenloses Konto erstellen
          </h3>
          <p className="text-green-700 dark:text-green-200 mt-1">
            Erstellen Sie ein kostenloses Konto und erhalten Sie Zugang zu allen Funktionen:
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          <Button 
            size="lg"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium shadow-sm"
            onClick={() => navigate('/auth')}
          >
            <UserRound className="mr-2 h-4 w-4" />
            Kostenlos anmelden
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureCallToAction;
