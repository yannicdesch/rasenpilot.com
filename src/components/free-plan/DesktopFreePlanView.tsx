
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import FreePlanForm from '@/components/FreePlanForm';
import ConversionPrompt from '@/components/ConversionPrompt';
import FreePlanHero from '@/components/FreePlanHero';
import OnboardingWizard from '@/components/OnboardingWizard';
import FeatureCallToAction from '@/components/FeatureCallToAction';

interface DesktopFreePlanViewProps {
  formSubmitted: boolean;
  showForm: boolean;
  onFormSubmit: (data: any) => void;
  onRegister: () => void;
  onQuickRegister: (email: string) => void;
  onContinueWithoutRegistration: () => void;
  onboardingComplete: (data: any) => void;
  onboardingSkip: () => void;
}

const DesktopFreePlanView: React.FC<DesktopFreePlanViewProps> = ({
  formSubmitted,
  showForm,
  onFormSubmit,
  onRegister,
  onQuickRegister,
  onContinueWithoutRegistration,
  onboardingComplete,
  onboardingSkip
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <FreePlanHero />
        
        {/* Main Content Section */}
        <section className="py-8 bg-white rounded-t-3xl shadow-inner">
          <div className="container mx-auto px-4">
            {!formSubmitted ? (
              <div className="max-w-lg mx-auto">
                <OnboardingWizard
                  onComplete={onboardingComplete}
                  onSkip={onboardingSkip}
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {showForm ? (
                  // Step 1: Show the form for gathering lawn data
                  <FreePlanForm onFormSubmit={onFormSubmit} />
                ) : (
                  // Step 2: Show the soft-gate conversion point after form submission
                  <ConversionPrompt 
                    onRegister={onRegister}
                    onQuickRegister={onQuickRegister}
                    onContinueWithoutRegistration={onContinueWithoutRegistration}
                  />
                )}
                
                <div className="mt-8">
                  {!formSubmitted && (
                    <>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-green-800 mb-2">Mit einem Konto erhalten Sie noch mehr</h2>
                        <p className="text-gray-600">Registrieren Sie sich, um auf alle Funktionen zuzugreifen</p>
                      </div>
                      <FeatureCallToAction />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default DesktopFreePlanView;
