
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
    location: '',
    grassType: '',
    goal: '',
    gardenSize: '',
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
    if (step === 1 && !formData.location) {
      toast.error("Bitte gib deinen Standort ein");
      return;
    } else if (step === 2 && !formData.grassType) {
      toast.error("Bitte wähle deinen Rasentyp aus");
      return;
    } else if (step === 3 && !formData.goal) {
      toast.error("Bitte wähle dein Rasenziel aus");
      return;
    }
    
    // Move to next step
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit data and complete
      setTemporaryProfile(formData);
      
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
            <h3 className="text-lg font-medium">Wo befindet sich dein Rasen?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Dies hilft uns, klimatische Bedingungen zu berücksichtigen.
            </p>
            <Input
              placeholder="z.B. Berlin, München, Köln"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Welchen Rasentyp hast du?</h3>
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
            <h3 className="text-lg font-medium">Was ist dein Hauptziel?</h3>
            <RadioGroup 
              value={formData.goal}
              onValueChange={(value) => handleInputChange('goal', value)}
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
            <h3 className="text-lg font-medium">Zusatzinformationen (optional)</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gardenSize">Ungefähre Rasenfläche (m²)</Label>
                <Input
                  id="gardenSize"
                  placeholder="z.B. 100"
                  value={formData.gardenSize}
                  onChange={(e) => handleInputChange('gardenSize', e.target.value)}
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
    <Card className="w-full max-w-lg mx-auto shadow-lg border-green-100">
      <CardHeader>
        <CardTitle className="text-green-800">Erstelle deinen persönlichen Rasenpflegeplan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-xs text-gray-500">
            <span>Start</span>
            <span>Fertig</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
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
            >
              Überspringen
            </Button>
          )}
        </div>
        <Button 
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700"
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
