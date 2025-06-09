
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
    let timeoutId: NodeJS.Timeout;

    const loadUserData = async () => {
      try {
        console.log('useProfileData: Starting to load user data...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.log('useProfileData: Loading timeout reached');
            setError('Authentication timeout');
            setLoading(false);
          }
        }, 3000);
        
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('useProfileData: Auth error:', authError);
          if (isMounted) {
            setError('Authentication failed');
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (!authData?.user) {
          console.log('useProfileData: No user found');
          if (isMounted) {
            setError('No authenticated user found');
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          console.log('useProfileData: User data loaded successfully:', authData.user.email);
          clearTimeout(timeoutId);
          setUser({
            id: authData.user.id,
            email: authData.user.email || '',
            name: authData.user.user_metadata?.name,
            avatar_url: authData.user.user_metadata?.avatar_url,
          });
          setError(null);
          setLoading(false);
        }
        
      } catch (err) {
        console.error('useProfileData: Error loading user data:', err);
        if (isMounted) {
          setError('Failed to load user data');
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
          clearTimeout(timeoutId);
          setUser(null);
          setError('No authenticated user found');
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            clearTimeout(timeoutId);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
