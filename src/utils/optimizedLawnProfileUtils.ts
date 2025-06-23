
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

    // Properly type the role with fallback
    const userRole: 'user' | 'admin' = (profileData?.role === 'admin') ? 'admin' : 'user';

    const userData: UserData = {
      id: session.user.id,
      email: session.user.email || '',
      role: userRole,
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

// Fixed profile fetching with proper single row handling
export const fetchProfileFromSupabase = async (): Promise<LawnProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    console.log("Fetching profile from Supabase for user:", session.user.id);
    
    // Use limit(1) and first() instead of single() to handle multiple rows gracefully
    const { data: profileData, error } = await supabase
      .from('lawn_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
      
    if (!profileData || profileData.length === 0) {
      console.log("No profile found for user");
      return null;
    }

    // Use the first (most recent) profile
    const profile = profileData[0];

    // Convert from snake_case to camelCase
    const lawnProfile: LawnProfile = {
      id: profile.id,
      userId: profile.user_id,
      zipCode: profile.zip_code || '',
      grassType: profile.grass_type || '',
      lawnSize: profile.lawn_size || '',
      lawnGoal: profile.lawn_goal || '',
      name: profile.name,
      lastMowed: profile.last_mowed,
      lastFertilized: profile.last_fertilized,
      soilType: profile.soil_type,
      hasChildren: profile.has_children || false,
      hasPets: profile.has_pets || false,
      lawnPicture: profile.lawn_picture,
      analysisResults: profile.analysis_results,
      analyzesUsed: profile.analyzes_used || 0,
      rasenproblem: profile.rasenproblem,
      rasenbild: profile.rasenbild
    };
    
    console.log("Profile loaded from Supabase:", lawnProfile);
    return lawnProfile;
  } catch (error) {
    console.error("Error fetching profile from Supabase:", error);
    return null;
  }
};

// Optimized sync with better error handling
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

    // Check if profile already exists
    const { data: existingProfiles } = await supabase
      .from('lawn_profiles')
      .select('id')
      .eq('user_id', session.user.id);

    // If multiple profiles exist, delete old ones
    if (existingProfiles && existingProfiles.length > 1) {
      console.log("Multiple profiles found, cleaning up duplicates");
      const { data: sortedProfiles } = await supabase
        .from('lawn_profiles')
        .select('id, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (sortedProfiles && sortedProfiles.length > 1) {
        const idsToDelete = sortedProfiles.slice(1).map(p => p.id);
        await supabase
          .from('lawn_profiles')
          .delete()
          .in('id', idsToDelete);
      }
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
