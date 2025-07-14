
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
  rasenproblem?: string;
  rasenbild?: string;
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

export interface LawnContextType {
  profile: LawnProfile | null;
  setProfile: (profile: LawnProfile) => void;
  clearProfile: () => void;
  isProfileComplete: boolean;
  tasks: LawnTask[];
  setTasks: (tasks: LawnTask[]) => void;
}
