
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { useLawn } from '@/context/LawnContext';
import FeatureCallToAction from '@/components/FeatureCallToAction';
import FreePlanForm from '@/components/FreePlanForm';
import ConversionPrompt from '@/components/ConversionPrompt';
import FreePlanHero from '@/components/FreePlanHero';

const FreePlan = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <FreePlanHero />
        
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
