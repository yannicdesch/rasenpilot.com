
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Upload, Leaf } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';
import LawnImageUpload from '@/components/LawnImageUpload';

interface OnboardingStartProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  isPhotoUpload?: boolean;
}

const OnboardingStart: React.FC<OnboardingStartProps> = ({ 
  data, 
  updateData, 
  onNext,
  isPhotoUpload = false
}) => {
  const [image, setImage] = useState(data.rasenbild);
  const [problem, setProblem] = useState(data.rasenproblem);

  const handleNext = () => {
    updateData({ 
      rasenbild: image,
      rasenproblem: problem
    });
    onNext();
  };

  const handleImageSelected = (imageUrl: string) => {
    setImage(imageUrl);
  };

  if (isPhotoUpload) {
    return (
      <Card className="border-green-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Lade ein Foto deines Rasens hoch
          </CardTitle>
          <p className="text-gray-600">
            Beginne mit einem Bild deines Rasens für die beste Beratung
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Rasenfoto hochladen
            </Label>
            <LawnImageUpload 
              onImageSelected={handleImageSelected}
              currentImage={image}
            />
            <p className="text-xs text-gray-500 mt-2">
              Lade ein aktuelles Bild deines Rasens hoch
            </p>
          </div>

          {/* Problem Description */}
          <div>
            <Label htmlFor="problem" className="text-sm font-medium mb-2 block">
              Beschreibe dein Rasenproblem (optional)
            </Label>
            <Textarea
              id="problem"
              placeholder="z.B. Gelbe Stellen trotz regelmäßigem Gießen, Moos breitet sich aus, kahle Stellen im Schatten..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Je detaillierter deine Beschreibung, desto besser können wir dir helfen
            </p>
          </div>

          <div className="flex justify-end pt-4">
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
  }

  // Original goal selection for when not used as photo upload
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
            {[
              { id: 'gesund', title: 'Gesunder grüner Rasen', description: 'Allgemeine Rasengesundheit verbessern' },
              { id: 'dicht', title: 'Dichter Rasen', description: 'Kahle Stellen schließen und Dichte erhöhen' },
              { id: 'unkraut', title: 'Unkraut bekämpfen', description: 'Moos und Unkraut dauerhaft entfernen' },
              { id: 'pflegeleicht', title: 'Pflegeleichter Rasen', description: 'Weniger Aufwand bei der Rasenpflege' },
            ].map((goal) => (
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
            onClick={handleNext}
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

export default OnboardingStart;
