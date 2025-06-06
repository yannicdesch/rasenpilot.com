
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import OnboardingStart from './OnboardingStart';
import OnboardingLocation from './OnboardingLocation';
import OnboardingArea from './OnboardingArea';
import OnboardingType from './OnboardingType';
import OnboardingRegister from './OnboardingRegister';
import { Progress } from '@/components/ui/progress';

export interface OnboardingData {
  rasenziel: string;
  standort: string;
  wetterzone: string;
  rasenzustand: string;
  rasenfläche: number;
  rasentyp: string;
  rasenproblem: string;
  rasenbild: string;
  consent_ai_training: boolean;
}

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { setTemporaryProfile, isAuthenticated } = useLawn();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    rasenziel: '',
    standort: '',
    wetterzone: '',
    rasenzustand: '',
    rasenfläche: 100,
    rasentyp: '',
    rasenproblem: '',
    rasenbild: '',
    consent_ai_training: false,
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // This is called when skipping registration
    // Create temporary profile from onboarding data
    const tempProfile = {
      zipCode: onboardingData.standort,
      grassType: onboardingData.rasentyp || 'weiss-nicht',
      lawnSize: onboardingData.rasenfläche.toString(),
      lawnGoal: onboardingData.rasenziel,
      rasenproblem: onboardingData.rasenproblem,
      rasenbild: onboardingData.rasenbild,
      analysisResults: null,
      analyzesUsed: 0,
    };
    
    setTemporaryProfile(tempProfile);
    
    // If there's a problem description, go to analysis results
    if (onboardingData.rasenproblem) {
      navigate('/analysis-results');
    } else {
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStart
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={nextStep}
            isPhotoUpload={true}
          />
        );
      case 2:
        return (
          <OnboardingLocation
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <OnboardingArea
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <OnboardingType
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <OnboardingRegister
            data={onboardingData}
            updateData={updateOnboardingData}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Schritt {currentStep} von {totalSteps}</span>
              <span>{Math.round(progress)}% fertig</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
