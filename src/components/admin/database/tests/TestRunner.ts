
import { TestResultData } from './TestResult';
import { runBasicConnectionTest } from './ConnectionTest';
import { runDatabaseTablesTest } from './DatabaseTest';
import { runAuthenticationTest } from './AuthTest';
import { runStorageTest } from './StorageTest';
import { runAnalyticsTest } from './AnalyticsTest';
import { toast } from 'sonner';

export const runAllTests = async (
  addResult: (result: TestResultData) => void
): Promise<void> => {
  try {
    // Test 1: Basic Supabase Connection
    addResult({ name: 'Basic Connection', status: 'pending', message: 'Testing...' });
    const connectionResult = await runBasicConnectionTest();
    addResult(connectionResult);

    // Test 2: Database Tables Check
    addResult({ name: 'Database Tables', status: 'pending', message: 'Checking tables...' });
    const databaseResult = await runDatabaseTablesTest();
    addResult(databaseResult);

    // Test 3: Authentication System
    addResult({ name: 'Authentication', status: 'pending', message: 'Testing auth...' });
    const authResult = await runAuthenticationTest();
    addResult(authResult);

    // Test 4: Storage Buckets
    addResult({ name: 'Storage System', status: 'pending', message: 'Checking storage...' });
    const storageResults = await runStorageTest();
    storageResults.forEach(result => addResult(result));

    // Test 5: Analytics Tracking
    addResult({ name: 'Analytics System', status: 'pending', message: 'Testing analytics...' });
    const analyticsResult = await runAnalyticsTest();
    addResult(analyticsResult);

  } catch (error: any) {
    toast.error('Test execution failed', {
      description: error.message
    });
  }
};

export const showTestSummary = (results: TestResultData[]): void => {
  const successCount = results.filter(r => r.status === 'success').length;
  const totalTests = results.length;

  if (successCount === totalTests) {
    toast.success('All systems operational!', {
      description: 'Supabase connection and all services are working properly.'
    });
  } else if (successCount > totalTests / 2) {
    toast.warning('Partial functionality', {
      description: `${successCount}/${totalTests} tests passed. Some features may need attention.`
    });
  } else {
    toast.error('Connection issues detected', {
      description: 'Multiple system failures detected. Please check configuration.'
    });
  }
};
