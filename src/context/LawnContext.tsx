import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  LawnProfile, 
  LawnTask, 
  UserData, 
  SubscriptionDetails,
  LawnContextType
} from '../types/lawn';
import { 
  fetchUserData, 
  fetchProfileFromSupabase, 
  syncProfileWithSupabase as syncProfile,
  checkAuthentication as checkAuth
} from '../utils/lawnProfileUtils';
import { checkSubscriptionStatus as checkStatus } from '../utils/subscriptionUtils';

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
  
  // User data
  const [userData, setUserData] = useState<UserData | null>(null);
  
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
  
  // Check authentication status and fetch user data
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const isLoggedIn = await checkAuth();
      setIsAuthenticated(isLoggedIn);
      
      // If user is logged in, fetch user data
      if (isLoggedIn) {
        const userData = await fetchUserData();
        if (userData) {
          setUserData(userData);
        }
        
        // If user is logged in but no profile exists, check for profile in Supabase
        if (!profile) {
          const fetchedProfile = await fetchProfileFromSupabase();
          if (fetchedProfile) {
            setProfileState(fetchedProfile);
            localStorage.setItem('lawnProfile', JSON.stringify(fetchedProfile));
          }
        }
      }
      
      return isLoggedIn;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };
  
  // Sync profile with Supabase
  const syncProfileWithSupabase = async () => {
    const updatedProfile = await syncProfile(profile, temporaryProfile, isAuthenticated);
    if (updatedProfile) {
      setProfileState(updatedProfile);
      localStorage.setItem('lawnProfile', JSON.stringify(updatedProfile));
      
      // Clear temporary profile after successful sync
      clearTemporaryProfile();
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

  // Check subscription status
  const checkSubscriptionStatus = async (): Promise<void> => {
    await checkStatus(isAuthenticated);
  };

  useEffect(() => {
    // Check authentication status on mount
    checkAuthentication();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      console.log("Auth state changed:", event, "isLoggedIn:", isLoggedIn);
      
      // If user just signed in, fetch user data and sync profile
      if (event === 'SIGNED_IN') {
        const userData = await fetchUserData();
        if (userData) {
          setUserData(userData);
        }
        
        if (profile) {
          // If there's already a profile in local storage, sync it
          await syncProfileWithSupabase();
        } else if (temporaryProfile) {
          // If there's a temporary profile, use it as the main profile and sync
          setProfile(temporaryProfile);
          await syncProfileWithSupabase();
        } else {
          // Otherwise, try to fetch profile from Supabase
          const fetchedProfile = await fetchProfileFromSupabase();
          if (fetchedProfile) {
            setProfileState(fetchedProfile);
            localStorage.setItem('lawnProfile', JSON.stringify(fetchedProfile));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear user data on sign out
        setUserData(null);
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
      checkSubscriptionStatus,
      userData
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

// Re-export types for easier imports elsewhere
export * from '../types/lawn';
