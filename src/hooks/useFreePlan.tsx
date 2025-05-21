import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { toast } from "sonner";

export const useFreePlan = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { setTemporaryProfile, syncProfileWithSupabase, isAuthenticated } = useLawn();
  const navigate = useNavigate();
  
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
    // Store the fact that they've used their one-time free analysis
    localStorage.setItem('freeAnalysisUsed', 'true');
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
      zipCode: data.zipCode || '',
      grassType: data.grassType || '',
      lawnSize: data.lawnSize || '',
      lawnGoal: data.lawnGoal || '',
      hasChildren: data.hasChildren || false,
      hasPets: data.hasPets || false,
      lawnPicture: data.lawnPicture || '',
      analysisResults: data.analysisResults || null,
      analyzesUsed: data.analyzesUsed || 1
    });
    
    toast.success("Rasendaten gespeichert", {
      description: "Ihre Daten wurden erfolgreich gespeichert."
    });
    
    // Store that they've used their one-time free analysis
    localStorage.setItem('freeAnalysisUsed', 'true');
    
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

  // Check if free analysis has already been used
  useEffect(() => {
    const freeAnalysisUsed = localStorage.getItem('freeAnalysisUsed') === 'true';
    if (freeAnalysisUsed && !isAuthenticated) {
      toast.info("Du hast deine kostenlose Analyse bereits genutzt. Registriere dich für mehr Funktionen.", {
        duration: 5000,
      });
    }
  }, [isAuthenticated]);
  
  return {
    formSubmitted,
    showForm,
    handleFormSubmit,
    handleContinueWithoutRegistration,
    handleRegister,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleQuickRegister
  };
};
