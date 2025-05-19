
// Re-export all analytics functionality from the submodules
export { initializeGA } from './initialize';
export { createExecuteSqlFunction } from './sqlFunctions';
export { 
  testDirectTableAccess,
  testDatabaseConnection as testSupabaseConnection,
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
