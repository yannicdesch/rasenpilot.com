import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

export interface LawnProfile {
  zipCode: string;
  grassType: string;
  lawnSize: string;
  lawnGoal: string;
  name?: string;
  lastMowed?: string;
  lastFertilized?: string;
  soilType?: string;
  id?: string;
  hasChildren?: boolean;
  hasPets?: boolean;
}

export interface LawnTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}

export interface SubscriptionDetails {
  isSubscribed: boolean;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime' | null;
  expiresAt: string | null;
  analyzesRemaining?: number;
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
  checkAuthentication: () => Promise<boolean>;
  subscriptionDetails: SubscriptionDetails;
  updateSubscriptionDetails: (details: Partial<SubscriptionDetails>) => void;
  checkSubscriptionStatus: () => Promise<void>;
}

const LawnContext = createContext<LawnContextType | undefined>(undefined);

export const LawnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<LawnProfile | null>(() => {
    const savedProfile = localStorage.getItem('lawnProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  
  // Temporary profile for non-registered users
  const [temporaryProfile, setTemporaryProfileState] = useState<LawnProfile | null>(null);
  
  // Task management
  const [tasks, setTasks] = useState<LawnTask[]>([]);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Subscription details
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails>({
    isSubscribed: false,
    plan: 'free',
    expiresAt: null,
    analyzesRemaining: 1
  });
  
  // Update subscription details
  const updateSubscriptionDetails = (details: Partial<SubscriptionDetails>) => {
    setSubscriptionDetails(prev => ({
      ...prev,
      ...details
    }));
  };
  
  // Check subscription status
  const checkSubscriptionStatus = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      // In a real app, this would call a Supabase function to check subscription status
      // For now we'll simulate a check
      console.log("Checking subscription status...");
      
      // For demo purposes, we'll just maintain the current subscription state
      // In a real app, you would update this based on the response from your backend
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };
  
  // Check authentication status
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      // If user is logged in but no profile exists, check for profile in Supabase
      if (isLoggedIn && !profile) {
        await fetchProfileFromSupabase();
      }
      
      return isLoggedIn;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };
  
  // Fetch profile from Supabase
  const fetchProfileFromSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profileData } = await supabase
        .from('lawn_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (profileData) {
        // Convert from snake_case to camelCase
        const newProfile: LawnProfile = {
          id: profileData.id,
          zipCode: profileData.zip_code,
          grassType: profileData.grass_type,
          lawnSize: profileData.lawn_size,
          lawnGoal: profileData.lawn_goal,
          name: profileData.name,
          lastMowed: profileData.last_mowed,
          lastFertilized: profileData.last_fertilized,
          soilType: profileData.soil_type,
          hasChildren: profileData.has_children,
          hasPets: profileData.has_pets
        };
        
        setProfileState(newProfile);
        localStorage.setItem('lawnProfile', JSON.stringify(newProfile));
        console.log("Profile loaded from Supabase:", newProfile);
      }
    } catch (error) {
      console.error("Error fetching profile from Supabase:", error);
    }
  };
  
  // Sync profile with Supabase
  const syncProfileWithSupabase = async () => {
    try {
      const isLoggedIn = await checkAuthentication();
      
      if (!isLoggedIn || !profile) return;
      
      console.log("Syncing profile with Supabase:", profile);
      
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
            has_children: profile.hasChildren,
            has_pets: profile.hasPets,
          })
          .eq('id', existingProfiles[0].id);
          
        // Update local profile with id
        setProfileState({
          ...profile,
          id: existingProfiles[0].id
        });
        
        toast.success("Profil gespeichert", {
          description: "Ihre Rasendaten wurden erfolgreich aktualisiert."
        });
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
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
            has_children: profile.hasChildren,
            has_pets: profile.hasPets,
          })
          .select()
          .single();
          
        if (newProfile) {
          // Update local profile with id
          setProfileState({
            ...profile,
            id: newProfile.id
          });
          
          toast.success("Profil erstellt", {
            description: "Ihre Rasendaten wurden erfolgreich gespeichert."
          });
        }
        
        if (error) {
          console.error("Error creating profile:", error);
          toast.error("Fehler", {
            description: "Ihre Rasendaten konnten nicht gespeichert werden."
          });
        }
      }
    } catch (error) {
      console.error("Error syncing profile with Supabase:", error);
      toast.error("Fehler", {
        description: "Ihre Rasendaten konnten nicht gespeichert werden."
      });
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
    checkAuthentication();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      // If user just signed in, sync profile
      if (event === 'SIGNED_IN') {
        if (profile) {
          // If there's already a profile in local storage, sync it
          await syncProfileWithSupabase();
        } else {
          // Otherwise, try to fetch profile from Supabase
          await fetchProfileFromSupabase();
        }
      }
      
      // Check subscription status when auth state changes
      if (session) {
        checkSubscriptionStatus();
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
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
      checkAuthentication,
      subscriptionDetails,
      updateSubscriptionDetails,
      checkSubscriptionStatus
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
