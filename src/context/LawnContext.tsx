
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LawnProfile {
  zipCode: string;
  grassType: string;
  lawnSize: string;
  lawnGoal: string;
  lastMowed?: string;
  lastFertilized?: string;
  soilType?: string;
}

interface LawnContextType {
  profile: LawnProfile | null;
  setProfile: (profile: LawnProfile) => void;
  clearProfile: () => void;
  isProfileComplete: boolean;
}

const LawnContext = createContext<LawnContextType | undefined>(undefined);

export const LawnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<LawnProfile | null>(() => {
    const savedProfile = localStorage.getItem('lawnProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const setProfile = (newProfile: LawnProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('lawnProfile', JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('lawnProfile');
  };

  const isProfileComplete = !!profile && !!profile.zipCode && !!profile.grassType && !!profile.lawnSize;

  useEffect(() => {
    if (profile) {
      localStorage.setItem('lawnProfile', JSON.stringify(profile));
    }
  }, [profile]);

  return (
    <LawnContext.Provider value={{ profile, setProfile, clearProfile, isProfileComplete }}>
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
