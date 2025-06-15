
import { supabase } from '@/integrations/supabase/client';
import { TestResultData } from './TestResult';

export const runDatabaseTablesTest = async (): Promise<TestResultData> => {
  const tableChecks = [
    { table: 'profiles', description: 'User profiles' },
    { table: 'page_views', description: 'Analytics page views' },
    { table: 'events', description: 'Analytics events' },
    { table: 'lawn_profiles', description: 'Lawn profile data' }
  ];

  let tablesFound = 0;
  let tableDetails = [];

  for (const { table, description } of tableChecks) {
    try {
      let error = null;
      
      // Use specific table queries based on the table name
      if (table === 'profiles') {
        const result = await supabase.from('profiles').select('count').limit(1);
        error = result.error;
      } else if (table === 'page_views') {
        const result = await supabase.from('page_views').select('count').limit(1);
        error = result.error;
      } else if (table === 'events') {
        const result = await supabase.from('events').select('count').limit(1);
        error = result.error;
      } else if (table === 'lawn_profiles') {
        const result = await supabase.from('lawn_profiles').select('count').limit(1);
        error = result.error;
      }
      
      if (!error) {
        tablesFound++;
        tableDetails.push(`✓ ${table} (${description})`);
      } else {
        tableDetails.push(`✗ ${table} - ${error.message}`);
      }
    } catch (err) {
      tableDetails.push(`✗ ${table} - Connection error`);
    }
  }

  return {
    name: 'Database Tables',
    status: tablesFound === tableChecks.length ? 'success' : tablesFound > 0 ? 'warning' : 'error',
    message: `${tablesFound}/${tableChecks.length} tables accessible`,
    details: tableDetails.join('\n')
  };
};
