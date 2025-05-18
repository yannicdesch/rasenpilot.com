
// Re-export all analytics functionality from the submodules
export { initializeGA } from './initialize';
export { createExecuteSqlFunction } from './sqlFunctions';
export { 
  testDirectTableAccess,
  checkAnalyticsTables,
  createAnalyticsTables
} from './tableFunctions';
export { 
  trackPageView,
  trackEvent
} from './tracking';
export {
  trackRegistrationStart,
  trackRegistrationStep,
  trackRegistrationComplete,
  trackRegistrationAbandoned,
  trackFormInteraction
} from './trackingHelpers';
