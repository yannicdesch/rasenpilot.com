import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

export interface LawnProfile {
  zipCode: string;
  grassType: string;
  lawnSize: string;
  lawnGoal: string;
  name?: string;
  lastMowed?: string;
  lastFertilized?: string;
  soilType?: string;
  id?: string; // Added id field to track profiles in database
}

export interface LawnTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}

interface LawnContextType {
  profile: LawnProfile | null;
  setProfile: (profile: LawnProfile) => void;
  clearProfile: () => void;
  isProfileComplete: boolean;
  temporaryProfile: LawnProfile | null;
  setTemporaryProfile: (profile: LawnProfile) => void; 
  clearTemporaryProfile: () => void;
  syncProfileWithSupabase: () => Promise<void>;
  tasks: LawnTask[];
  setTasks: (tasks: LawnTask[]) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  checkAuthentication: () => Promise<boolean>;
  checkAdminRole: () => Promise<boolean>;
}

const LawnContext = createContext<LawnContextType | undefined>(undefined);

export const LawnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<LawnProfile | null>(() => {
    const savedProfile = localStorage.getItem('lawnProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  
  // Temporäres Profil für nicht-registrierte Benutzer
  const [temporaryProfile, setTemporaryProfileState] = useState<LawnProfile | null>(null);
  
  // Task management
  const [tasks, setTasks] = useState<LawnTask[]>([]);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Admin role state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Check authentication status - using useCallback to avoid dependency loops
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isLoggedIn = !!session;
      console.log("checkAuthentication - Session exists:", isLoggedIn);
      setIsAuthenticated(isLoggedIn);
      
      // If logged in, also check admin status
      if (isLoggedIn) {
        await checkAdminRole();
      }
      
      return isLoggedIn;
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);
  
  // Check if user has admin role - using useCallback to avoid dependency loops  
  const checkAdminRole = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("checkAdminRole - No session found");
        setIsAdmin(false);
        return false;
      }
      
      // Special case for yannic.desch@gmail.com
      const email = session.user.email?.toLowerCase();
      console.log("checkAdminRole - User email:", email);
      
      if (email === 'yannic.desch@gmail.com') {
        console.log('Special user detected in context, setting admin rights');
        setIsAdmin(true);
        
        // Always update the user metadata to ensure admin rights are set
        try {
          await supabase.auth.updateUser({
            data: { isAdmin: true }
          });
          console.log("Successfully updated admin rights for special user");
        } catch (err) {
          console.error("Error updating admin rights:", err);
        }
        
        return true;
      }
      
      const isUserAdmin = session.user.user_metadata?.isAdmin === true;
      console.log("checkAdminRole - Is admin from metadata:", isUserAdmin);
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
      return false;
    }
  }, []);
  
  // Sync profile with Supabase
  const syncProfileWithSupabase = async () => {
    try {
      const isLoggedIn = await checkAuthentication();
      
      if (!isLoggedIn || !profile) return;
      
      // Check if profile already exists in Supabase
      const { data: existingProfiles } = await supabase
        .from('lawn_profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id);
        
      if (existingProfiles && existingProfiles.length > 0) {
        // Update existing profile
        await supabase
          .from('lawn_profiles')
          .update({
            zip_code: profile.zipCode,
            grass_type: profile.grassType,
            lawn_size: profile.lawnSize,
            lawn_goal: profile.lawnGoal,
            name: profile.name,
            last_mowed: profile.lastMowed,
            last_fertilized: profile.lastFertilized,
            soil_type: profile.soilType,
          })
          .eq('id', existingProfiles[0].id);
          
        // Update local profile with id
        setProfileState({
          ...profile,
          id: existingProfiles[0].id
        });
      } else {
        // Create new profile
        const { data: newProfile } = await supabase
          .from('lawn_profiles')
          .insert({
            user_id: (await supabase.auth.getSession()).data.session?.user.id,
            zip_code: profile.zipCode,
            grass_type: profile.grassType,
            lawn_size: profile.lawnSize,
            lawn_goal: profile.lawnGoal,
            name: profile.name,
            last_mowed: profile.lastMowed,
            last_fertilized: profile.lastFertilized,
            soil_type: profile.soilType,
          })
          .select()
          .single();
          
        if (newProfile) {
          // Update local profile with id
          setProfileState({
            ...profile,
            id: newProfile.id
          });
        }
      }
    } catch (error) {
      console.error("Error syncing profile with Supabase:", error);
    }
  };

  const setProfile = (newProfile: LawnProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('lawnProfile', JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('lawnProfile');
  };
  
  const setTemporaryProfile = (newProfile: LawnProfile) => {
    setTemporaryProfileState(newProfile);
  };
  
  const clearTemporaryProfile = () => {
    setTemporaryProfileState(null);
  };

  const isProfileComplete = !!profile && !!profile.zipCode && !!profile.grassType && !!profile.lawnSize;

  useEffect(() => {
    // Check authentication status on mount
    console.log("LawnContext mounted, checking authentication...");
    checkAuthentication();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in context:", event, !!session);
      
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      // Check admin role on auth state change
      if (session) {
        console.log("Session exists in auth change, checking admin role");
        await checkAdminRole();
        
        // If user just signed in, sync profile
        if (event === 'SIGNED_IN' && profile) {
          console.log("User signed in, syncing profile");
          syncProfileWithSupabase();
        }
      } else {
        setIsAdmin(false);
        
        if (event === 'SIGNED_OUT') {
          toast.info('Sie wurden ausgeloggt');
        }
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkAuthentication, checkAdminRole, profile]);
  
  // When profile changes and user is authenticated, sync with Supabase
  useEffect(() => {
    if (isAuthenticated && profile) {
      syncProfileWithSupabase();
    }
  }, [isAuthenticated, profile]);

  return (
    <LawnContext.Provider value={{ 
      profile, 
      setProfile, 
      clearProfile, 
      isProfileComplete,
      temporaryProfile,
      setTemporaryProfile,
      clearTemporaryProfile,
      syncProfileWithSupabase,
      tasks,
      setTasks,
      isAuthenticated,
      isAdmin,
      checkAuthentication,
      checkAdminRole
    }}>
      {children}
    </LawnContext.Provider>
  );
};

export const useLawn = () => {
  const context = useContext(LawnContext);
  if (context === undefined) {
    throw new Error('useLawn must be used within a LawnProvider');
  }
  return context;
};
