
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

      // Get profile data from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active, full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      setProfile({
        id: user.id,
        email: profileData?.email || user.email || '',
        name: profileData?.full_name || user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        role: profileData?.role || 'user',
        is_active: profileData?.is_active ?? true,
      });
      
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
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError('Not authenticated');
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setTimeout(() => {
            loadProfile();
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const updateProfile = async (updates: { name?: string }) => {
    if (!profile) return false;

    try {
      setLoading(true);
      
      // Update both auth metadata AND profiles table
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: updates.name, full_name: updates.name }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: updates.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (profileError) {
        console.error('Profile table update error:', profileError);
        // Don't throw here, as auth update succeeded
        toast.error('Profile updated in auth but failed to sync to database');
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, name: updates.name } : null);
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(`Failed to update profile: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!profile) return;

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (authError) throw authError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
    } catch (error) {
      console.error('Avatar update error:', error);
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
