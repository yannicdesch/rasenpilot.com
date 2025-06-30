
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
    console.log('Starting image compression...');
    console.log('Original file size:', imageFile.size, 'bytes');
    const compressedFile = await compressImage(imageFile);
    console.log('Compressed file size:', compressedFile.size, 'bytes');
    console.log('Compression ratio:', ((compressedFile.size / imageFile.size) * 100).toFixed(1) + '%');
    
    // Get current user with extended timeout and better error handling
    console.log('Getting current user...');
    let user = null;
    
    try {
      console.log('Attempting to get session with 10 second timeout...');
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout after 10 seconds')), 10000)
      );
      
      const { data: sessionData, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      console.log('Session retrieval completed');
      console.log('Session data exists:', !!sessionData?.session);
      console.log('Session user exists:', !!sessionData?.session?.user);
      console.log('Session error:', sessionError?.message || 'none');
      
      if (sessionError) {
        console.warn('Session error (continuing as anonymous):', sessionError.message);
      } else if (sessionData?.session?.user) {
        user = sessionData.session.user;
        console.log('User authenticated:', user.id);
      } else {
        console.log('No active session, continuing as anonymous');
      }
    } catch (authError) {
      console.warn('Auth timeout or error (continuing as anonymous):', authError instanceof Error ? authError.message : 'Unknown error');
    }
    
    // Upload to storage with enhanced error handling
    console.log('Starting storage upload...');
    try {
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
      
      console.log('=== ANALYSIS ORCHESTRATION COMPLETE ===');
      console.log('Returning job ID:', jobId);
      
      return {
        success: true,
        jobId: jobId
      };
      
    } catch (storageError) {
      console.error('=== STORAGE ERROR ===');
      console.error('Storage error details:', storageError);
      
      // Check if it's a bucket not found error
      if (storageError instanceof Error && storageError.message.includes('bucket')) {
        return {
          success: false,
          error: 'Storage bucket not found. Please contact support to set up image storage.'
        };
      }
      
      // Check if it's a permission error
      if (storageError instanceof Error && storageError.message.includes('permission')) {
        return {
          success: false,
          error: 'Storage permission denied. Please check your account status.'
        };
      }
      
      throw storageError; // Re-throw for general error handling
    }
    
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
