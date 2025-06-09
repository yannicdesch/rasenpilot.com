
import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import { useLawn } from '@/context/LawnContext';
import { toast } from 'sonner';
import { generateCarePlan } from '@/services/lawnService';

const Dashboard = () => {
  const { profile, setProfile } = useLawn();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if profile has a zipCode but there is no care plan
    if (profile && profile.zipCode) {
      const savedTasks = localStorage.getItem('lawnTasks');
      if (!savedTasks) {
        console.log("Profile has zipCode but no care plan, generating one...");
        generateInitialCarePlan();
      }
    } else {
      // Check if we have a profile in localStorage
      const storedProfile = localStorage.getItem('lawnProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          console.log("Found stored profile, updating context:", parsedProfile);
          setProfile(parsedProfile);
        } catch (e) {
          console.error("Error parsing stored profile:", e);
        }
      }
    }
  }, [profile, setProfile]);
  
  const generateInitialCarePlan = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      await generateCarePlan(profile);
      console.log("Successfully generated initial care plan");
    } catch (error) {
      console.error("Error generating initial care plan:", error);
      toast.error("Fehler beim Erstellen des Pflegeplans");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <DashboardHeader profileName={profile?.name} />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mt-6">
            <div className="w-full md:w-2/3">
              <DashboardTabs 
                profile={profile}
                loading={loading}
                onGenerateCarePlan={generateInitialCarePlan}
              />
            </div>
            
            <DashboardSidebar />
          </div>
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
