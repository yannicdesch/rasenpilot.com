
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

// Sync profile with Supabase
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
    
    // If there's no profile to sync, check if we have a temporary profile to use
    let currentProfile = profile;
    if (!profile && temporaryProfile) {
      console.log("No profile found, using temporary profile for syncing:", temporaryProfile);
      currentProfile = temporaryProfile;
    } else if (!profile) {
      console.log("No profile or temporary profile found, nothing to sync");
      return null;
    }
    
    // At this point we should have a profile to sync
    if (!currentProfile) {
      console.log("Still no profile to sync after checks");
      return null;
    }
    
    console.log("Syncing profile with Supabase:", currentProfile);
    
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
      
    let updatedProfile: LawnProfile = { ...currentProfile };
      
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
          analysis_results: currentProfile.analysisResults,
          analyzes_used: currentProfile.analyzesUsed,
          rasenproblem: currentProfile.rasenproblem,
          rasenbild: currentProfile.rasenbild,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfiles[0].id);
        
      if (error) {
        console.error("Error updating profile in Supabase:", error);
        toast.error("Fehler", {
          description: "Ihre Rasendaten konnten nicht aktualisiert werden."
        });
        return null;
      }
        
      // Update local profile with id
      updatedProfile = {
        ...currentProfile,
        id: existingProfiles[0].id
      };
      
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
          zip_code: currentProfile.zipCode || '',
          grass_type: currentProfile.grassType || '',
          lawn_size: currentProfile.lawnSize || '',
          lawn_goal: currentProfile.lawnGoal || '',
          name: currentProfile.name,
          last_mowed: currentProfile.lastMowed,
          last_fertilized: currentProfile.lastFertilized,
          soil_type: currentProfile.soilType,
          has_children: currentProfile.hasChildren,
          has_pets: currentProfile.hasPets,
          lawn_picture: currentProfile.lawnPicture,
          analysis_results: currentProfile.analysisResults,
          analyzes_used: currentProfile.analyzesUsed,
          rasenproblem: currentProfile.rasenproblem,
          rasenbild: currentProfile.rasenbild,
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
        return null;
      }
        
      if (newProfile) {
        // Update local profile with id
        updatedProfile = {
          ...currentProfile,
          id: newProfile.id
        };
        
        toast.success("Profil erstellt", {
          description: "Ihre Rasendaten wurden erfolgreich gespeichert."
        });
      }
    }
    
    return updatedProfile;
  } catch (error) {
    console.error("Error syncing profile with Supabase:", error);
    toast.error("Fehler", {
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
