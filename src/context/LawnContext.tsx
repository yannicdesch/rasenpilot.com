
import React, { createContext, useContext, useState } from 'react';
import { 
  LawnProfile, 
  LawnTask, 
  LawnContextType
} from '../types/lawn';

const LawnContext = createContext<LawnContextType | undefined>(undefined);

export const LawnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<LawnProfile | null>(() => {
    const savedProfile = localStorage.getItem('lawnProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  
  // Task management
  const [tasks, setTasks] = useState<LawnTask[]>([]);
  
  const setProfile = (newProfile: LawnProfile) => {
    console.log("Setting profile:", newProfile);
    setProfileState(newProfile);
    localStorage.setItem('lawnProfile', JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('lawnProfile');
  };

  const isProfileComplete = !!profile && !!profile.zipCode && !!profile.grassType && !!profile.lawnSize;

  return (
    <LawnContext.Provider value={{ 
      profile, 
      setProfile, 
      clearProfile, 
      isProfileComplete,
      tasks,
      setTasks
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
