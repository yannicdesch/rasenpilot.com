
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
    const compressedFile = await imageCompression(imageFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: false
    });
    
    console.log('Compressed file size:', compressedFile.size, 'bytes');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create unique file path
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = user ? `${user.id}/${fileName}` : `anonymous/${fileName}`;
    
    console.log('Uploading to path:', filePath);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(filePath, compressedFile);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    console.log('Upload successful:', uploadData);
    
    // Create analysis job
    const { data: jobData, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        user_id: user?.id,
        image_path: filePath,
        grass_type: grassType,
        lawn_goal: lawnGoal,
        status: 'pending',
        metadata: {
          original_size: imageFile.size,
          compressed_size: compressedFile.size,
          file_name: compressedFile.name
        }
      })
      .select()
      .single();
    
    if (jobError) {
      console.error('Job creation error:', jobError);
      throw new Error(`Job creation failed: ${jobError.message}`);
    }
    
    console.log('Job created:', jobData);
    
    // Trigger background processing
    await supabase.functions.invoke('start-analysis', {
      body: { jobId: jobData.id }
    });
    
    return {
      success: true,
      jobId: jobData.id
    };
    
  } catch (error) {
    console.error('=== ASYNC ANALYSIS ERROR ===');
    console.error('Error details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Get analysis job status and result
export const getAnalysisResult = async (jobId: string): Promise<{
  success: boolean;
  job?: AnalysisJob;
  error?: string;
}> => {
  try {
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      job
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
  
  const poll = async () => {
    attempts++;
    
    if (attempts > maxAttempts) {
      clearInterval(intervalId);
      onError('Analysis timeout - please try again');
      return;
    }
    
    const result = await getAnalysisResult(jobId);
    
    if (!result.success || !result.job) {
      onError(result.error || 'Failed to get job status');
      clearInterval(intervalId);
      return;
    }
    
    const job = result.job;
    onUpdate(job);
    
    if (job.status === 'completed') {
      clearInterval(intervalId);
      onComplete(job);
    } else if (job.status === 'failed') {
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
      clearInterval(intervalId);
    }
  };
};
