
import { supabase } from '@/integrations/supabase/client';
import { TestResultData } from './TestResult';

export const runBasicConnectionTest = async (): Promise<TestResultData> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    return { 
      name: 'Basic Connection', 
      status: 'success', 
      message: 'Supabase client initialized successfully',
      details: `Session status: ${data.session ? 'Active' : 'No active session'}`
    };
  } catch (error: any) {
    return { 
      name: 'Basic Connection', 
      status: 'error', 
      message: 'Failed to connect to Supabase',
      details: error.message 
    };
  }
};
