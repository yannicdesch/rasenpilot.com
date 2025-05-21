
// Define all shared types for the lawn context

export interface LawnProfile {
  id?: string;
  userId?: string;
  zipCode: string;
  grassType: string;
  lawnSize: string;
  lawnGoal: string;
  name?: string;
  lastMowed?: string;
  lastFertilized?: string;
  soilType?: string;
  hasChildren?: boolean;
  hasPets?: boolean;
  lawnPicture?: string;
  analysisResults?: any;
  analyzesUsed?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LawnTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}

export interface UserData {
  id: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  lastSignIn?: string;
}

export interface SubscriptionDetails {
  isSubscribed: boolean;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime' | null;
  expiresAt: string | null;
  analyzesRemaining?: number;
}

export interface LawnContextType {
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
  userData: UserData | null;
}
