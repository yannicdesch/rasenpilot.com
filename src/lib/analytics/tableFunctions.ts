
// Re-export all functions from their respective modules
export { 
  testDirectTableAccess,
  checkAnalyticsTables
} from './tableChecks';

export {
  testDatabaseConnection,
  runDatabaseDiagnostics 
} from './connectionUtils';

export { 
  createAnalyticsTables 
} from './tableCreation';
