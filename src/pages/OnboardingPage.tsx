
import React from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import MainNavigation from '@/components/MainNavigation';

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      <OnboardingFlow />
    </div>
  );
};

export default OnboardingPage;
