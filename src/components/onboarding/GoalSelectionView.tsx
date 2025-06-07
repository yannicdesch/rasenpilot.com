
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRight, Leaf } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface GoalSelectionViewProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const GoalSelectionView: React.FC<GoalSelectionViewProps> = ({
  data,
  updateData,
  onNext
}) => {
  const goals = [
    { id: 'gesund', title: 'Gesunder grüner Rasen', description: 'Allgemeine Rasengesundheit verbessern' },
    { id: 'dicht', title: 'Dichter Rasen', description: 'Kahle Stellen schließen und Dichte erhöhen' },
    { id: 'unkraut', title: 'Unkraut bekämpfen', description: 'Moos und Unkraut dauerhaft entfernen' },
    { id: 'pflegeleicht', title: 'Pflegeleichter Rasen', description: 'Weniger Aufwand bei der Rasenpflege' },
  ];

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Leaf className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-800">
          Willkommen bei Rasenpilot
        </CardTitle>
        <p className="text-gray-600">
          Lass uns deinen perfekten Rasen gemeinsam planen
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-4 block">
            Was ist dein Hauptziel für deinen Rasen?
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {goals.map((goal) => (
              <Button
                key={goal.id}
                variant="outline"
                onClick={() => updateData({ rasenziel: goal.id })}
                className={`h-auto p-4 border-2 transition-all hover:border-green-500 hover:bg-green-50 ${
                  data.rasenziel === goal.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="text-left w-full">
                  <div className="font-medium text-sm">{goal.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={onNext}
            disabled={!data.rasenziel}
            className="bg-green-600 hover:bg-green-700"
          >
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalSelectionView;
