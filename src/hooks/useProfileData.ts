
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  is_active?: boolean;
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
        
        // First set basic user data from auth
        const basicUserData: UserData = {
          id: authData.user.id,
          email: authData.user.email || '',
          name: authData.user.user_metadata?.name || authData.user.user_metadata?.full_name,
          avatar_url: authData.user.user_metadata?.avatar_url,
        };
        
        // Try to fetch additional profile data from profiles table
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, is_active, full_name, email')
            .eq('id', authData.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
          }

          if (profileData) {
            basicUserData.role = profileData.role || 'user';
            basicUserData.is_active = profileData.is_active ?? true;
            // Use profile name if available, otherwise fall back to auth metadata
            basicUserData.name = profileData.full_name || basicUserData.name;
            basicUserData.email = profileData.email || basicUserData.email;
          }
        } catch (profileErr) {
          console.warn('Could not fetch profile data, using auth data only:', profileErr);
        }
        
        console.log('useProfileData: User data loaded successfully:', basicUserData.email);
        setUser(basicUserData);
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
          // Small delay to ensure profile is created by trigger
          setTimeout(() => {
            if (isMounted) {
              loadUserData();
            }
          }, 100);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateUserProfile = async (updates: { name?: string }) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          name: updates.name, 
          full_name: updates.name 
        }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: updates.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile table update error:', profileError);
        // Don't throw here, as auth update succeeded
        toast.warning('Profil in Auth aktualisiert, aber Sync zur Datenbank fehlgeschlagen');
      }

      // Update local state
      setUser(prev => prev ? { ...prev, name: updates.name } : null);
      
      toast.success('Profil wurde erfolgreich aktualisiert');
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
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
