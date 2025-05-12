
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
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
  const { profile } = useLawn();
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
      
      setLoading(false);
    };

    getUser();
  }, [navigate, form]);

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
      <div className="flex min-h-screen flex-col">
        <MainNavigation />
        <div className="flex-1 flex items-center justify-center">
          <p>Lade Profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <MainNavigation />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">Mein Profil</h1>
          <ThemeToggle />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mein Account</CardTitle>
              <CardDescription>Verwalte deine persönlichen Daten</CardDescription>
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
              <p className="mt-4 font-medium text-lg">{user?.name || 'Kein Name'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2" 
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Abmelden
              </Button>
            </CardFooter>
          </Card>
          
          {/* Main Content Card with Tabs */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Profileinstellungen</CardTitle>
              <CardDescription>Verwalte deine Einstellungen und Präferenzen</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="account">Profil</TabsTrigger>
                  <TabsTrigger value="password">Passwort</TabsTrigger>
                  <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
                  <TabsTrigger value="preferences">Präferenzen</TabsTrigger>
                  <TabsTrigger value="connections">Verbindungen</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="p-4 mt-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Dein Name" className="pl-10" {...field} />
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
                            <FormLabel>E-Mail</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="deine@email.de" 
                                  className="pl-10" 
                                  disabled 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Wird gespeichert...' : 'Speichern'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="password" className="p-4 mt-4 space-y-6">
                  <PasswordChange />
                  <div className="border-t pt-6">
                    <AccountDeletion />
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="p-4 mt-4">
                  <NotificationSettings />
                  <div className="mt-6 pt-6 border-t">
                    <ActivityHistory />
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="p-4 mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Sprache</h3>
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
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Meine Rasendaten</CardTitle>
                <CardDescription>Deine gespeicherten Raseneinstellungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>PLZ</Label>
                    <p className="font-medium">{profile.zipCode}</p>
                  </div>
                  <div>
                    <Label>Grassorte</Label>
                    <p className="font-medium">{profile.grassType}</p>
                  </div>
                  <div>
                    <Label>Rasengröße</Label>
                    <p className="font-medium">{profile.lawnSize}</p>
                  </div>
                  <div>
                    <Label>Rasenziel</Label>
                    <p className="font-medium">{profile.lawnGoal}</p>
                  </div>
                  {profile.soilType && (
                    <div>
                      <Label>Bodentyp</Label>
                      <p className="font-medium">{profile.soilType}</p>
                    </div>
                  )}
                  {profile.lastMowed && (
                    <div>
                      <Label>Zuletzt gemäht</Label>
                      <p className="font-medium">{profile.lastMowed}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
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
