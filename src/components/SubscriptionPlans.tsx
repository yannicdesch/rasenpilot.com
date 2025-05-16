
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlansProps {
  onSelectPlan?: () => void;
  variant?: 'full' | 'compact';
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, variant = 'full' }) => {
  const navigate = useNavigate();
  
  const handleSelectPlan = () => {
    if (onSelectPlan) {
      onSelectPlan();
    } else {
      navigate('/auth');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="border-green-200 shadow-md relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Kostenlos</CardTitle>
            <CardDescription>Für alle Rasenpfleger</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-3xl font-bold mb-4">€0 <span className="text-sm font-normal text-gray-500">für immer</span></p>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Rasenpflegeplan</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>KI-Analyse</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Chat-Unterstützung</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSelectPlan}>
              Jetzt registrieren
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8">
        <Card className="border-green-200 shadow-md h-full">
          <CardHeader>
            <CardTitle>Kostenlos</CardTitle>
            <CardDescription>Für alle Rasenpfleger</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold">€0</p>
              <p className="text-sm text-gray-500">für immer</p>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Rasenpflegeplan</span>
                  <p className="text-xs text-gray-500">Personalisierter Plan für Ihren Rasen</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">KI-Analyse</span>
                  <p className="text-xs text-gray-500">Intelligente Analyse Ihres Rasens</p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Chat-Unterstützung</span>
                  <p className="text-xs text-gray-500">Hilfe bei allen Rasenfragen</p>
                </div>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSelectPlan}>
              Jetzt registrieren
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
