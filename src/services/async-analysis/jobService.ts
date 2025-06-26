
import { supabase } from '@/integrations/supabase/client';
import { AnalysisJob, AnalysisResultResponse } from './types';

export const createAnalysisJob = async (
  userId: string | undefined,
  imagePath: string,
  grassType?: string,
  lawnGoal?: string,
  metadata: Record<string, any> = {}
): Promise<string> => {
  console.log('Creating analysis job with RPC...');
  console.log('RPC parameters:', {
    p_user_id: userId || null,
    p_image_path: imagePath,
    p_grass_type: grassType || null,
    p_lawn_goal: lawnGoal || null
  });
  
  const { data: jobData, error: jobError } = await supabase.rpc('create_analysis_job', {
    p_user_id: userId || null,
    p_image_path: imagePath,
    p_grass_type: grassType || null,
    p_lawn_goal: lawnGoal || null,
    p_metadata: metadata
  });
  
  if (jobError) {
    console.error('Job creation error details:', jobError);
    throw new Error(`Job creation failed: ${jobError.message}`);
  }
  
  console.log('Job created successfully with ID:', jobData);
  
  if (!jobData) {
    throw new Error('Job creation returned null/undefined');
  }
  
  return jobData as string;
};

export const getAnalysisResult = async (jobId: string): Promise<AnalysisResultResponse> => {
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
