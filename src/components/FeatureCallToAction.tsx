
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserRound, Check } from 'lucide-react';

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
        <Button 
          variant="outline"
          className="border-green-600 text-green-700 dark:border-green-400 dark:text-green-400 font-medium"
          onClick={() => navigate('/features')}
        >
          Mehr Infos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-green-100 dark:bg-green-900/40 border-2 border-green-300 dark:border-green-700 rounded-lg p-6 shadow-md ${className}`}>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
            Alle Premium-Funktionen freischalten
          </h3>
          <p className="text-green-700 dark:text-green-200 mt-1 font-medium">
            Erstellen Sie ein kostenloses Konto, um sofort Zugriff auf alle Tools zu erhalten:
          </p>
          
          <ul className="mt-3 space-y-2">
            <li className="flex items-center text-green-700 dark:text-green-200">
              <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Unbegrenzte Rasenanalysen mit Foto-Uploads</span>
            </li>
            <li className="flex items-center text-green-700 dark:text-green-200">
              <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Persönlicher Pflege-Kalender mit Erinnerungen</span>
            </li>
            <li className="flex items-center text-green-700 dark:text-green-200">
              <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Unbegrenzte Chatbot-Unterstützung für alle Fragen</span>
            </li>
          </ul>
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
          <Button 
            variant="outline"
            size="lg"
            className="border-green-600 text-green-700 dark:border-green-400 dark:text-green-400 font-medium"
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
