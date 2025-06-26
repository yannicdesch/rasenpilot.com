
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from './imageCompression';
import { uploadImageToStorage } from './storageService';
import { createAnalysisJob } from './jobService';
import { startBackgroundProcessing } from './backgroundProcessor';
import { AnalysisStartResult } from './types';

export const startImageAnalysis = async (
  imageFile: File,
  grassType?: string,
  lawnGoal?: string
): Promise<AnalysisStartResult> => {
  try {
    console.log('=== STARTING ASYNC IMAGE ANALYSIS ===');
    
    // Compress the image
    const compressedFile = await compressImage(imageFile);
    
    // Get current user
    console.log('Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.id : 'anonymous', userError ? 'Error: ' + userError.message : 'Success');
    
    // Upload to storage
    const filePath = await uploadImageToStorage(compressedFile, user?.id);
    
    // Create analysis job
    const jobId = await createAnalysisJob(
      user?.id,
      filePath,
      grassType,
      lawnGoal,
      {
        original_size: imageFile.size,
        compressed_size: compressedFile.size,
        file_name: compressedFile.name
      }
    );
    
    // Start background processing
    await startBackgroundProcessing(jobId);
    
    console.log('Analysis started successfully, returning job ID:', jobId);
    
    return {
      success: true,
      jobId: jobId
    };
    
  } catch (error) {
    console.error('=== ASYNC ANALYSIS ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error object:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
