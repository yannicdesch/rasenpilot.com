
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
