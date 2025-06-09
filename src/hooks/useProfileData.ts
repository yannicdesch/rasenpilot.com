
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
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData?.user) {
          if (isMounted) {
            setError('No authenticated user found');
            setUser(null);
          }
          return;
        }
        
        if (isMounted) {
          setUser({
            id: authData.user.id,
            email: authData.user.email || '',
            name: authData.user.user_metadata?.name,
            avatar_url: authData.user.user_metadata?.avatar_url,
          });
        }
        
      } catch (err) {
        console.error('Error loading user data:', err);
        if (isMounted) {
          setError('Failed to load user data');
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
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && isMounted) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
            });
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
