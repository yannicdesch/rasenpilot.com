
import { supabase } from '@/integrations/supabase/client';
import { TestResultData } from './TestResult';

export const runAnalyticsTest = async (): Promise<TestResultData> => {
  try {
    const testEvent = {
      category: 'test',
      action: 'connection_check',
      label: 'comprehensive_test',
      timestamp: new Date().toISOString()
    };

    const { error: analyticsError } = await supabase
      .from('events')
      .insert(testEvent);

    if (!analyticsError) {
      return {
        name: 'Analytics System',
        status: 'success',
        message: 'Analytics tracking functional',
        details: 'Successfully logged test event'
      };
    } else {
      return {
        name: 'Analytics System',
        status: 'error',
        message: 'Analytics tracking failed',
        details: analyticsError.message
      };
    }
  } catch (error: any) {
    return {
      name: 'Analytics System',
      status: 'error',
      message: 'Analytics system error',
      details: error.message
    };
  }
};
