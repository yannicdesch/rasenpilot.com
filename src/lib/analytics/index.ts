
// Re-export all analytics functionality from the submodules
export { initializeGA } from './initialize';
export { createExecuteSqlFunction } from './sqlFunctions';
export { 
  testDirectTableAccess,
  testDatabaseConnection as testSupabaseConnection,
  checkAnalyticsTables,
  createAnalyticsTables
} from './tableFunctions';
export { 
  trackPageView,
  trackEvent,
  getSupabaseConnectionInfo
} from './tracking';
export {
  trackRegistrationStart,
  trackRegistrationStep,
  trackRegistrationComplete,
  trackRegistrationAbandoned,
  trackFormInteraction
} from './trackingHelpers';

