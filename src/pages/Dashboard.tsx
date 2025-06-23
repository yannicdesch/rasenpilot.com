
import React, { useState, useEffect } from 'react';
import { useLawn } from '@/context/LawnContext';
import { generateCarePlan } from '@/services/lawnService';
import { toast } from 'sonner';
import AuthenticationGate from '@/components/dashboard/AuthenticationGate';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  const { 
    profile, 
    temporaryProfile,
    isAuthenticated, 
    checkAuthentication,
    syncProfileWithSupabase 
  } = useLawn();
  
  const [loading, setLoading] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Simple one-time authentication check
    const initializeDashboard = async () => {
      if (authInitialized) return; // Prevent multiple checks
      
      try {
        console.log('Dashboard: Checking authentication...');
        await checkAuthentication();
        
        // If we have temporary data and user is authenticated, sync it
        if (isAuthenticated && temporaryProfile && !profile?.zipCode) {
          console.log("Dashboard: Syncing temporary profile data...");
          await syncProfileWithSupabase();
        }
      } catch (error) {
        console.error('Dashboard: Initialization error:', error);
      } finally {
        setAuthInitialized(true);
      }
    };

    initializeDashboard();
  }, []); // Empty dependency array to run only once

  // Wait for auth initialization
  if (!authInitialized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
        <p className="text-green-800 text-sm">Dashboard wird geladen...</p>
      </div>
    );
  }

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const requiredFields = ['name', 'zipCode', 'grassType', 'lawnSize', 'lawnGoal'];
    const optionalFields = ['soilType', 'lastMowed', 'lastFertilized'];
    
    const requiredCompleted = requiredFields.filter(field => profile[field as keyof typeof profile]).length;
    const optionalCompleted = optionalFields.filter(field => profile[field as keyof typeof profile]).length;
    
    const requiredScore = (requiredCompleted / requiredFields.length) * 70;
    const optionalScore = (optionalCompleted / optionalFields.length) * 30;
    
    return Math.round(requiredScore + optionalScore);
  };

  const handleGenerateCarePlan = async () => {
    if (!profile) {
      toast.error('Bitte vervollständigen Sie zuerst Ihr Profil');
      return;
    }

    setLoading(true);
    try {
      await generateCarePlan(profile);
      toast.success('Pflegeplan wurde aktualisiert');
    } catch (error) {
      console.error('Error generating care plan:', error);
      toast.error('Fehler beim Erstellen des Pflegeplans');
    } finally {
      setLoading(false);
    }
  };

  // Show auth gate if not authenticated
  if (!isAuthenticated) {
    return <AuthenticationGate />;
  }

  const profileCompletion = calculateProfileCompletion();
  const hasAnalysisData = !!(profile?.rasenproblem || profile?.analysisResults);

  return (
    <DashboardContent
      profile={profile}
      loading={loading}
      showProfileCompletion={showProfileCompletion}
      profileCompletion={profileCompletion}
      hasAnalysisData={hasAnalysisData}
      onShowProfileCompletion={() => setShowProfileCompletion(true)}
      onSetShowProfileCompletion={setShowProfileCompletion}
      onGenerateCarePlan={handleGenerateCarePlan}
    />
  );
};

export default Dashboard;
