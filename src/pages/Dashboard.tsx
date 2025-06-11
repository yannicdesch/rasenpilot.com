
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLawn } from '@/context/LawnContext';
import { generateCarePlan } from '@/services/lawnService';
import { toast } from 'sonner';
import MainNavigation from '@/components/MainNavigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import ProfileCompletion from '@/components/profile/ProfileCompletion';
import { User, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    // If user just registered and we have temporary data, sync it
    if (isAuthenticated && temporaryProfile && !profile?.zipCode) {
      console.log("User authenticated with temporary data, syncing...");
      syncProfileWithSupabase();
    }
  }, [isAuthenticated, temporaryProfile, profile]);

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

  const profileCompletion = calculateProfileCompletion();
  const hasAnalysisData = !!(profile?.rasenproblem || profile?.analysisResults);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Anmeldung erforderlich</h2>
                <p className="text-gray-600 mb-4">
                  Bitte melden Sie sich an, um auf Ihr Dashboard zuzugreifen.
                </p>
                <Button onClick={() => window.location.href = '/auth'}>
                  Anmelden
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showProfileCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowProfileCompletion(false)}
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
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Willkommen{profile?.name ? `, ${profile.name}` : ''}!
            </h1>
            <p className="text-gray-600">
              Hier ist Ihr persönliches Rasen-Dashboard
            </p>
          </div>

          {/* Profile Completion Alert */}
          {profileCompletion < 100 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 mb-2">
                      Profil vervollständigen ({profileCompletion}%)
                    </h3>
                    <Progress value={profileCompletion} className="mb-3 h-2" />
                    <p className="text-orange-700 mb-4">
                      Vervollständigen Sie Ihr Profil für bessere Empfehlungen und vollständige Wetterdaten.
                    </p>
                    <Button 
                      onClick={() => setShowProfileCompletion(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Profil vervollständigen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Data Status */}
          {hasAnalysisData && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">
                      KI-Analyse verfügbar
                    </h3>
                    <p className="text-green-700">
                      Ihre Rasenanalyse wurde erfolgreich übertragen und fließt in Ihre Empfehlungen ein.
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardTabs 
                profile={profile} 
                loading={loading}
                onGenerateCarePlan={handleGenerateCarePlan}
              />
            </div>
            
            <DashboardSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
