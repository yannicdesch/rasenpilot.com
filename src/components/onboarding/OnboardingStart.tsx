
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Crown, Clock } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface OnboardingStartProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const OnboardingStart: React.FC<OnboardingStartProps> = ({ data, updateData, onNext }) => {
  const goals = [
    {
      id: 'dicht-sattgruen',
      title: 'Dicht & sattgrün',
      description: 'Ein dichter, grüner Teppich',
      icon: Leaf,
    },
    {
      id: 'familienfreundlich',
      title: 'Familienfreundlich',
      description: 'Robust für Kinder und Haustiere',
      icon: Users,
    },
    {
      id: 'perfekter-zierrasen',
      title: 'Perfekter Zierrasen',
      description: 'Makellos und repräsentativ',
      icon: Crown,
    },
    {
      id: 'pflegeleicht',
      title: 'Pflegeleicht',
      description: 'Wenig Aufwand, gutes Ergebnis',
      icon: Clock,
    },
  ];

  const handleGoalSelect = (goalId: string) => {
    updateData({ rasenziel: goalId });
    onNext();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-800">
          Was ist dein Ziel für deinen Rasen?
        </CardTitle>
        <p className="text-gray-600">
          Wähle das Ziel aus, das am besten zu deinen Wünschen passt
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <Button
              key={goal.id}
              variant="outline"
              onClick={() => handleGoalSelect(goal.id)}
              className={`h-auto p-6 border-2 transition-all hover:border-green-500 hover:bg-green-50 ${
                data.rasenziel === goal.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <goal.icon className="h-8 w-8 text-green-600" />
                <div className="font-semibold text-gray-800">{goal.title}</div>
                <div className="text-sm text-gray-600">{goal.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingStart;
