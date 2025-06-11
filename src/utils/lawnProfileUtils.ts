import { supabase } from '@/integrations/supabase/client';
import { LawnProfile, UserData } from '../types/lawn';
import { toast } from 'sonner';

// Fetch user data from Supabase
export const fetchUserData = async (): Promise<UserData | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    console.log("Fetching user data for:", session.user.id);
    
    // Get user information from Supabase auth
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      return null;
    }
    
    if (user) {
      // In a real application, you would fetch the user role from a users table
      // For demo purposes, we'll create mock admin users
      const isAdmin = user.user?.email?.includes('admin') || false;
      
      const userData: UserData = {
        id: user.user?.id || '',
        email: user.user?.email || '',
        role: isAdmin ? 'admin' : 'user',
        createdAt: user.user?.created_at,
        lastSignIn: session.user.last_sign_in_at
      };
      
      console.log("User data loaded:", userData);
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Fetch profile from Supabase
export const fetchProfileFromSupabase = async (): Promise<LawnProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    console.log("Fetching profile from Supabase for user:", session.user.id);
    
    const { data: profileData, error } = await supabase
      .from('lawn_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log("No profile found for user");
        return null;
      }
      console.error("Error fetching profile:", error);
      return null;
    }
      
    if (profileData) {
      // Convert from snake_case to camelCase
      const profile: LawnProfile = {
        id: profileData.id,
        userId: profileData.user_id,
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
        lawnPicture: profileData.lawn_picture,
        analysisResults: profileData.analysis_results,
        analyzesUsed: profileData.analyzes_used,
        rasenproblem: profileData.rasenproblem,
        rasenbild: profileData.rasenbild
      };
      
      console.log("Profile loaded from Supabase:", profile);
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching profile from Supabase:", error);
    return null;
  }
};

// Enhanced sync profile with Supabase that preserves all temporary data
export const syncProfileWithSupabase = async (
  profile: LawnProfile | null, 
  temporaryProfile: LawnProfile | null,
  isAuthenticated: boolean
): Promise<LawnProfile | null> => {
  try {
    if (!isAuthenticated) {
      console.log("User not logged in, can't sync profile");
      return null;
    }
    
    console.log("=== SYNCING PROFILE DATA ===");
    console.log("Current profile:", profile);
    console.log("Temporary profile:", temporaryProfile);
    
    // Determine what profile to sync
    let profileToSync: LawnProfile | null = null;
    
    if (!profile && temporaryProfile) {
      // No main profile, use temporary as base
      profileToSync = { ...temporaryProfile };
      console.log("Using temporary profile as base");
    } else if (profile && temporaryProfile) {
      // Merge temporary data into existing profile, preserving all data
      profileToSync = {
        ...profile,
        // Preserve analysis data from temporary profile (higher priority)
        rasenproblem: temporaryProfile.rasenproblem || profile.rasenproblem,
        rasenbild: temporaryProfile.rasenbild || profile.rasenbild,
        analysisResults: temporaryProfile.analysisResults || profile.analysisResults,
        analyzesUsed: Math.max(temporaryProfile.analyzesUsed || 0, profile.analyzesUsed || 0),
        // Fill in missing basic data from temporary profile
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
      console.log("Merged temporary data into existing profile");
    } else if (profile) {
      // Only main profile exists
      profileToSync = profile;
      console.log("Using existing profile");
    }
    
    if (!profileToSync) {
      console.log("No profile to sync");
      return null;
    }
    
    console.log("Profile to sync:", profileToSync);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No session found, can't sync profile");
      return null;
    }
    
    // Check if profile already exists in Supabase
    const { data: existingProfiles } = await supabase
      .from('lawn_profiles')
      .select('*')
      .eq('user_id', session.user.id);
      
    let updatedProfile: LawnProfile = { ...profileToSync };
      
    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing profile
      console.log("Updating existing profile with ID:", existingProfiles[0].id);
      
      const updateData = {
        zip_code: profileToSync.zipCode || '',
        grass_type: profileToSync.grassType || '',
        lawn_size: profileToSync.lawnSize || '',
        lawn_goal: profileToSync.lawnGoal || '',
        name: profileToSync.name,
        last_mowed: profileToSync.lastMowed,
        last_fertilized: profileToSync.lastFertilized,
        soil_type: profileToSync.soilType,
        has_children: profileToSync.hasChildren,
        has_pets: profileToSync.hasPets,
        lawn_picture: profileToSync.lawnPicture,
        analysis_results: profileToSync.analysisResults,
        analyzes_used: profileToSync.analyzesUsed || 0,
        rasenproblem: profileToSync.rasenproblem,
        rasenbild: profileToSync.rasenbild,
        updated_at: new Date().toISOString()
      };
      
      console.log("Updating with data:", updateData);
      
      const { error } = await supabase
        .from('lawn_profiles')
        .update(updateData)
        .eq('id', existingProfiles[0].id);
        
      if (error) {
        console.error("Error updating profile in Supabase:", error);
        toast.error("Fehler beim Speichern", {
          description: "Ihre Rasendaten konnten nicht aktualisiert werden."
        });
        return null;
      }
        
      updatedProfile = {
        ...profileToSync,
        id: existingProfiles[0].id
      };
      
      console.log("Profile updated successfully");
    } else {
      // Create new profile
      console.log("Creating new profile for user:", session.user.id);
      
      const insertData = {
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Creating with data:", insertData);
      
      const { data: newProfile, error } = await supabase
        .from('lawn_profiles')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating profile:", error);
        toast.error("Fehler beim Erstellen", {
          description: "Ihre Rasendaten konnten nicht gespeichert werden."
        });
        return null;
      }
        
      if (newProfile) {
        updatedProfile = {
          ...profileToSync,
          id: newProfile.id
        };
        
        console.log("Profile created successfully");
      }
    }
    
    console.log("=== SYNC COMPLETED ===");
    console.log("Final profile:", updatedProfile);
    
    return updatedProfile;
  } catch (error) {
    console.error("Error syncing profile with Supabase:", error);
    toast.error("Synchronisierungsfehler", {
      description: "Ihre Rasendaten konnten nicht gespeichert werden."
    });
    return null;
  }
};

// Check authentication status
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = !!session;
    return isLoggedIn;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
