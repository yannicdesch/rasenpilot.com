
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
  lawnPicture?: string; // Add lawn picture URL
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
  const [temporaryProfile, setTemporaryProfileState] = useState<LawnProfile | null>(() => {
    const savedTemporary = localStorage.getItem('temporaryLawnProfile');
    return savedTemporary ? JSON.parse(savedTemporary) : null;
  });
  
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
      
      console.log("Fetching profile from Supabase for user:", session.user.id);
      
      const { data: profileData, error } = await supabase
        .from('lawn_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
        
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
          hasPets: profileData.has_pets,
          lawnPicture: profileData.lawn_picture
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
      
      if (!isLoggedIn) {
        console.log("User not logged in, can't sync profile");
        return;
      }
      
      // If there's no profile to sync, check if we have a temporary profile to use
      if (!profile && temporaryProfile) {
        console.log("No profile found, using temporary profile for syncing:", temporaryProfile);
        setProfileState(temporaryProfile);
        localStorage.setItem('lawnProfile', JSON.stringify(temporaryProfile));
        
        // Continue with the newly set profile
      } else if (!profile) {
        console.log("No profile or temporary profile found, nothing to sync");
        return;
      }
      
      // At this point we should have a profile to sync
      const currentProfile = profile || temporaryProfile;
      if (!currentProfile) {
        console.log("Still no profile to sync after checks");
        return;
      }
      
      console.log("Syncing profile with Supabase:", currentProfile);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, can't sync profile");
        return;
      }
      
      // Check if profile already exists in Supabase
      const { data: existingProfiles } = await supabase
        .from('lawn_profiles')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (existingProfiles && existingProfiles.length > 0) {
        // Update existing profile
        console.log("Updating existing profile with ID:", existingProfiles[0].id);
        
        const { error } = await supabase
          .from('lawn_profiles')
          .update({
            zip_code: currentProfile.zipCode,
            grass_type: currentProfile.grassType,
            lawn_size: currentProfile.lawnSize,
            lawn_goal: currentProfile.lawnGoal,
            name: currentProfile.name,
            last_mowed: currentProfile.lastMowed,
            last_fertilized: currentProfile.lastFertilized,
            soil_type: currentProfile.soilType,
            has_children: currentProfile.hasChildren,
            has_pets: currentProfile.hasPets,
            lawn_picture: currentProfile.lawnPicture,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfiles[0].id);
          
        if (error) {
          console.error("Error updating profile in Supabase:", error);
          toast.error("Fehler", {
            description: "Ihre Rasendaten konnten nicht aktualisiert werden."
          });
          return;
        }
          
        // Update local profile with id
        const updatedProfile = {
          ...currentProfile,
          id: existingProfiles[0].id
        };
        
        setProfileState(updatedProfile);
        localStorage.setItem('lawnProfile', JSON.stringify(updatedProfile));
        
        toast.success("Profil gespeichert", {
          description: "Ihre Rasendaten wurden erfolgreich aktualisiert."
        });
      } else {
        // Create new profile
        console.log("Creating new profile for user:", session.user.id);
        
        const { data: newProfile, error } = await supabase
          .from('lawn_profiles')
          .insert({
            user_id: session.user.id,
            zip_code: currentProfile.zipCode,
            grass_type: currentProfile.grassType,
            lawn_size: currentProfile.lawnSize,
            lawn_goal: currentProfile.lawnGoal,
            name: currentProfile.name,
            last_mowed: currentProfile.lastMowed,
            last_fertilized: currentProfile.lastFertilized,
            soil_type: currentProfile.soilType,
            has_children: currentProfile.hasChildren,
            has_pets: currentProfile.hasPets,
            lawn_picture: currentProfile.lawnPicture,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error creating profile:", error);
          toast.error("Fehler", {
            description: "Ihre Rasendaten konnten nicht gespeichert werden."
          });
          return;
        }
          
        if (newProfile) {
          // Update local profile with id
          const updatedProfile = {
            ...currentProfile,
            id: newProfile.id
          };
          
          setProfileState(updatedProfile);
          localStorage.setItem('lawnProfile', JSON.stringify(updatedProfile));
          
          toast.success("Profil erstellt", {
            description: "Ihre Rasendaten wurden erfolgreich gespeichert."
          });
        }
      }
      
      // Clear temporary profile after successful sync
      clearTemporaryProfile();
    } catch (error) {
      console.error("Error syncing profile with Supabase:", error);
      toast.error("Fehler", {
        description: "Ihre Rasendaten konnten nicht gespeichert werden."
      });
    }
  };

  const setProfile = (newProfile: LawnProfile) => {
    console.log("Setting profile:", newProfile);
    setProfileState(newProfile);
    localStorage.setItem('lawnProfile', JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('lawnProfile');
  };
  
  const setTemporaryProfile = (newProfile: LawnProfile) => {
    console.log("Setting temporary profile:", newProfile);
    setTemporaryProfileState(newProfile);
    localStorage.setItem('temporaryLawnProfile', JSON.stringify(newProfile));
  };
  
  const clearTemporaryProfile = () => {
    console.log("Clearing temporary profile");
    setTemporaryProfileState(null);
    localStorage.removeItem('temporaryLawnProfile');
  };

  const isProfileComplete = !!profile && !!profile.zipCode && !!profile.grassType && !!profile.lawnSize;

  useEffect(() => {
    // Check authentication status on mount
    checkAuthentication();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      console.log("Auth state changed:", event, "isLoggedIn:", isLoggedIn);
      
      // If user just signed in, sync profile
      if (event === 'SIGNED_IN') {
        if (profile) {
          // If there's already a profile in local storage, sync it
          await syncProfileWithSupabase();
        } else if (temporaryProfile) {
          // If there's a temporary profile, use it as the main profile and sync
          setProfile(temporaryProfile);
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
