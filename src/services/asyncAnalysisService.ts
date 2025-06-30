
import { getAnalysisResult } from './async-analysis/jobService';
import { AnalysisJob } from './async-analysis/types';
import { AIAnalysisResult } from './aiAnalysisService';

export { startImageAnalysis } from './async-analysis/analysisOrchestrator';
export type { AnalysisJob };

export const pollJobStatus = (
  jobId: string,
  onUpdate: (job: AnalysisJob) => void,
  onComplete: (job: AnalysisJob) => void,
  onError: (error: string) => void
): (() => void) => {
  let isPolling = true;
  let pollCount = 0;
  const maxPolls = 60; // 5 minutes with 5-second intervals
  
  const poll = async () => {
    if (!isPolling) return;
    
    try {
      pollCount++;
      console.log(`Polling job ${jobId}, attempt ${pollCount}/${maxPolls}`);
      
      const result = await getAnalysisResult(jobId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get job status');
      }
      
      if (!result.job) {
        throw new Error('No job data returned');
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
      
      // Check for timeout
      if (pollCount >= maxPolls) {
        console.log(`Job ${jobId} polling timed out after ${maxPolls} attempts`);
        onError('Analysis timed out. Please try again.');
        return;
      }
      
      // Continue polling
      if (isPolling) {
        setTimeout(poll, 5000); // Poll every 5 seconds
      }
      
    } catch (error) {
      console.error(`Error polling job ${jobId}:`, error);
      onError(error instanceof Error ? error.message : 'Unknown polling error');
    }
  };
  
  // Start polling
  setTimeout(poll, 1000); // Start after 1 second
  
  // Return cleanup function
  return () => {
    console.log(`Stopping polling for job ${jobId}`);
    isPolling = false;
  };
};
