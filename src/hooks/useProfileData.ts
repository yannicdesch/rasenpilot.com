
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export const useProfileData = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        console.log('useProfileData: Starting to load user data...');
        setLoading(true);
        setError(null);
        
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (authError) {
          console.error('useProfileData: Auth error:', authError);
          setError('Authentifizierung fehlgeschlagen');
          setUser(null);
          setLoading(false);
          return;
        }

        if (!authData?.user) {
          console.log('useProfileData: No user found');
          setError('Kein angemeldeter Benutzer gefunden');
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('useProfileData: User data loaded successfully:', authData.user.email);
        setUser({
          id: authData.user.id,
          email: authData.user.email || '',
          name: authData.user.user_metadata?.name || authData.user.user_metadata?.full_name,
          avatar_url: authData.user.user_metadata?.avatar_url,
        });
        setError(null);
        
      } catch (err) {
        console.error('useProfileData: Error loading user data:', err);
        if (isMounted) {
          setError('Fehler beim Laden der Benutzerdaten');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useProfileData: Auth state changed:', event, session?.user?.email || 'no user');
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError('Kein angemeldeter Benutzer gefunden');
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url,
            });
            setError(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateUserProfile = async (updates: { name?: string }) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      if (user) {
        setUser({ ...user, ...updates });
      }

      toast.success('Profil wurde aktualisiert');
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Fehler beim Aktualisieren des Profils: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatar_url: avatarUrl });
    }
  };

  return {
    user,
    loading,
    error,
    updateUserProfile,
    updateAvatar
  };
};
