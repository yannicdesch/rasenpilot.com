import React, { useState, useEffect } from 'react';
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
import { ArrowRight, ChevronDown, Bell } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeGA } from '@/lib/analytics';

const FreePlan = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { setTemporaryProfile, syncProfileWithSupabase, isAuthenticated } = useLawn();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Initialize Google Analytics with your measurement ID
    initializeGA('G-MEASUREMENT-ID'); // Replace with your actual Google Analytics Measurement ID
  }, []);
  
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

  // Handle navigation to registration page with register tab active
  const handleRegister = () => {
    navigate('/auth?tab=register', { 
      state: { 
        redirectTo: '/free-care-plan'
      } 
    });
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
      // For non-authenticated users, always show the conversion prompt
      setFormSubmitted(true);
    }
  };

  const handleOnboardingSkip = () => {
    setShowForm(true);
  };

  // Handle quick registration with email
  const handleQuickRegister = (email: string) => {
    if (!email || !email.includes('@')) {
      toast.error('Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }
    
    // Navigate to auth page with pre-filled email and register tab active
    navigate('/auth?tab=register', { 
      state: { 
        redirectTo: '/free-care-plan',
        prefillEmail: email 
      } 
    });
  };

  // For mobile devices, render only the onboarding wizard
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        
        <main className="flex-grow pt-4 px-4">
          <div className="max-w-lg mx-auto">
            {!formSubmitted ? (
              <OnboardingWizard
                onComplete={handleOnboardingComplete}
                onSkip={handleOnboardingSkip}
              />
            ) : (
              <ConversionPrompt 
                onRegister={handleRegister}
                onQuickRegister={handleQuickRegister}
                onContinueWithoutRegistration={handleContinueWithoutRegistration}
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
  }

  // Regular desktop view remains unchanged
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
                  onComplete={handleOnboardingComplete}
                  onSkip={handleOnboardingSkip}
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {showForm ? (
                  // Step 1: Show the form for gathering lawn data
                  <FreePlanForm onFormSubmit={handleFormSubmit} />
                ) : (
                  // Step 2: Show the soft-gate conversion point after form submission
                  <ConversionPrompt 
                    onRegister={handleRegister}
                    onQuickRegister={handleQuickRegister}
                    onContinueWithoutRegistration={handleContinueWithoutRegistration}
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

export default FreePlan;
