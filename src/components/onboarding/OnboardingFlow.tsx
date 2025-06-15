
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import OnboardingStart from './OnboardingStart';
import OnboardingLocation from './OnboardingLocation';
import OnboardingArea from './OnboardingArea';
import OnboardingType from './OnboardingType';
import OnboardingRegister from './OnboardingRegister';
import { Progress } from '@/components/ui/progress';
import { useInteractionTracking } from '@/hooks/useJourneyTracking';
import { trackConversion, trackFormAbandonment } from '@/lib/analytics/userJourneyTracking';

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
  analysisCompleted?: boolean;
}

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { setTemporaryProfile, isAuthenticated } = useLawn();
  const { trackButtonClick } = useInteractionTracking('/onboarding');
  
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
    analysisCompleted: false,
  });

  const totalSteps = 2; // Nur Photo Upload + Registration
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
      trackButtonClick('onboarding_next', { step: currentStep, nextStep: currentStep + 1 });
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      trackButtonClick('onboarding_back', { step: currentStep, prevStep: currentStep - 1 });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnalysisComplete = () => {
    console.log('Analysis completed, moving to registration');
    trackConversion('analysis_completed', '/onboarding', undefined, { step: currentStep });
    updateOnboardingData({ analysisCompleted: true });
    // Move to registration step (step 2)
    setCurrentStep(2);
  };

  const handleComplete = () => {
    // This is called when skipping registration
    trackConversion('onboarding_completed_without_registration', '/onboarding');
    
    // Create temporary profile from onboarding data
    const tempProfile = {
      zipCode: onboardingData.standort,
      grassType: onboardingData.rasentyp || 'weiss-nicht',
      lawnSize: onboardingData.rasenfläche.toString(),
      lawnGoal: onboardingData.rasenziel,
      rasenproblem: onboardingData.rasenproblem,
      rasenbild: onboardingData.rasenbild,
      analysisResults: null,
      analyzesUsed: 1, // They used their free analysis
    };
    
    setTemporaryProfile(tempProfile);
    
    // Mark free analysis as used
    localStorage.setItem('freeAnalysisUsed', 'true');
    
    navigate('/dashboard');
  };

  // Track form abandonment when component unmounts
  useEffect(() => {
    return () => {
      if (currentStep < totalSteps) {
        const completedFields = Object.values(onboardingData).filter(value => 
          value !== '' && value !== false && value !== 0
        ).length;
        const totalFields = Object.keys(onboardingData).length;
        
        trackFormAbandonment('onboarding_flow', '/onboarding', completedFields, totalFields);
      }
    };
  }, [currentStep, onboardingData, totalSteps]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStart
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={nextStep}
            onAnalysisComplete={handleAnalysisComplete}
            isPhotoUpload={true}
          />
        );
      case 2:
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
