
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  is_active?: boolean;
}

export const useOptimizedProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('Not authenticated');
        setProfile(null);
        return;
      }

      console.log('Loading profile for user:', user.email);

      // Get profile data from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active, full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      // Use profile data if available, otherwise fall back to auth metadata
      const finalProfile: ProfileData = {
        id: user.id,
        email: profileData?.email || user.email || '',
        name: profileData?.full_name || user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        role: profileData?.role || 'user',
        is_active: profileData?.is_active ?? true,
      };

      console.log('Profile loaded successfully:', finalProfile);
      setProfile(finalProfile);
      
    } catch (err) {
      console.error('Profile loading error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError('Not authenticated');
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Small delay to ensure any triggers have completed
          setTimeout(() => {
            loadProfile();
          }, 500);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const updateProfile = async (updates: { name?: string }) => {
    if (!profile) {
      toast.error('No profile loaded');
      return false;
    }

    try {
      setLoading(true);
      console.log('Updating profile with:', updates);
      
      // Update auth metadata first
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          name: updates.name, 
          full_name: updates.name 
        }
      });

      if (authError) {
        console.error('Auth update error:', authError);
        throw authError;
      }

      console.log('Auth metadata updated successfully');

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: profile.id,
          email: profile.email,
          full_name: updates.name,
          role: profile.role || 'user',
          is_active: profile.is_active ?? true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile table update error:', profileError);
        toast.error(`Profile updated in auth but database sync failed: ${profileError.message}`);
      } else {
        console.log('Profile table updated successfully');
      }

      // Update local state immediately
      setProfile(prev => prev ? { ...prev, name: updates.name } : null);
      
      toast.success('Profil wurde erfolgreich aktualisiert');
      
      // Reload profile to ensure sync
      setTimeout(() => {
        loadProfile();
      }, 1000);
      
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(`Fehler beim Aktualisieren des Profils: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!profile) return;

    try {
      console.log('Updating avatar:', avatarUrl);
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (authError) {
        console.error('Avatar update error:', authError);
        throw authError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      console.log('Avatar updated successfully');
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error('Fehler beim Aktualisieren des Avatars');
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    reload: loadProfile
  };
};
