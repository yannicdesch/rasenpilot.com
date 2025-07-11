
import { supabase } from '@/integrations/supabase/client';
import { startImageAnalysis } from './async-analysis/analysisOrchestrator';
import { getAnalysisResult } from './async-analysis/jobService';

export interface AnalysisJob {
  id: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_path: string;
  grass_type?: string;
  lawn_goal?: string;
  metadata?: Record<string, any>;
  result?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface AnalysisStartResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface AnalysisResultResponse {
  success: boolean;
  job?: AnalysisJob;
  error?: string;
}

// Export the main functions from the orchestrator
export { startImageAnalysis };

// Polling function to check job status
export const pollJobStatus = (
  jobId: string,
  onUpdate: (job: AnalysisJob) => void,
  onComplete: (job: AnalysisJob) => void,
  onError: (error: string) => void,
  pollInterval = 3000
): (() => void) => {
  let isPolling = true;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    if (!isPolling) return;

    try {
      console.log(`Polling job status for: ${jobId}`);
      const result = await getAnalysisResult(jobId);
      
      if (!result.success) {
        console.error('Failed to get job status:', result.error);
        onError(result.error || 'Failed to get job status');
        return;
      }

      if (!result.job) {
        console.error('No job data returned');
        onError('No job data returned');
        return;
      }

      const job = result.job;
      console.log(`Job ${jobId} status: ${job.status}`);
      
      // Call update callback
      onUpdate(job);

      // Check if job is complete
      if (job.status === 'completed') {
        console.log(`Job ${jobId} completed successfully`);
        onComplete(job);
        return;
      }

      if (job.status === 'failed') {
        console.log(`Job ${jobId} failed:`, job.error_message);
        onError(job.error_message || 'Analysis failed');
        return;
      }

      // Continue polling if still pending or processing
      if (job.status === 'pending' || job.status === 'processing') {
        timeoutId = setTimeout(poll, pollInterval);
      }

    } catch (error) {
      console.error('Error polling job status:', error);
      onError(error instanceof Error ? error.message : 'Polling error');
    }
  };

  // Start polling immediately
  poll();

  // Return cleanup function
  return () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

// Get job by ID
export const getJobById = async (jobId: string): Promise<AnalysisJob | null> => {
  try {
    const result = await getAnalysisResult(jobId);
    return result.success ? result.job || null : null;
  } catch (error) {
    console.error('Error getting job by ID:', error);
    return null;
  }
};
