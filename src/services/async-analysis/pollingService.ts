
import { AnalysisJob } from './types';
import { getAnalysisResult } from './jobService';

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
