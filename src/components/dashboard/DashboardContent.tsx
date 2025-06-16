
import React from 'react';
import ProfileCompletion from '@/components/profile/ProfileCompletion';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProfileCompletionAlert from '@/components/dashboard/ProfileCompletionAlert';
import AnalysisDataAlert from '@/components/dashboard/AnalysisDataAlert';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import MainNavigation from '@/components/MainNavigation';
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  profile: any;
  loading: boolean;
  showProfileCompletion: boolean;
  profileCompletion: number;
  hasAnalysisData: boolean;
  onShowProfileCompletion: () => void;
  onSetShowProfileCompletion: (show: boolean) => void;
  onGenerateCarePlan: () => Promise<void>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  profile,
  loading,
  showProfileCompletion,
  profileCompletion,
  hasAnalysisData,
  onShowProfileCompletion,
  onSetShowProfileCompletion,
  onGenerateCarePlan
}) => {
  if (showProfileCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => onSetShowProfileCompletion(false)}
                className="mb-4"
              >
                ← Zurück zum Dashboard
              </Button>
            </div>
            <ProfileCompletion />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <WelcomeHeader profileName={profile?.name} />

          <ProfileCompletionAlert 
            profileCompletion={profileCompletion}
            onShowProfileCompletion={onShowProfileCompletion}
          />

          <AnalysisDataAlert hasAnalysisData={hasAnalysisData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardTabs 
                profile={profile} 
                loading={loading}
                onGenerateCarePlan={onGenerateCarePlan}
              />
            </div>
            
            <DashboardSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
