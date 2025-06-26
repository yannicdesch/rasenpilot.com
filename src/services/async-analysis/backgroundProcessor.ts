
import { supabase } from '@/integrations/supabase/client';

export const startBackgroundProcessing = async (jobId: string): Promise<void> => {
  console.log('Invoking start-analysis function...');
  const functionPayload = { jobId };
  console.log('Function payload being sent:', JSON.stringify(functionPayload));
  
  const { data: functionResponse, error: functionError } = await supabase.functions.invoke('start-analysis', {
    body: functionPayload
  });
  
  console.log('Function response received:', functionResponse);
  console.log('Function error:', functionError);
  
  if (functionError) {
    console.error('Function error details:', functionError);
    throw new Error(`Failed to start analysis: ${functionError.message}`);
  }
  
  if (!functionResponse || !functionResponse.success) {
    console.error('Function returned unsuccessful response:', functionResponse);
    throw new Error(functionResponse?.error || 'Function returned unsuccessful response');
  }
};
