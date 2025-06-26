import { supabase } from '@/integrations/supabase/client';
import imageCompression from 'browser-image-compression';

export interface AnalysisJob {
  id: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_path: string;
  grass_type?: string;
  lawn_goal?: string;
  metadata: Record<string, any>;
  result?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Upload image to Supabase Storage and create analysis job
export const startImageAnalysis = async (
  imageFile: File,
  grassType?: string,
  lawnGoal?: string
): Promise<{ success: boolean; jobId?: string; error?: string }> => {
  try {
    console.log('=== STARTING ASYNC IMAGE ANALYSIS ===');
    console.log('Original file size:', imageFile.size, 'bytes');
    
    // Compress the image
    console.log('Starting image compression...');
    const compressedFile = await imageCompression(imageFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: false
    });
    
    console.log('Compressed file size:', compressedFile.size, 'bytes');
    console.log('Compression ratio:', ((imageFile.size - compressedFile.size) / imageFile.size * 100).toFixed(1) + '%');
    
    // Get current user
    console.log('Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.id : 'anonymous', userError ? 'Error: ' + userError.message : 'Success');
    
    // Create unique file path
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = user ? `${user.id}/${fileName}` : `anonymous/${fileName}`;
    
    console.log('Uploading to path:', filePath);
    
    // Upload to Supabase Storage
    console.log('Starting storage upload...');
    console.log('Bucket: lawn-images, File path:', filePath, 'File size:', compressedFile.size);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(filePath, compressedFile);
    
    if (uploadError) {
      console.error('Upload error details:', uploadError);
      console.error('Upload error message:', uploadError.message);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    console.log('Upload successful:', uploadData);
    console.log('Upload path confirmed:', uploadData.path);
    
    // Create analysis job using RPC to bypass type issues
    console.log('Creating analysis job with RPC...');
    console.log('RPC parameters:', {
      p_user_id: user?.id || null,
      p_image_path: filePath,
      p_grass_type: grassType || null,
      p_lawn_goal: lawnGoal || null
    });
    
    const { data: jobData, error: jobError } = await supabase.rpc('create_analysis_job', {
      p_user_id: user?.id || null,
      p_image_path: filePath,
      p_grass_type: grassType || null,
      p_lawn_goal: lawnGoal || null,
      p_metadata: {
        original_size: imageFile.size,
        compressed_size: compressedFile.size,
        file_name: compressedFile.name
      }
    });
    
    if (jobError) {
      console.error('Job creation error details:', jobError);
      throw new Error(`Job creation failed: ${jobError.message}`);
    }
    
    console.log('Job created successfully with ID:', jobData);
    
    if (!jobData) {
      throw new Error('Job creation returned null/undefined');
    }
    
    // Trigger background processing with proper payload
    console.log('Invoking start-analysis function...');
    const functionPayload = { jobId: jobData };
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
    
    console.log('Analysis started successfully, returning job ID:', jobData);
    
    return {
      success: true,
      jobId: jobData as string
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

// Get analysis job status and result using RPC
export const getAnalysisResult = async (jobId: string): Promise<{
  success: boolean;
  job?: AnalysisJob;
  error?: string;
}> => {
  try {
    console.log('Getting analysis result for job:', jobId);
    const { data: job, error } = await supabase.rpc('get_analysis_job', {
      p_job_id: jobId
    });
    
    if (error) {
      console.error('Error getting job:', error);
      throw new Error(error.message);
    }
    
    console.log('Job status:', job ? (job as any).status : 'No job data');
    
    return {
      success: true,
      job: job as unknown as AnalysisJob
    };
    
  } catch (error) {
    console.error('Error getting analysis result:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Poll for job completion
export const pollJobStatus = (
  jobId: string,
  onUpdate: (job: AnalysisJob) => void,
  onComplete: (job: AnalysisJob) => void,
  onError: (error: string) => void
): () => void => {
  let intervalId: NodeJS.Timeout;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  
  console.log('Starting job polling for:', jobId);
  
  const poll = async () => {
    attempts++;
    console.log(`Polling attempt ${attempts}/${maxAttempts} for job:`, jobId);
    
    if (attempts > maxAttempts) {
      console.error('Polling timeout reached');
      clearInterval(intervalId);
      onError('Analysis timeout - please try again');
      return;
    }
    
    const result = await getAnalysisResult(jobId);
    
    if (!result.success || !result.job) {
      console.error('Failed to get job status:', result.error);
      onError(result.error || 'Failed to get job status');
      clearInterval(intervalId);
      return;
    }
    
    const job = result.job;
    console.log(`Job ${jobId} status: ${job.status}`);
    onUpdate(job);
    
    if (job.status === 'completed') {
      console.log('Job completed successfully');
      clearInterval(intervalId);
      onComplete(job);
    } else if (job.status === 'failed') {
      console.log('Job failed:', job.error_message);
      clearInterval(intervalId);
      onError(job.error_message || 'Analysis failed');
    }
  };
  
  // Start polling immediately
  poll();
  
  // Then poll every 5 seconds
  intervalId = setInterval(poll, 5000);
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      console.log('Stopping polling for job:', jobId);
      clearInterval(intervalId);
    }
  };
};
