
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
    
    // Get current user with timeout and retry logic
    console.log('Getting current user...');
    let user = null;
    let userError = null;
    
    try {
      // First try to get the session
      console.log('Attempting to get session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session response:', { sessionData: !!sessionData.session, sessionError });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        userError = sessionError;
      } else if (sessionData.session) {
        user = sessionData.session.user;
        console.log('User from session:', user ? user.id : 'No user');
      } else {
        console.log('No active session found');
      }
    } catch (authError) {
      console.error('Auth error:', authError);
      userError = authError;
    }
    
    console.log('Current user result:', user ? user.id : 'anonymous', userError ? 'Error: ' + userError.message : 'Success');
    
    // Upload to storage
    console.log('Starting storage upload...');
    const filePath = await uploadImageToStorage(compressedFile, user?.id);
    console.log('Storage upload completed, file path:', filePath);
    
    // Create analysis job
    console.log('Creating analysis job...');
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
    console.log('Analysis job created with ID:', jobId);
    
    // Start background processing
    console.log('Starting background processing...');
    await startBackgroundProcessing(jobId);
    console.log('Background processing started successfully');
    
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
