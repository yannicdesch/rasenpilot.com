import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { toast } from '@/components/ui/sonner';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const navigate = useNavigate();
  const { setTemporaryProfile } = useLawn();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    zipCode: '',
    grassType: '',
    lawnGoal: '',
    lawnSize: '',
    hasChildren: false,
    hasPets: false,
  });
  
  const totalSteps = 4;
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.zipCode) {
      toast.error("Bitte gib deine Postleitzahl ein");
      return;
    } else if (step === 2 && !formData.grassType) {
      toast.error("Bitte wähle deinen Rasentyp aus");
      return;
    } else if (step === 3 && !formData.lawnGoal) {
      toast.error("Bitte wähle dein Rasenziel aus");
      return;
    }
    
    // Move to next step
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit data and complete
      setTemporaryProfile({
        zipCode: formData.zipCode,
        grassType: formData.grassType,
        lawnSize: formData.lawnSize,
        lawnGoal: formData.lawnGoal,
        hasChildren: formData.hasChildren,
        hasPets: formData.hasPets,
      });
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate('/dashboard');
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">Wo befindet sich dein Rasen?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Dies hilft uns, klimatische Bedingungen zu berücksichtigen.
            </p>
            <Input
              placeholder="Deine Postleitzahl"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">Welchen Rasentyp hast du?</h3>
            <RadioGroup 
              value={formData.grassType}
              onValueChange={(value) => handleInputChange('grassType', value)}
            >
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="cursor-pointer flex-grow">Standardrasen</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="sport" id="sport" />
                <Label htmlFor="sport" className="cursor-pointer flex-grow">Sportrasen</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="shade" id="shade" />
                <Label htmlFor="shade" className="cursor-pointer flex-grow">Schattenrasen</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="unknown" id="unknown" />
                <Label htmlFor="unknown" className="cursor-pointer flex-grow">Weiß nicht</Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">Was ist dein Hauptziel?</h3>
            <RadioGroup 
              value={formData.lawnGoal}
              onValueChange={(value) => handleInputChange('lawnGoal', value)}
            >
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="health" id="health" />
                <Label htmlFor="health" className="cursor-pointer flex-grow">Allgemeine Rasengesundheit</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="appearance" id="appearance" />
                <Label htmlFor="appearance" className="cursor-pointer flex-grow">Besseres Aussehen</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="weeds" id="weeds" />
                <Label htmlFor="weeds" className="cursor-pointer flex-grow">Unkrautbekämpfung</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="drought" id="drought" />
                <Label htmlFor="drought" className="cursor-pointer flex-grow">Trockenschutz</Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-800">Zusatzinformationen</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gardenSize">Ungefähre Rasenfläche (m²)</Label>
                <Input
                  id="gardenSize"
                  placeholder="z.B. 100"
                  value={formData.lawnSize}
                  onChange={(e) => handleInputChange('lawnSize', e.target.value)}
                  className="w-full mt-1"
                />
              </div>
              <div className="flex items-center space-x-2 p-2">
                <input 
                  type="checkbox" 
                  id="children" 
                  checked={formData.hasChildren}
                  onChange={(e) => handleInputChange('hasChildren', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="children" className="cursor-pointer flex-grow">Kinder nutzen den Rasen</Label>
              </div>
              <div className="flex items-center space-x-2 p-2">
                <input 
                  type="checkbox"  
                  id="pets"
                  checked={formData.hasPets} 
                  onChange={(e) => handleInputChange('hasPets', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="pets" className="cursor-pointer flex-grow">Haustiere nutzen den Rasen</Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full border-green-100 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-green-800">Erstelle deinen persönlichen Rasenpflegeplan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-xs text-gray-500">
            <span>Start</span>
            <span>Fertig</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="mt-2 text-right text-sm text-gray-600">
            Schritt {step} von {totalSteps}
          </div>
        </div>
        
        <div className="py-4">
          {renderStep()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div>
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Zurück
            </Button>
          ) : (
            <Button 
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500"
            >
              Überspringen
            </Button>
          )}
        </div>
        <Button 
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700 flex items-center"
        >
          {step === totalSteps ? (
            <>
              Fertigstellen <Check className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Weiter <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingWizard;
