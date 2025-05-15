import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLawn } from '@/context/LawnContext';
import MainNavigation from '@/components/MainNavigation';
import { Mail, UserRound, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarUpload from '@/components/AvatarUpload';
import PasswordChange from '@/components/PasswordChange';
import AccountDeletion from '@/components/AccountDeletion';
import NotificationSettings from '@/components/NotificationSettings';
import ActivityHistory from '@/components/ActivityHistory';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import SocialConnections from '@/components/SocialConnections';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile, syncProfileWithSupabase, temporaryProfile, setProfile, clearTemporaryProfile } = useLawn();
  const [activeTab, setActiveTab] = useState('account');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    }
  });

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data?.user) {
        console.log("No authenticated user found, redirecting to auth");
        navigate('/auth');
        return;
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
      });
      
      form.reset({
        name: data.user.user_metadata?.name || '',
        email: data.user.email || '',
      });
      
      // If there's temporary profile data, save it to the user profile
      if (temporaryProfile) {
        console.log('Temporary profile found in Profile page, saving to user profile:', temporaryProfile);
        
        // Create a merged profile by combining existing profile with temporary profile
        const updatedProfile = {
          ...(profile || {}), // Ensure we have an object even if profile is null
          ...temporaryProfile,
          // Ensure these fields are included from temporaryProfile if they exist
          zipCode: temporaryProfile.zipCode || profile?.zipCode || '',
          grassType: temporaryProfile.grassType || profile?.grassType || '',
          lawnSize: temporaryProfile.lawnSize || profile?.lawnSize || '',
          lawnGoal: temporaryProfile.lawnGoal || profile?.lawnGoal || '',
          lawnPicture: temporaryProfile.lawnPicture || profile?.lawnPicture || '',
          hasChildren: temporaryProfile.hasChildren !== undefined ? temporaryProfile.hasChildren : profile?.hasChildren,
          hasPets: temporaryProfile.hasPets !== undefined ? temporaryProfile.hasPets : profile?.hasPets,
        };
        
        console.log("Updated profile to be set:", updatedProfile);
        
        // Update profile in LawnContext
        setProfile(updatedProfile);
        
        // Clear temporary profile after merging to avoid reapplying
        clearTemporaryProfile();
        
        // Sync with Supabase
        await syncProfileWithSupabase();
      }
      
      setLoading(false);
    };

    getUser();
  }, [navigate, form, temporaryProfile, profile, setProfile, syncProfileWithSupabase, clearTemporaryProfile]);

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: values.name }
      });

      if (error) throw error;

      if (user) {
        setUser({
          ...user,
          name: values.name
        });
      }

      toast.success('Profil wurde aktualisiert');
    } catch (error: any) {
      toast.error(`Fehler beim Aktualisieren des Profils: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Du wurdest erfolgreich abgemeldet');
    } catch (error: any) {
      toast.error(`Fehler beim Abmelden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    if (user) {
      setUser({
        ...user,
        avatar_url: url
      });
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#1A1F2C] text-white">
        <MainNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48 bg-gray-700" />
            <Skeleton className="h-32 w-64 bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1A1F2C] text-white">
      <MainNavigation />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Mein Profil</h1>
          <ThemeToggle />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Card */}
          <Card className="col-span-1 bg-gray-800/70 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">Mein Account</CardTitle>
              <CardDescription className="text-gray-300">Verwalte deine persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {user && (
                <AvatarUpload 
                  uid={user.id}
                  url={user.avatar_url || null}
                  onAvatarUpdate={handleAvatarUpdate}
                  name={user.name}
                  email={user.email}
                />
              )}
              <p className="mt-4 font-medium text-lg text-white">{user?.name || 'Kein Name'}</p>
              <p className="text-sm text-gray-300">{user?.email}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 border-gray-600 text-gray-200 hover:bg-gray-700"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Abmelden
              </Button>
            </CardFooter>
          </Card>
          
          {/* Main Content Card with Tabs */}
          <Card className="col-span-1 lg:col-span-2 bg-gray-800/70 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">Profileinstellungen</CardTitle>
              <CardDescription className="text-gray-300">Verwalte deine Einstellungen und Präferenzen</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full bg-gray-700">
                  <TabsTrigger value="account" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Profil</TabsTrigger>
                  <TabsTrigger value="password" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Passwort</TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Benachrichtigungen</TabsTrigger>
                  <TabsTrigger value="preferences" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Präferenzen</TabsTrigger>
                  <TabsTrigger value="connections" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Verbindungen</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="p-4 mt-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input placeholder="Dein Name" className="pl-10 bg-gray-700 border-gray-600 text-white" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">E-Mail</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input 
                                  placeholder="deine@email.de" 
                                  className="pl-10 bg-gray-700 border-gray-600 text-white" 
                                  disabled 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? 'Wird gespeichert...' : 'Speichern'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="password" className="p-4 mt-4 space-y-6">
                  <PasswordChange />
                  <div className="border-t border-gray-700 pt-6">
                    <AccountDeletion />
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="p-4 mt-4">
                  <NotificationSettings />
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <ActivityHistory />
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="p-4 mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2 text-gray-200">Sprache</h3>
                      <LanguageSelector />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="connections" className="p-4 mt-4">
                  <SocialConnections />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Lawn Data Card */}
          {profile && (
            <Card className="col-span-1 lg:col-span-3 bg-gray-800/70 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Meine Rasendaten</CardTitle>
                <CardDescription className="text-gray-300">Deine gespeicherten Raseneinstellungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-gray-300">PLZ</Label>
                    <p className="font-medium text-white">{profile.zipCode}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Grassorte</Label>
                    <p className="font-medium text-white">{profile.grassType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Rasengröße</Label>
                    <p className="font-medium text-white">{profile.lawnSize}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Rasenziel</Label>
                    <p className="font-medium text-white">{profile.lawnGoal}</p>
                  </div>
                  {profile.soilType && (
                    <div>
                      <Label className="text-gray-300">Bodentyp</Label>
                      <p className="font-medium text-white">{profile.soilType}</p>
                    </div>
                  )}
                  {profile.lastMowed && (
                    <div>
                      <Label className="text-gray-300">Zuletzt gemäht</Label>
                      <p className="font-medium text-white">{profile.lastMowed}</p>
                    </div>
                  )}
                  {profile.hasChildren !== undefined && (
                    <div>
                      <Label className="text-gray-300">Kinder nutzen den Rasen</Label>
                      <p className="font-medium text-white">{profile.hasChildren ? 'Ja' : 'Nein'}</p>
                    </div>
                  )}
                  {profile.hasPets !== undefined && (
                    <div>
                      <Label className="text-gray-300">Haustiere nutzen den Rasen</Label>
                      <p className="font-medium text-white">{profile.hasPets ? 'Ja' : 'Nein'}</p>
                    </div>
                  )}
                </div>
                
                {profile.lawnPicture && (
                  <div className="mt-6">
                    <Label className="text-gray-300 mb-2 block">Dein Rasen</Label>
                    <div className="rounded-lg overflow-hidden border border-gray-700 max-w-md">
                      <img 
                        src={profile.lawnPicture} 
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
                  className="w-full border-gray-600 text-gray-200 hover:bg-gray-700" 
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
