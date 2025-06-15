
// Re-export all analytics functionality from the submodules
export { initializeGA } from './initialize';
export { createExecuteSqlFunction } from './sqlFunctions';
export { 
  testDirectTableAccess,
  testDatabaseConnection,
  checkAnalyticsTables,
  createAnalyticsTables,
  runDatabaseDiagnostics
} from './tableFunctions';
export { 
  trackPageView,
  trackEvent,
  getSupabaseConnectionInfo,
  createTestTable
} from './tracking';
export {
  trackRegistrationStart,
  trackRegistrationStep,
  trackRegistrationComplete,
  trackRegistrationAbandoned,
  trackFormInteraction
} from './trackingHelpers';

// Export test functions
export { testSupabaseConnection, runAllConnectionTests } from './connectionTests';

// Export new user journey tracking
export {
  trackPageEntry,
  trackPageExit,
  trackUserInteraction,
  trackConversion,
  trackDropOffRisk,
  trackFormAbandonment,
  setupDropOffDetection,
  getSessionId
} from './userJourneyTracking';
