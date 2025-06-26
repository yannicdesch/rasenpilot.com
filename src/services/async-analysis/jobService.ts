
import { supabase } from '@/integrations/supabase/client';
import { AnalysisJob, AnalysisResultResponse } from './types';

export const createAnalysisJob = async (
  userId: string | undefined,
  imagePath: string,
  grassType?: string,
  lawnGoal?: string,
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    console.log('=== CREATING ANALYSIS JOB ===');
    console.log('User ID:', userId || 'anonymous');
    console.log('Image path:', imagePath);
    console.log('Grass type:', grassType || 'not specified');
    console.log('Lawn goal:', lawnGoal || 'not specified');
    console.log('Metadata:', metadata);
    
    console.log('Calling RPC function: create_analysis_job');
    const rpcParams = {
      p_user_id: userId || null,
      p_image_path: imagePath,
      p_grass_type: grassType || null,
      p_lawn_goal: lawnGoal || null,
      p_metadata: metadata
    };
    console.log('RPC parameters:', rpcParams);
    
    const { data: jobData, error: jobError } = await supabase.rpc('create_analysis_job', rpcParams);
    
    console.log('=== JOB CREATION RESPONSE ===');
    console.log('Job data:', jobData);
    console.log('Job error:', jobError);
    
    if (jobError) {
      console.error('=== JOB CREATION ERROR ===');
      console.error('Error message:', jobError.message);
      console.error('Error details:', jobError);
      throw new Error(`Job creation failed: ${jobError.message}`);
    }
    
    if (!jobData) {
      console.error('Job creation returned null/undefined');
      throw new Error('Job creation returned null/undefined');
    }
    
    console.log('=== JOB CREATION SUCCESS ===');
    console.log('Created job ID:', jobData);
    
    return jobData as string;
    
  } catch (error) {
    console.error('=== JOB SERVICE ERROR ===');
    console.error('Error in createAnalysisJob:', error);
    throw error;
  }
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
