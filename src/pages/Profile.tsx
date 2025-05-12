
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const profileSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserData {
  id: string;
  email: string;
  name?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile, setProfile } = useLawn();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    }
  });

  useEffect(() => {
    const getUser = async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.error('Supabase is not configured properly');
        toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase!.auth.getUser();
      
      if (error || !data?.user) {
        navigate('/auth');
        return;
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name,
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
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase!.auth.updateUser({
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
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setLoading(true);
    try {
      await supabase!.auth.signOut();
      navigate('/auth');
      toast.success('Du wurdest erfolgreich abgemeldet');
    } catch (error: any) {
      toast.error(`Fehler beim Abmelden: ${error.message}`);
    } finally {
      setLoading(false);
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
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-green-800">Mein Profil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mein Account</CardTitle>
              <CardDescription>Verwalte deine persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
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
          
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Profil bearbeiten</CardTitle>
              <CardDescription>Aktualisiere deine persönlichen Informationen</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {profile && (
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle>Meine Rasendaten</CardTitle>
                <CardDescription>Deine gespeicherten Raseneinstellungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
