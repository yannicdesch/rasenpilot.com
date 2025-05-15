import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { useLawn } from '@/context/LawnContext';
import FeatureCallToAction from '@/components/FeatureCallToAction';
import FreePlanForm from '@/components/FreePlanForm';
import ConversionPrompt from '@/components/ConversionPrompt';
import FreePlanHero from '@/components/FreePlanHero';
import OnboardingWizard from '@/components/OnboardingWizard';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

const FreePlan = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { setTemporaryProfile, syncProfileWithSupabase, isAuthenticated } = useLawn();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleFormSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);
    
    // Save the temporary profile in context with the lawn picture
    setTemporaryProfile({
      zipCode: data.zipCode,
      grassType: data.grassType,
      lawnSize: data.lawnSize,
      lawnGoal: data.lawnGoal,
      lawnPicture: data.lawnPicture // Add the lawn picture
    });
    
    toast.success("Rasendaten gespeichert", {
      description: "Ihre Daten wurden erfolgreich gespeichert."
    });
    
    // If user is already authenticated, sync the profile with Supabase immediately
    if (isAuthenticated) {
      await syncProfileWithSupabase();
      navigate('/free-care-plan');
    } else {
      // Show registration prompt for non-authenticated users
      setFormSubmitted(true);
    }
  };

  // Handle navigation to free care plan when user chooses to continue without registration
  const handleContinueWithoutRegistration = () => {
    navigate('/free-care-plan');
  };

  // Handle navigation to registration page
  const handleRegister = () => {
    navigate('/auth', { state: { redirectTo: '/free-care-plan' } });
  };

  const handleOnboardingComplete = async (data: any) => {
    console.log("Onboarding completed with data:", data);
    
    // Ensure we set the temporary profile with ALL the onboarding data
    setTemporaryProfile({
      zipCode: data.zipCode,
      grassType: data.grassType,
      lawnSize: data.lawnSize,
      lawnGoal: data.lawnGoal,
      hasChildren: data.hasChildren,
      hasPets: data.hasPets,
      lawnPicture: data.lawnPicture,
    });
    
    toast.success("Rasendaten gespeichert", {
      description: "Ihre Daten wurden erfolgreich gespeichert."
    });
    
    // If user is already authenticated, sync profile with Supabase immediately
    if (isAuthenticated) {
      console.log("User is authenticated, syncing profile with Supabase");
      await syncProfileWithSupabase();
      navigate('/free-care-plan');
    } else {
      // For non-authenticated users, navigate to registration/login or continue without
      setFormSubmitted(true);
    }
  };

  const handleOnboardingSkip = () => {
    setShowForm(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <FreePlanHero />
        
        {/* CTA Button */}
        {!showForm && !formSubmitted && (
          <div className="container mx-auto px-4 -mt-6 md:-mt-8 mb-10">
            <div className="max-w-md mx-auto">
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg text-lg font-medium shadow-xl transition-all duration-200 flex items-center justify-center group"
              >
                <span className="mr-2">Gratis Pflegeplan erstellen</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              {/* Scroll indicator for mobile */}
              <div className="flex justify-center mt-6 md:hidden animate-bounce">
                <ChevronDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Section */}
        <section className="py-8 bg-white rounded-t-3xl shadow-inner">
          <div className="container mx-auto px-4">
            {!showForm && !formSubmitted ? (
              <div className="max-w-lg mx-auto">
                <OnboardingWizard
                  onComplete={handleOnboardingComplete}
                  onSkip={handleOnboardingSkip}
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
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

export default FreePlan;
