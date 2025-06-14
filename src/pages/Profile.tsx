
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLawn } from '@/context/LawnContext';
import MainNavigation from '@/components/MainNavigation';
import { LogOut, User, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarUpload from '@/components/AvatarUpload';
import PasswordChange from '@/components/PasswordChange';
import AccountDeletion from '@/components/AccountDeletion';
import ProfileForm from '@/components/profile/ProfileForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useOptimizedProfile } from '@/hooks/useOptimizedProfile';

const Profile = () => {
  const navigate = useNavigate();
  const { profile: lawnProfile, setProfile, temporaryProfile, clearTemporaryProfile } = useLawn();
  const [activeTab, setActiveTab] = useState('profile');
  const { profile, loading, error, updateProfile, updateAvatar } = useOptimizedProfile();

  // Handle temporary profile data merge
  useEffect(() => {
    if (!loading && profile && temporaryProfile && !lawnProfile) {
      console.log('Profile: Merging temporary profile data');
      
      const updatedProfile = {
        ...temporaryProfile,
        userId: profile.id,
      };
      
      setProfile(updatedProfile);
      clearTemporaryProfile();
    }
  }, [loading, profile, temporaryProfile, lawnProfile, setProfile, clearTemporaryProfile]);

  // Handle authentication errors - redirect to auth
  useEffect(() => {
    if (!loading && (error || !profile)) {
      console.log('Profile: Authentication issue detected, redirecting to /auth');
      navigate('/auth', { replace: true });
    }
  }, [loading, error, profile, navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Du wurdest erfolgreich abgemeldet');
    } catch (error: any) {
      toast.error(`Fehler beim Abmelden: ${error.message}`);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <MainNavigation />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if there's an error or no user - the useEffect will handle redirect
  if (error || !profile) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNavigation />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600">Mein Profil</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Ihre persönlichen Daten und Raseneinstellungen</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="col-span-1 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <User size={20} />
                Mein Account
              </CardTitle>
              <CardDescription className="text-gray-600">Ihre persönlichen Informationen</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AvatarUpload 
                uid={profile.id}
                url={profile.avatar_url || null}
                onAvatarUpdate={updateAvatar}
                name={profile.name}
                email={profile.email}
              />
              <p className="mt-4 font-medium text-lg text-gray-800">{profile.name || 'Kein Name'}</p>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Abmelden
              </Button>
            </CardFooter>
          </Card>
          
          {/* Settings Card */}
          <Card className="col-span-1 lg:col-span-2 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Settings size={20} />
                Einstellungen
              </CardTitle>
              <CardDescription className="text-gray-600">Verwalten Sie Ihre Profil- und Sicherheitseinstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-full bg-gray-100">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    Profildaten
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    Sicherheit
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="p-4 mt-4">
                  <ProfileForm 
                    user={profile}
                    onSubmit={updateProfile}
                    loading={loading}
                  />
                </TabsContent>
                
                <TabsContent value="security" className="p-4 mt-4 space-y-6">
                  <PasswordChange />
                  <div className="border-t border-gray-200 pt-6">
                    <AccountDeletion />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Lawn Data Card */}
          {lawnProfile && (
            <Card className="col-span-1 lg:col-span-3 bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-green-600">Meine Rasendaten</CardTitle>
                <CardDescription className="text-gray-600">Ihre gespeicherten Raseneinstellungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {lawnProfile.zipCode && (
                    <div>
                      <Label className="text-gray-600">PLZ</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.zipCode}</p>
                    </div>
                  )}
                  {lawnProfile.grassType && (
                    <div>
                      <Label className="text-gray-600">Grassorte</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.grassType}</p>
                    </div>
                  )}
                  {lawnProfile.lawnSize && (
                    <div>
                      <Label className="text-gray-600">Rasengröße</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.lawnSize}</p>
                    </div>
                  )}
                  {lawnProfile.lawnGoal && (
                    <div>
                      <Label className="text-gray-600">Rasenziel</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.lawnGoal}</p>
                    </div>
                  )}
                  {lawnProfile.soilType && (
                    <div>
                      <Label className="text-gray-600">Bodentyp</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.soilType}</p>
                    </div>
                  )}
                  {lawnProfile.lastMowed && (
                    <div>
                      <Label className="text-gray-600">Zuletzt gemäht</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.lastMowed}</p>
                    </div>
                  )}
                  {lawnProfile.hasChildren !== undefined && (
                    <div>
                      <Label className="text-gray-600">Kinder nutzen den Rasen</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.hasChildren ? 'Ja' : 'Nein'}</p>
                    </div>
                  )}
                  {lawnProfile.hasPets !== undefined && (
                    <div>
                      <Label className="text-gray-600">Haustiere nutzen den Rasen</Label>
                      <p className="font-medium text-gray-800">{lawnProfile.hasPets ? 'Ja' : 'Nein'}</p>
                    </div>
                  )}
                </div>
                
                {lawnProfile.lawnPicture && (
                  <div className="mt-6">
                    <Label className="text-gray-600 mb-2 block">Dein Rasen</Label>
                    <div className="rounded-lg overflow-hidden border border-gray-200 max-w-md">
                      <img 
                        src={lawnProfile.lawnPicture} 
                        alt="Dein Rasen" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" 
                  onClick={() => navigate('/')}
                >
                  Rasendaten aktualisieren
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
