
import { supabase } from '@/integrations/supabase/client';
import { LawnProfile, UserData } from '../types/lawn';
import { toast } from 'sonner';

// Cached user data to avoid repeated auth calls
let cachedUserData: UserData | null = null;
let lastAuthCheck = 0;
const AUTH_CACHE_DURATION = 30000; // 30 seconds

// Optimized user data fetching with caching
export const fetchUserData = async (): Promise<UserData | null> => {
  const now = Date.now();
  
  // Use cache if recent
  if (cachedUserData && (now - lastAuthCheck) < AUTH_CACHE_DURATION) {
    return cachedUserData;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      cachedUserData = null;
      return null;
    }
    
    console.log("Fetching user data for:", session.user.id);
    
    // Get profile data in a single query
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile fetch error:", profileError);
    }

    const userData: UserData = {
      id: session.user.id,
      email: session.user.email || '',
      role: profileData?.role || 'user',
      createdAt: session.user.created_at,
      lastSignIn: session.user.last_sign_in_at
    };
    
    cachedUserData = userData;
    lastAuthCheck = now;
    
    console.log("User data loaded:", userData);
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    cachedUserData = null;
    return null;
  }
};

// Optimized profile fetching with better error handling
export const fetchProfileFromSupabase = async (): Promise<LawnProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    console.log("Fetching profile from Supabase for user:", session.user.id);
    
    const { data: profileData, error } = await supabase
      .from('lawn_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data
      
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
      
    if (!profileData) {
      console.log("No profile found for user");
      return null;
    }

    // Convert from snake_case to camelCase
    const profile: LawnProfile = {
      id: profileData.id,
      userId: profileData.user_id,
      zipCode: profileData.zip_code || '',
      grassType: profileData.grass_type || '',
      lawnSize: profileData.lawn_size || '',
      lawnGoal: profileData.lawn_goal || '',
      name: profileData.name,
      lastMowed: profileData.last_mowed,
      lastFertilized: profileData.last_fertilized,
      soilType: profileData.soil_type,
      hasChildren: profileData.has_children || false,
      hasPets: profileData.has_pets || false,
      lawnPicture: profileData.lawn_picture,
      analysisResults: profileData.analysis_results,
      analyzesUsed: profileData.analyzes_used || 0,
      rasenproblem: profileData.rasenproblem,
      rasenbild: profileData.rasenbild
    };
    
    console.log("Profile loaded from Supabase:", profile);
    return profile;
  } catch (error) {
    console.error("Error fetching profile from Supabase:", error);
    return null;
  }
};

// Optimized sync with batched operations
export const syncProfileWithSupabase = async (
  profile: LawnProfile | null, 
  temporaryProfile: LawnProfile | null,
  isAuthenticated: boolean
): Promise<LawnProfile | null> => {
  if (!isAuthenticated) {
    console.log("User not logged in, can't sync profile");
    return null;
  }

  try {
    console.log("=== SYNCING PROFILE DATA ===");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No session found, can't sync profile");
      return null;
    }

    // Determine what profile to sync
    let profileToSync: LawnProfile | null = null;
    
    if (!profile && temporaryProfile) {
      profileToSync = { ...temporaryProfile };
    } else if (profile && temporaryProfile) {
      profileToSync = {
        ...profile,
        rasenproblem: temporaryProfile.rasenproblem || profile.rasenproblem,
        rasenbild: temporaryProfile.rasenbild || profile.rasenbild,
        analysisResults: temporaryProfile.analysisResults || profile.analysisResults,
        analyzesUsed: Math.max(temporaryProfile.analyzesUsed || 0, profile.analyzesUsed || 0),
        zipCode: profile.zipCode || temporaryProfile.zipCode,
        grassType: profile.grassType || temporaryProfile.grassType,
        lawnSize: profile.lawnSize || temporaryProfile.lawnSize,
        lawnGoal: profile.lawnGoal || temporaryProfile.lawnGoal,
        name: profile.name || temporaryProfile.name,
        soilType: profile.soilType || temporaryProfile.soilType,
        lastMowed: profile.lastMowed || temporaryProfile.lastMowed,
        lastFertilized: profile.lastFertilized || temporaryProfile.lastFertilized,
        hasChildren: profile.hasChildren ?? temporaryProfile.hasChildren,
        hasPets: profile.hasPets ?? temporaryProfile.hasPets,
      };
    } else if (profile) {
      profileToSync = profile;
    }

    if (!profileToSync) {
      console.log("No profile to sync");
      return null;
    }

    // Upsert operation for better performance
    const upsertData = {
      user_id: session.user.id,
      zip_code: profileToSync.zipCode || '',
      grass_type: profileToSync.grassType || '',
      lawn_size: profileToSync.lawnSize || '',
      lawn_goal: profileToSync.lawnGoal || '',
      name: profileToSync.name,
      last_mowed: profileToSync.lastMowed,
      last_fertilized: profileToSync.lastFertilized,
      soil_type: profileToSync.soilType,
      has_children: profileToSync.hasChildren || false,
      has_pets: profileToSync.hasPets || false,
      lawn_picture: profileToSync.lawnPicture,
      analysis_results: profileToSync.analysisResults,
      analyzes_used: profileToSync.analyzesUsed || 0,
      rasenproblem: profileToSync.rasenproblem,
      rasenbild: profileToSync.rasenbild,
      updated_at: new Date().toISOString()
    };

    const { data: upsertedProfile, error } = await supabase
      .from('lawn_profiles')
      .upsert(upsertData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting profile:", error);
      toast.error("Fehler beim Speichern", {
        description: "Ihre Rasendaten konnten nicht gespeichert werden."
      });
      return null;
    }

    const finalProfile: LawnProfile = {
      ...profileToSync,
      id: upsertedProfile.id
    };

    console.log("=== SYNC COMPLETED ===");
    return finalProfile;
  } catch (error) {
    console.error("Error syncing profile with Supabase:", error);
    toast.error("Synchronisierungsfehler", {
      description: "Ihre Rasendaten konnten nicht gespeichert werden."
    });
    return null;
  }
};

// Optimized auth check with caching
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const now = Date.now();
    
    // Use cached result if recent
    if (cachedUserData && (now - lastAuthCheck) < AUTH_CACHE_DURATION) {
      return true;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = !!session;
    
    if (isLoggedIn) {
      lastAuthCheck = now;
    } else {
      cachedUserData = null;
    }
    
    return isLoggedIn;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Clear cache on sign out
export const clearAuthCache = () => {
  cachedUserData = null;
  lastAuthCheck = 0;
};
