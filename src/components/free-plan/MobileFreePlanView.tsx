
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import OnboardingWizard from '@/components/OnboardingWizard';
import ConversionPrompt from '@/components/ConversionPrompt';

interface MobileFreePlanViewProps {
  formSubmitted: boolean;
  onRegister: () => void;
  onQuickRegister: (email: string) => void;
  onContinueWithoutRegistration: () => void;
  onboardingComplete: (data: any) => void;
  onboardingSkip: () => void;
}

const MobileFreePlanView: React.FC<MobileFreePlanViewProps> = ({
  formSubmitted,
  onRegister,
  onQuickRegister,
  onContinueWithoutRegistration,
  onboardingComplete,
  onboardingSkip
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow pt-4 px-4">
        <div className="max-w-lg mx-auto">
          {!formSubmitted ? (
            <OnboardingWizard
              onComplete={onboardingComplete}
              onSkip={onboardingSkip}
            />
          ) : (
            <ConversionPrompt 
              onRegister={onRegister}
              onQuickRegister={onQuickRegister}
              onContinueWithoutRegistration={onContinueWithoutRegistration}
            />
          )}
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default MobileFreePlanView;
