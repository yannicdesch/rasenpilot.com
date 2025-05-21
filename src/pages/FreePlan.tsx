
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { initializeGA } from '@/lib/analytics';
import { useFreePlan } from '@/hooks/useFreePlan';
import MobileFreePlanView from '@/components/free-plan/MobileFreePlanView';
import DesktopFreePlanView from '@/components/free-plan/DesktopFreePlanView';

const FreePlan = () => {
  const isMobile = useIsMobile();
  
  const {
    formSubmitted,
    showForm,
    handleFormSubmit,
    handleContinueWithoutRegistration,
    handleRegister,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleQuickRegister
  } = useFreePlan();
  
  useEffect(() => {
    // Initialize Google Analytics with your measurement ID
    initializeGA('G-MEASUREMENT-ID'); // Replace with your actual Google Analytics Measurement ID
  }, []);
  
  // For mobile devices, render only the onboarding wizard
  if (isMobile) {
    return (
      <MobileFreePlanView
        formSubmitted={formSubmitted}
        onRegister={handleRegister}
        onQuickRegister={handleQuickRegister}
        onContinueWithoutRegistration={handleContinueWithoutRegistration}
        onboardingComplete={handleOnboardingComplete}
        onboardingSkip={handleOnboardingSkip}
      />
    );
  }

  // Regular desktop view
  return (
    <DesktopFreePlanView
      formSubmitted={formSubmitted}
      showForm={showForm}
      onFormSubmit={handleFormSubmit}
      onRegister={handleRegister}
      onQuickRegister={handleQuickRegister}
      onContinueWithoutRegistration={handleContinueWithoutRegistration}
      onboardingComplete={handleOnboardingComplete}
      onboardingSkip={handleOnboardingSkip}
    />
  );
};

export default FreePlan;
