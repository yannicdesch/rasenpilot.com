
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { useLawn } from '@/context/LawnContext';
import FeatureCallToAction from '@/components/FeatureCallToAction';
import FreePlanForm from '@/components/FreePlanForm';
import ConversionPrompt from '@/components/ConversionPrompt';
import FreePlanHero from '@/components/FreePlanHero';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown } from 'lucide-react';
import OnboardingWizard from '@/components/OnboardingWizard';

const FreePlan = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { setTemporaryProfile } = useLawn();
  const navigate = useNavigate();
  
  const handleFormSubmit = (data: any) => {
    // Save the temporary profile in context
    setTemporaryProfile(data);
    
    // Show registration prompt instead of direct navigation
    setFormSubmitted(true);
  };

  // Handle navigation to free care plan when user chooses to continue without registration
  const handleContinueWithoutRegistration = () => {
    navigate('/free-care-plan');
  };

  // Handle navigation to registration page
  const handleRegister = () => {
    navigate('/auth', { state: { redirectTo: '/free-care-plan' } });
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsOpen(false);
    navigate('/free-care-plan');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <FreePlanHero />
        
        {/* Onboarding Wizard Collapsible */}
        <section className="py-6 bg-white border-b border-green-100">
          <div className="container mx-auto px-4">
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full border border-green-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="flex items-center justify-between p-4 bg-green-50">
                <h2 className="text-xl font-semibold text-green-800">Schritt-für-Schritt Anleitung</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="border-green-200">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="p-4">
                {!showOnboarding ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Erfahre, wie du deinen persönlichen Pflegeplan erstellen kannst. 
                      Folge der Schritt-für-Schritt Anleitung.
                    </p>
                    <Button 
                      onClick={() => setShowOnboarding(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Anleitung starten
                    </Button>
                  </div>
                ) : (
                  <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                    onSkip={handleOnboardingSkip}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>
        
        {/* Form Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            {!formSubmitted ? (
              // Step 1: Show the form for gathering lawn data
              <FreePlanForm onFormSubmit={handleFormSubmit} />
            ) : (
              // Step 2: Show the soft-gate conversion point after form submission
              <ConversionPrompt 
                onRegister={handleRegister}
                onContinueWithoutRegistration={handleContinueWithoutRegistration}
              />
            )}
            
            <div className="mt-8">
              {!formSubmitted && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-green-800 mb-2">Mit dem Premium-Konto erhältst du noch mehr</h2>
                    <p className="text-gray-600">Registriere dich, um auf alle Funktionen zuzugreifen</p>
                  </div>
                  <FeatureCallToAction />
                </>
              )}
            </div>
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

export default FreePlan;
