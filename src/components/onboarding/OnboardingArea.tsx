
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Smile, Frown, AlertTriangle, Droplets, HelpCircle } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface OnboardingAreaProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingArea: React.FC<OnboardingAreaProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onBack 
}) => {
  const [area, setArea] = useState([data.rasenfläche]);
  const [condition, setCondition] = useState(data.rasenzustand);

  const conditions = [
    {
      id: 'gesund',
      title: 'Gesund',
      description: 'Grün und dicht',
      icon: Smile,
      color: 'text-green-600'
    },
    {
      id: 'luecken',
      title: 'Lücken',
      description: 'Kahle Stellen',
      icon: Frown,
      color: 'text-orange-600'
    },
    {
      id: 'moos',
      title: 'Moos',
      description: 'Moosbefall',
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      id: 'trocken',
      title: 'Trocken',
      description: 'Braune Stellen',
      icon: Droplets,
      color: 'text-red-600'
    },
    {
      id: 'weiss-nicht',
      title: 'Weiß nicht',
      description: 'Bin unsicher',
      icon: HelpCircle,
      color: 'text-gray-600'
    },
  ];

  const handleNext = () => {
    if (!condition) {
      return;
    }
    
    updateData({ 
      rasenfläche: area[0],
      rasenzustand: condition
    });
    onNext();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-800">
          Rasenfläche & Zustand
        </CardTitle>
        <p className="text-gray-600">
          Hilf uns, deinen Rasen besser zu verstehen
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Area Slider */}
        <div>
          <Label className="text-sm font-medium mb-4 block">
            Rasenfläche: {area[0]} m²
          </Label>
          <Slider
            value={area}
            onValueChange={setArea}
            max={1000}
            min={20}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>20 m²</span>
            <span>1000 m²</span>
          </div>
        </div>

        {/* Condition Selection */}
        <div>
          <Label className="text-sm font-medium mb-4 block">
            Wie sieht dein Rasen aus?
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {conditions.map((cond) => (
              <Button
                key={cond.id}
                variant="outline"
                onClick={() => setCondition(cond.id)}
                className={`h-auto p-4 border-2 transition-all hover:border-green-500 hover:bg-green-50 ${
                  condition === cond.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <cond.icon className={`h-6 w-6 ${cond.color}`} />
                  <div className="font-medium text-sm">{cond.title}</div>
                  <div className="text-xs text-gray-600">{cond.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {condition === 'weiss-nicht' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-3">
              Du kannst später ein Bild hochladen und unsere KI wird deinen Rasen analysieren.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {/* TODO: Navigate to analyzer */}}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              Rasen-Analyzer öffnen
            </Button>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!condition}
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

export default OnboardingArea;
