
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface OnboardingTypeProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingType: React.FC<OnboardingTypeProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onBack 
}) => {
  const [grassType, setGrassType] = useState(data.rasentyp);

  const grassTypes = [
    { value: 'sport', label: 'Sportrasen', description: 'Robust und strapazierfähig' },
    { value: 'zier', label: 'Zierrasen', description: 'Fein und dekorativ' },
    { value: 'schatten', label: 'Schattenrasen', description: 'Für schattige Bereiche' },
    { value: 'weiss-nicht', label: 'Weiß nicht', description: 'Bin mir unsicher' },
  ];

  const handleNext = () => {
    updateData({ rasentyp: grassType });
    onNext();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-800">
          Rasentyp (optional)
        </CardTitle>
        <p className="text-gray-600">
          Falls bekannt, hilft uns das bei den Empfehlungen
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Select value={grassType} onValueChange={setGrassType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Rasentyp auswählen" />
            </SelectTrigger>
            <SelectContent>
              {grassTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {grassType && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-700">
              <strong>
                {grassTypes.find(t => t.value === grassType)?.label}
              </strong>
              {' - '}
              {grassTypes.find(t => t.value === grassType)?.description}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button 
            onClick={handleNext}
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

export default OnboardingType;
