
import { supabase } from '@/integrations/supabase/client';

export const startBackgroundProcessing = async (jobId: string): Promise<void> => {
  try {
    console.log('=== STARTING BACKGROUND PROCESSING ===');
    console.log('Job ID:', jobId);
    
    const functionPayload = { jobId };
    console.log('Function payload:', JSON.stringify(functionPayload));
    
    console.log('Invoking start-analysis edge function...');
    const { data: functionResponse, error: functionError } = await supabase.functions.invoke('start-analysis', {
      body: functionPayload
    });
    
    console.log('=== EDGE FUNCTION RESPONSE ===');
    console.log('Function response:', functionResponse);
    console.log('Function error:', functionError);
    
    if (functionError) {
      console.error('=== EDGE FUNCTION ERROR ===');
      console.error('Error message:', functionError.message);
      console.error('Error details:', functionError);
      throw new Error(`Failed to start analysis: ${functionError.message}`);
    }
    
    if (!functionResponse || !functionResponse.success) {
      console.error('=== EDGE FUNCTION UNSUCCESSFUL ===');
      console.error('Response:', functionResponse);
      throw new Error(functionResponse?.error || 'Function returned unsuccessful response');
    }
    
    console.log('=== BACKGROUND PROCESSING SUCCESS ===');
    console.log('Edge function completed successfully');
    
  } catch (error) {
    console.error('=== BACKGROUND PROCESSOR ERROR ===');
    console.error('Error in startBackgroundProcessing:', error);
    throw error;
  }
};
