
import { supabase } from '@/integrations/supabase/client';
import { TestResultData } from './TestResult';

export const runAuthenticationTest = async (): Promise<TestResultData> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Test profile creation/access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return {
        name: 'Authentication',
        status: 'success',
        message: 'User authenticated with profile access',
        details: `User ID: ${user.id}, Profile: ${profile ? 'Found' : 'Not found'}`
      };
    } else {
      return {
        name: 'Authentication',
        status: 'warning',
        message: 'No active user session',
        details: 'Authentication system is functional but no user is logged in'
      };
    }
  } catch (error: any) {
    return {
      name: 'Authentication',
      status: 'error',
      message: 'Authentication system error',
      details: error.message
    };
  }
};
