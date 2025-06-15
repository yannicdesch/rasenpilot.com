
import React, { useEffect } from 'react';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';

// Global component to be added to App.tsx for automatic tracking
const JourneyTracker: React.FC = () => {
  useJourneyTracking();
  
  useEffect(() => {
    console.log('🚀 Journey tracking initialized');
  }, []);
  
  return null; // This component doesn't render anything
};

export default JourneyTracker;
