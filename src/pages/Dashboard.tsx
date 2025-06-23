
import React, { useState, useEffect } from 'react';
import { useLawn } from '@/context/LawnContext';
import { generateCarePlan } from '@/services/lawnService';
import { toast } from 'sonner';
import AuthenticationGate from '@/components/dashboard/AuthenticationGate';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { 
    profile, 
    temporaryProfile,
    isAuthenticated, 
    checkAuthentication,
    syncProfileWithSupabase 
  } = useLawn();
  
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Dashboard: Initializing authentication check...');
        
        // Quick session check first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            console.log('Dashboard: User is authenticated');
            // User is authenticated, proceed with app
            await checkAuthentication();
            
            // If we have temporary data, sync it
            if (temporaryProfile && !profile?.zipCode) {
              console.log("Dashboard: Syncing temporary profile data...");
              await syncProfileWithSupabase();
            }
          } else {
            console.log('Dashboard: No active session found');
          }
          
          setAuthLoading(false);
        }
      } catch (error) {
        console.error('Dashboard: Auth initialization error:', error);
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuthentication, syncProfileWithSupabase, temporaryProfile, profile]);

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

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
        <p className="text-green-800 text-sm">Dashboard wird geladen...</p>
      </div>
    );
  }

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
